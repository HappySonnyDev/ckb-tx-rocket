import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Determine database URL based on NETWORK environment variable
    const network = process.env.NETWORK || 'testnet';
    const dbFile =
      network === 'mainnet'
        ? process.env.MAINNET_DATABASE_FILE || './ckb-mainnet.db'
        : process.env.TESTNET_DATABASE_FILE || './ckb-testnet.db';
    const databaseUrl = `file:${dbFile}?connection_limit=1&pool_timeout=30&socket_timeout=30`;

    super({
      datasourceUrl: databaseUrl,
    });

    console.log(
      `💾 Database initialized for ${network.toUpperCase()}: ${dbFile}`,
    );
  }

  async onModuleInit() {
    await this.$connect();
    // 执行 SQLite 性能优化配置
    // 使用 $queryRawUnsafe 因为这些 PRAGMA 会返回结果
    await this.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
    await this.$queryRawUnsafe('PRAGMA synchronous = NORMAL;');
    await this.$queryRawUnsafe('PRAGMA busy_timeout = 30000;');
    await this.$queryRawUnsafe('PRAGMA cache_size = -64000;');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
