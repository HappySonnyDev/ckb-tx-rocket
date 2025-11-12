import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { SnapshotService } from './snapshot.service';
import {
  SnapshotResponse,
  SnapshotResponseSchema,
  TxPoolInfoResponse,
  TxPoolInfoResponseSchema,
} from './snapshot.schemas';

@Controller('api/v1')
export class SnapshotController {
  constructor(private readonly snapshotService: SnapshotService) {}

  @Get('snapshot')
  async getCurrentSnapshot(): Promise<SnapshotResponse> {
    try {
      const [
        latestBlock,
        pendingTransactions,
        proposedTransactions,
        pendingTransactionCount,
        proposedTransactionCount,
      ] = await Promise.all([
        this.snapshotService.getLatestBlock(),
        this.snapshotService.getPendingTransactions(),
        this.snapshotService.getProposedTransactions(),
        this.snapshotService.getPendingTransactionCount(),
        this.snapshotService.getProposedTransactionCount(),
      ]);

      if (!latestBlock) {
        throw new HttpException('No blocks found', HttpStatus.NOT_FOUND);
      }

      // Get confirmed transactions from the latest block
      const confirmedTransactions =
        await this.snapshotService.getConfirmedTransactions(latestBlock.number);

      const response = {
        data: {
          latestBlock: {
            blockNumber: latestBlock.number.toString(),
            blockHash: latestBlock.hash,
            timestamp: latestBlock.timestamp.toISOString(),
            transactionCount: latestBlock.transactionCount,
          },
          pendingTransactions: pendingTransactions.map((tx) => ({
            txHash: tx.hash,
            timestamp: tx.createdAt.toISOString(),
            fee: tx.fee.toString(),
            feeRate: this.snapshotService.calculateFeeRate(tx.fee, tx.size),
            size: tx.size.toString(),
            txType: tx.txType,
          })),
          proposedTransactions: proposedTransactions.map((tx) => ({
            txHash: tx.hash,
            timestamp: tx.createdAt.toISOString(),
            fee: tx.fee.toString(),
            feeRate: this.snapshotService.calculateFeeRate(tx.fee, tx.size),
            size: tx.size.toString(),
            txType: tx.txType,
            context: {
              blockNumber: tx.block?.number.toString() || '0',
              blockHash: tx.block?.hash || '',
            },
          })),
          confirmedTransactions: confirmedTransactions.map((tx) => ({
            txHash: tx.hash,
            timestamp: tx.createdAt.toISOString(),
            fee: tx.fee.toString(),
            feeRate: this.snapshotService.calculateFeeRate(tx.fee, tx.size),
            size: tx.size.toString(),
            txType: tx.txType,
            context: {
              blockNumber: tx.block?.number.toString() || '0',
              blockHash: tx.block?.hash || '',
            },
          })),
          pendingTransactionCount,
          proposedTransactionCount,
        },
        timestamp: new Date().toISOString(),
      };

      return SnapshotResponseSchema.parse(response);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('tx-pool-info')
  async getTxPoolInfo(): Promise<TxPoolInfoResponse> {
    try {
      const txPoolInfo = await this.snapshotService.getTxPoolInfo();

      const response = {
        data: txPoolInfo,
        timestamp: new Date().toISOString(),
      };

      return TxPoolInfoResponseSchema.parse(response);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
