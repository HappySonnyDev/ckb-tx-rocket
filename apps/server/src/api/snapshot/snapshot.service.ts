import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CkbRpcService } from '../../core/ckb/ckb-rpc.service';

@Injectable()
export class SnapshotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ckbRpcService: CkbRpcService,
  ) {}

  async getLatestBlock() {
    return this.prisma.block.findFirst({
      orderBy: {
        number: 'desc',
      },
    });
  }
  // max = 138
  async getPendingTransactions(limit: number = 137) {
    return this.prisma.transaction.findMany({
      where: {
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
  // max = 15
  async getProposedTransactions(limit: number = 35) {
    return this.prisma.transaction.findMany({
      where: {
        status: 'PROPOSED',
      },
      include: {
        block: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async getConfirmedTransactions(blockNumber?: bigint, limit: number = 20) {
    const where: any = {
      status: 'CONFIRMED',
    };

    // If blockNumber is provided, get confirmed transactions from that specific block
    if (blockNumber !== undefined) {
      const block = await this.prisma.block.findUnique({
        where: {
          number: blockNumber,
        },
      });

      if (block) {
        where.blockId = block.id;
      }
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        block: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  calculateFeeRate(fee: bigint, size: bigint): string {
    if (size === BigInt(0)) {
      return '0';
    }

    // Fee rate = fee / size (in CKB per byte)
    // Converting to a more readable format with 2 decimal places
    const feeRate = Number(fee) / Number(size);
    return feeRate.toFixed(2);
  }

  async getPendingTransactionCount(): Promise<number> {
    return this.prisma.transaction.count({
      where: {
        status: 'PENDING',
      },
    });
  }

  async getProposedTransactionCount(): Promise<number> {
    return this.prisma.transaction.count({
      where: {
        status: 'PROPOSED',
      },
    });
  }

  /**
   * Get transaction pool info from CKB node via RPC
   * @returns Transaction pool information (all values are hex strings)
   */
  async getTxPoolInfo(): Promise<{
    pending: string; // hex string
    proposed: string; // hex string
    orphan: string; // hex string
    total_tx_size: string; // hex string
    total_tx_cycles: string; // hex string
    min_fee_rate: string; // hex string
    last_txs_updated_at: string; // hex string timestamp
  }> {
    return this.ckbRpcService.getTxPoolInfo();
  }
}
