import { z } from 'zod';

export const SnapshotLatestBlockSchema = z.object({
  blockNumber: z.string(),
  blockHash: z.string(),
  timestamp: z.string(),
  transactionCount: z.number(),
});

export const SnapshotTransactionSchema = z.object({
  txHash: z.string(),
  timestamp: z.string(),
  fee: z.string(),
  feeRate: z.string(),
  size: z.string(),
});

export const SnapshotProposedTransactionSchema = z.object({
  txHash: z.string(),
  timestamp: z.string(),
  fee: z.string(),
  feeRate: z.string(),
  size: z.string(),
  context: z.object({
    blockNumber: z.string(),
    blockHash: z.string(),
  }),
});

export const SnapshotConfirmedTransactionSchema = z.object({
  txHash: z.string(),
  timestamp: z.string(),
  fee: z.string(),
  feeRate: z.string(),
  size: z.string(),
  context: z.object({
    blockNumber: z.string(),
    blockHash: z.string(),
  }),
});

export const SnapshotDataSchema = z.object({
  latestBlock: SnapshotLatestBlockSchema,
  pendingTransactions: z.array(SnapshotTransactionSchema),
  proposedTransactions: z.array(SnapshotProposedTransactionSchema),
  confirmedTransactions: z.array(SnapshotConfirmedTransactionSchema),
});

export const SnapshotResponseSchema = z.object({
  data: SnapshotDataSchema,
  timestamp: z.string(),
});

export type SnapshotLatestBlock = z.infer<typeof SnapshotLatestBlockSchema>;
export type SnapshotTransaction = z.infer<typeof SnapshotTransactionSchema>;
export type SnapshotProposedTransaction = z.infer<
  typeof SnapshotProposedTransactionSchema
>;
export type SnapshotConfirmedTransaction = z.infer<
  typeof SnapshotConfirmedTransactionSchema
>;
export type SnapshotData = z.infer<typeof SnapshotDataSchema>;
export type SnapshotResponse = z.infer<typeof SnapshotResponseSchema>;
