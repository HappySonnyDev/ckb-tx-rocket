import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ccc } from '@ckb-ccc/core';

@Injectable()
export class CkbRpcService implements OnModuleInit {
  private readonly logger = new Logger(CkbRpcService.name);
  private rpcClient: ccc.ClientJsonRpc;
  private ckbHttpUrl: string;

  constructor(private readonly configService: ConfigService) {
    // Determine HTTP RPC URL based on NETWORK environment variable
    const network = process.env.NETWORK || 'testnet';
    this.ckbHttpUrl =
      network === 'mainnet'
        ? this.configService.get<string>('MAINNET_HTTP_RPC_URL')!
        : this.configService.get<string>('TESTNET_HTTP_RPC_URL')!;

    this.logger.log(
      `🌐 CKB HTTP RPC URL configured for ${network.toUpperCase()}: ${this.ckbHttpUrl}`,
    );

    // Initialize RPC client
    if (network === 'mainnet') {
      this.rpcClient = new ccc.ClientPublicMainnet({
        url: this.ckbHttpUrl,
      });
    } else {
      this.rpcClient = new ccc.ClientPublicTestnet({
        url: this.ckbHttpUrl,
      });
    }
  }

  onModuleInit() {
    this.logger.log('CKB RPC service initialized');
  }

  /**
   * Get transaction pool info from CKB node
   * @returns Transaction pool information (all values are hex strings)
   */
  async getTxPoolInfo(): Promise<{
    pending: string; // hex string, e.g., "0x1a7"
    proposed: string; // hex string
    orphan: string; // hex string
    total_tx_size: string; // hex string
    total_tx_cycles: string; // hex string
    min_fee_rate: string; // hex string
    last_txs_updated_at: string; // hex string timestamp
  }> {
    this.logger.debug('Calling tx_pool_info RPC method');
    const result = await this.rpcClient.buildSender('tx_pool_info', [])();
    return result as {
      pending: string;
      proposed: string;
      orphan: string;
      total_tx_size: string;
      total_tx_cycles: string;
      min_fee_rate: string;
      last_txs_updated_at: string;
    };
  }
}
