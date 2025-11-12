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
  txType: z.string().nullable().optional(),
});

export const SnapshotProposedTransactionSchema = z.object({
  txHash: z.string(),
  timestamp: z.string(),
  fee: z.string(),
  feeRate: z.string(),
  size: z.string(),
  txType: z.string().nullable().optional(),
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
  txType: z.string().nullable().optional(),
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
  pendingTransactionCount: z.number(),
  proposedTransactionCount: z.number(),
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

// TX Pool Info Schema
export const TxPoolInfoResponseSchema = z.object({
  data: z.object({
    pending: z.string(), // hex string
    proposed: z.string(), // hex string
    orphan: z.string(), // hex string
    total_tx_size: z.string(), // hex string
    total_tx_cycles: z.string(), // hex string
    min_fee_rate: z.string(), // hex string
    last_txs_updated_at: z.string(), // hex string
  }),
  timestamp: z.string(),
});

export type TxPoolInfoResponse = z.infer<typeof TxPoolInfoResponseSchema>;
