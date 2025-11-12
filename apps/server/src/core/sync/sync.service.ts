import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { CkbWebsocketService } from '../ckb/ckb-websocket.service';
import { PrismaService } from '../database/prisma.service';
import { BlockService } from './block.service';
import { TransactionService } from './transaction.service';
import { Block, NewTransactionEntry } from '../ckb/ckb.interface';
import { EventService } from '../../api/websocket/event.service';
import {
  BlockFinalizedPayload,
  TransactionPendingPayload,
  TransactionProposedPayload,
  TransactionRejectedPayload,
} from '../../api/websocket/websocket.types';

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);
  private lastBlockTimestamp: number | null = null;
  private lastBlockNumber: bigint | null = null;

  constructor(
    private readonly ckbWebsocketService: CkbWebsocketService,
    private readonly prisma: PrismaService,
    private readonly blockService: BlockService,
    private readonly transactionService: TransactionService,
    private readonly eventService: EventService,
  ) {}

  async onModuleInit() {
    this.logger.log('SyncService initialized. Subscribing to CKB events...');
    await Promise.all([
      this.subscribeToNewTipBlock(),
      this.subscribeToNewTransaction(),
      this.subscribeToProposedTransaction(),
      this.subscribeToRejectedTransaction(),
    ]);
  }

  /**
   * 计算手续费率 (shannon/byte)
   */
  private calculateFeeRate(fee: string, size: string): string {
    const feeNum = BigInt(fee);
    const sizeNum = BigInt(size);
    if (sizeNum === BigInt(0)) {
      return '0';
    }
    const feeRate = Number(feeNum) / Number(sizeNum);
    return feeRate.toFixed(2);
  }

  private async subscribeToNewTipBlock() {
    try {
      await this.ckbWebsocketService.subscribe(
        'new_tip_block',
        async (blockString: string) => {
          const receiveTime = Date.now();
          try {
            const block = JSON.parse(blockString) as Block;
            const blockNumber = BigInt(block.header.number);
            const blockTimestamp = parseInt(block.header.timestamp, 16);

            this.lastBlockTimestamp = blockTimestamp;
            this.lastBlockNumber = blockNumber;
            await this.prisma.$transaction(async (prisma) => {
              const txStartTime = Date.now();
              const savedBlock = await this.blockService.upsertBlock(
                block,
                prisma,
              );

              for (const tx of block.transactions) {
                await this.transactionService.deleteTransaction(
                  tx.hash,
                  prisma,
                );
              }

              const transactionSummaries = block.transactions.map((tx) => ({
                txHash: tx.hash,
              }));
              const blockPayload: BlockFinalizedPayload = {
                blockNumber: savedBlock.number.toString(),
                blockHash: savedBlock.hash,
                timestamp: savedBlock.timestamp.toISOString(),
                miner: savedBlock.miner,
                reward: savedBlock.reward.toString(),
                transactionCount: savedBlock.transactionCount,
                proposalsCount: savedBlock.proposalsCount,
                unclesCount: savedBlock.unclesCount,
                transactions: transactionSummaries,
              };
              this.eventService.emitBlockFinalized(blockPayload);

              const txEndTime = Date.now();
              const processingTime = txEndTime - txStartTime;
              const totalTime = txEndTime - receiveTime;

              this.logger.log(
                `✅ Block #${savedBlock.number} processed ` +
                  `| 💾 DB: ${processingTime}ms ` +
                  `| 📝 Txs: ${savedBlock.transactionCount} ` +
                  `| 📋 Proposals: ${savedBlock.proposalsCount} ` +
                  `| ⚡ Total: ${totalTime}ms`,
              );
            });
          } catch (error) {
            this.logger.error(
              `Failed to process new_tip_block: ${blockString}`,
              error,
            );
          }
        },
      );
      this.logger.log('Successfully subscribed to new_tip_block');
    } catch (error) {
      this.logger.error('Failed to subscribe to new_tip_block', error);
    }
  }

  private async subscribeToNewTransaction() {
    try {
      await this.ckbWebsocketService.subscribe(
        'new_transaction',
        async (txEntry: string) => {
          try {
            const parsedTx = JSON.parse(txEntry) as NewTransactionEntry;
            const txType =
              await this.transactionService.processPendingTx(parsedTx);

            const pendingPayload: TransactionPendingPayload = {
              txHash: parsedTx.transaction.hash,
              timestamp: new Date().toISOString(),
              fee: BigInt(parsedTx.fee).toString(), // Convert hex to decimal string
              feeRate: this.calculateFeeRate(parsedTx.fee, parsedTx.size),
              size: BigInt(parsedTx.size).toString(), // Convert hex to decimal string
              cycles: parsedTx.cycles,
              txType: txType,
            };
            this.eventService.emitTransactionPending(pendingPayload);

            this.logger.log(
              `New Pending Transaction: ${parsedTx.transaction.hash}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to process new_transaction: ${txEntry}`,
              error,
            );
          }
        },
      );
      this.logger.log('Successfully subscribed to new_transaction');
    } catch (error) {
      this.logger.error('Failed to subscribe to new_transaction', error);
    }
  }

  private async subscribeToProposedTransaction() {
    try {
      await this.ckbWebsocketService.subscribe(
        'proposed_transaction',
        async (txEntry: string) => {
          let parsedTx: NewTransactionEntry | null = null;
          try {
            parsedTx = JSON.parse(txEntry) as NewTransactionEntry;
            this.logger.log(parsedTx, 'parsedTxprosed');

            // 更新为proposed状态并获取txType
            const txType =
              await this.transactionService.updateProposedTransactions([
                parsedTx.transaction.hash,
              ]);

            // 发送 proposed 事件
            const proposedPayload: TransactionProposedPayload = {
              txHash: parsedTx.transaction.hash,
              timestamp: new Date().toISOString(),
              fee: BigInt(parsedTx.fee).toString(), // Convert hex to decimal string
              feeRate: this.calculateFeeRate(parsedTx.fee, parsedTx.size),
              size: BigInt(parsedTx.size).toString(), // Convert hex to decimal string
              txType: txType,
              context: {
                blockNumber: this.lastBlockNumber?.toString() || '0',
                blockHash: '',
              },
            };
            this.eventService.emitTransactionProposed(proposedPayload);

            this.logger.log(
              `Proposed Transaction Updated: ${parsedTx.transaction.hash}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to process proposed_transaction: ${txEntry}`,
            );
            this.logger.error(error);
            // 不抛出错误，继续处理其他交易
          }
        },
      );
      this.logger.log('Successfully subscribed to proposed_transaction');
    } catch (error) {
      this.logger.error('Failed to subscribe to proposed_transaction', error);
    }
  }

  private async subscribeToRejectedTransaction() {
    try {
      await this.ckbWebsocketService.subscribe(
        'rejected_transaction',
        async (txEntry: string) => {
          try {
            // CKB rejected_transaction 返回格式: [txEntry, rejectInfo]
            const parsed = JSON.parse(txEntry);
            this.logger.log(parsed, 'parsedcancel');
            // 检查是否是数组格式
            let txData: NewTransactionEntry;
            let rejectReason = 'Transaction rejected by mempool';

            if (Array.isArray(parsed)) {
              // 新格式: [txEntry, { type: "...", description: "..." }]
              txData = parsed[0] as NewTransactionEntry;
              if (parsed[1] && parsed[1].description) {
                rejectReason = parsed[1].description;
              }
            } else {
              // 旧格式: 直接是 txEntry
              txData = parsed as NewTransactionEntry;
            }

            if (!txData || !txData.transaction || !txData.transaction.hash) {
              this.logger.warn(`Invalid rejected transaction data: ${txEntry}`);
              return;
            }

            const rejectedPayload: TransactionRejectedPayload = {
              txHash: txData.transaction.hash,
              timestamp: new Date().toISOString(),
              reason: rejectReason,
            };
            this.eventService.emitTransactionRejected(rejectedPayload);

            await this.transactionService.deleteTransaction(
              txData.transaction.hash,
            );

            this.logger.warn(
              `❌ Rejected Transaction: ${txData.transaction.hash} | Reason: ${rejectReason}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to process rejected_transaction: ${txEntry}`,
              error,
            );
          }
        },
      );
      this.logger.log('Successfully subscribed to rejected_transaction');
    } catch (error) {
      this.logger.error('Failed to subscribe to rejected_transaction', error);
    }
  }
}
