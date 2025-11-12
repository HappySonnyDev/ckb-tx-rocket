import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NewTransactionEntry, Transaction } from '../ckb/ckb.interface';
import { PrismaService } from '../database/prisma.service';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

type TransactionClient = Prisma.TransactionClient;

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  private systemScripts: any;
  private networkType: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // 加载 system-scripts.json
    const systemScriptsPath = join(process.cwd(), 'system-scripts.json');
    this.systemScripts = JSON.parse(readFileSync(systemScriptsPath, 'utf-8'));
    // 使用 NETWORK 环境变量，与其他服务保持一致
    this.networkType = process.env.NETWORK || 'testnet';
  }

  /**
   * 根据交易的 cell_deps 的 txHash 识别交易类型
   * 遍历所有 cell_deps 直到找到匹配的类型
   */
  private identifyTransactionType(tx: Transaction): string | null {
    this.logger.log('Identifying transaction type');
    if (!tx.cell_deps || tx.cell_deps.length === 0) {
      return null;
    }

    const networkScripts = this.systemScripts[this.networkType];

    if (!networkScripts) {
      this.logger.warn(
        `Network type ${this.networkType} not found in system-scripts.json`,
      );
      return null;
    }

    // 遍历交易的所有 cell_deps
    for (const cellDep of tx.cell_deps) {
      const cellDepTxHash = cellDep.out_point.tx_hash;
      this.logger.log(`Checking cell_dep txHash: ${cellDepTxHash}`);

      // 遍历所有脚本类型，查找匹配的 txHash
      for (const [scriptType, scriptConfig] of Object.entries(networkScripts)) {
        const config = scriptConfig as any;
        if (config.script && config.script.cellDeps) {
          for (const cellDepWrapper of config.script.cellDeps) {
            if (cellDepWrapper.cellDep && cellDepWrapper.cellDep.outPoint) {
              if (cellDepWrapper.cellDep.outPoint.txHash === cellDepTxHash) {
                this.logger.log(`Transaction type identified: ${scriptType}`);
                return scriptType;
              }
            }
          }
        }
      }
    }

    this.logger.log('No matching transaction type found');
    return null;
  }

  async updateProposedTransactions(
    proposalIds: string[],
    prisma?: TransactionClient,
  ): Promise<string | null | undefined> {
    const prismaClient = prisma || this.prisma;
    if (proposalIds.length === 0) return;
    this.logger.debug(`Updating ${proposalIds.length} proposed transactions.`);

    // 使用重试机制处理数据库超时
    const maxRetries = 3;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await prismaClient.transaction.updateMany({
          where: {
            hash: { in: proposalIds },
            status: 'PENDING',
          },
          data: {
            status: 'PROPOSED',
          },
        });

        // 如果只有一个交易，查询并返回其txType
        if (proposalIds.length === 1) {
          const tx = await prismaClient.transaction.findUnique({
            where: { hash: proposalIds[0] },
            select: { txType: true },
          });
          return tx?.txType;
        }
        return;
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          this.logger.warn(
            `Failed to update proposed transactions (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error(
      `Failed to update proposed transactions after ${maxRetries} attempts`,
      lastError,
    );
    throw lastError || new Error('Failed to update proposed transactions');
  }

  private async clearTransactionRelations(
    txHash: string,
    prisma: TransactionClient,
  ) {
    await prisma.cellDep.deleteMany({ where: { txHash } });
    await prisma.headerDep.deleteMany({ where: { txHash } });
    await prisma.input.deleteMany({ where: { txHash } });
    await prisma.output.deleteMany({ where: { txHash } });
  }

  async processPendingTx(
    txEntry: NewTransactionEntry,
    prismaClient?: TransactionClient,
  ) {
    this.logger.log(`Processing pending tx `, txEntry);

    const tx = txEntry.transaction;

    // 识别交易类型
    const txType = this.identifyTransactionType(tx);
    if (txType) {
      this.logger.log(`Transaction ${tx.hash} identified as type: ${txType}`);
    }

    const processor = async (prisma: TransactionClient) => {
      const existingTx = await prisma.transaction.findUnique({
        where: { hash: tx.hash },
      });
      if (existingTx) {
        await this.clearTransactionRelations(tx.hash, prisma);
      }

      const txData = {
        status: 'PENDING' as const,
        fee: BigInt(txEntry.fee),
        size: BigInt(txEntry.size),
        cycles: BigInt(txEntry.cycles),
        version: parseInt(tx.version, 16),
        witnesses: tx.witnesses,
        txType: txType,
      };

      await prisma.transaction.upsert({
        where: { hash: tx.hash },
        create: { hash: tx.hash, ...txData },
        update: txData,
      });

      // await this.createTransactionRelations(tx, prisma);
    };

    if (prismaClient) {
      await processor(prismaClient);
    } else {
      await this.prisma.$transaction(processor);
    }

    return txType;
  }

  async processCommittedTx(
    tx: Transaction,
    blockId: number,
    prismaClient?: TransactionClient,
    isCellbase = false,
  ) {
    this.logger.debug(`Processing committed tx ${tx.hash}`);

    // 识别交易类型
    const txType = this.identifyTransactionType(tx);
    if (txType) {
      this.logger.log(`Transaction ${tx.hash} identified as type: ${txType}`);
    }

    const logic = async (prisma: TransactionClient) => {
      const existingTx = await prisma.transaction.findUnique({
        where: { hash: tx.hash },
      });
      if (existingTx) {
        await this.clearTransactionRelations(tx.hash, prisma);
      }

      const txData = {
        blockId,
        status: 'CONFIRMED' as const,
        fee: existingTx?.fee ?? BigInt(0),
        size: existingTx?.size ?? BigInt(0),
        cycles: existingTx?.cycles ?? BigInt(0),
        version: parseInt(tx.version, 16),
        witnesses: tx.witnesses,
        txType: txType,
      };

      if (existingTx) {
        await prisma.transaction.update({
          where: { hash: tx.hash },
          data: txData,
        });
      } else {
        await prisma.transaction.create({
          data: {
            hash: tx.hash,
            ...txData,
          },
        });
      }

      await this.createTransactionRelations(tx, prisma, isCellbase);
    };
    if (prismaClient) {
      await logic(prismaClient);
    } else {
      await this.prisma.$transaction(logic);
    }

    return txType;
  }

  private async createTransactionRelations(
    tx: Transaction,
    prisma: TransactionClient,
    isCellbase = false,
  ) {
    for (const dep of tx.cell_deps) {
      await prisma.cellDep.create({
        data: {
          txHash: tx.hash,
          outPointTxHash: dep.out_point.tx_hash,
          outPointIndex: parseInt(dep.out_point.index, 16),
          depType: dep.dep_type,
        },
      });
    }

    for (const hash of tx.header_deps) {
      await prisma.headerDep.create({
        data: { txHash: tx.hash, blockHash: hash },
      });
    }

    for (const [index, output] of tx.outputs.entries()) {
      const lockScript = await prisma.script.upsert({
        where: {
          codeHash_hashType_args: {
            codeHash: output.lock.code_hash,
            hashType: output.lock.hash_type,
            args: output.lock.args,
          },
        },
        create: {
          codeHash: output.lock.code_hash,
          hashType: output.lock.hash_type,
          args: output.lock.args,
        },
        update: {},
      });

      let typeScriptId: number | null = null;
      if (output.type) {
        const typeScript = await prisma.script.upsert({
          where: {
            codeHash_hashType_args: {
              codeHash: output.type.code_hash,
              hashType: output.type.hash_type,
              args: output.type.args,
            },
          },
          create: {
            codeHash: output.type.code_hash,
            hashType: output.type.hash_type,
            args: output.type.args,
          },
          update: {},
        });
        typeScriptId = typeScript.id;
      }

      await prisma.output.create({
        data: {
          txHash: tx.hash,
          index: index,
          capacity: BigInt(output.capacity),
          lockScriptId: lockScript.id,
          typeScriptId: typeScriptId,
          data: tx.outputs_data[index],
        },
      });
    }

    if (isCellbase) {
      this.logger.debug(`Skipping inputs for cellbase tx ${tx.hash}`);
      return;
    }

    for (const input of tx.inputs) {
      await prisma.input.create({
        data: {
          txHash: tx.hash,
          previousTxHash: input.previous_output.tx_hash,
          previousIndex: BigInt(input.previous_output.index),
          since: input.since,
        },
      });
    }
  }

  async deleteTransaction(txHash: string, prismaClient?: TransactionClient) {
    const logic = async (prisma: TransactionClient) => {
      const existingTx = await prisma.transaction.findUnique({
        where: { hash: txHash },
      });

      if (existingTx) {
        this.logger.warn(`Deleting transaction: ${txHash}`);
        await this.clearTransactionRelations(txHash, prisma);
        await prisma.transaction.delete({ where: { hash: txHash } });
      }
    };

    if (prismaClient) {
      await logic(prismaClient);
    } else {
      await this.prisma.$transaction(logic);
    }
  }
}
