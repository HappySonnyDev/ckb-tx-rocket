import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class SnapshotService {
  constructor(private readonly prisma: PrismaService) {}

  async getLatestBlock() {
    return this.prisma.block.findFirst({
      orderBy: {
        number: 'desc',
      },
    });
  }
  // max = 138
  async getPendingTransactions(limit: number = 135) {
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
  async getProposedTransactions(limit: number = 4) {
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
}
