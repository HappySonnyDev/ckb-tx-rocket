export interface ClientMessage {
  action: 'subscribe' | 'unsubscribe';
  channel: 'chain' | 'transactions';
}

export interface ServerMessage {
  channel: 'chain' | 'transactions';
  type: string;
  payload: any;
}

export type EventType =
  | 'block.finalized'
  | 'chain.reorg'
  | 'transaction.pending'
  | 'transaction.proposed'
  | 'transaction.confirmed'
  | 'transaction.rejected';

export interface BlockFinalizedPayload {
  blockNumber: string;
  blockHash: string;
  timestamp: string;
  miner: string;
  reward: string;
  transactionCount: number;
  proposalsCount: number;
  unclesCount: number;
  transactions: Array<{
    txHash: string;
  }>;
}

export interface TransactionPendingPayload {
  txHash: string;
  timestamp: string;
  fee: string;
  feeRate: string;
  size: string;
  cycles: string;
  txType?: string | null; // 交易类型
}

export interface TransactionProposedPayload {
  txHash: string;
  timestamp: string;
  fee?: string;
  feeRate?: string;
  size?: string;
  txType?: string | null;
  context: {
    blockNumber: string;
    blockHash: string;
  };
}

export interface TransactionConfirmedPayload {
  txHash: string;
  timestamp: string;
  fee?: string;
  feeRate?: string;
  size?: string;
  context: {
    blockNumber: string;
    blockHash: string;
    txIndexInBlock: number;
  };
  txType?: string | null; // 交易类型
}

export interface TransactionRejectedPayload {
  txHash: string;
  timestamp: string;
  reason: string;
}

export interface ChainReorgPayload {
  reorgDepth: number;
  newTip: {
    blockNumber: string;
    blockHash: string;
  };
  oldTip: {
    blockNumber: string;
    blockHash: string;
  };
}

export type ChannelType = 'chain' | 'transactions';

export interface ClientSubscription {
  clientId: string;
  channels: Set<ChannelType>;
}
