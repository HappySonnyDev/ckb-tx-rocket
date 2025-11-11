import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath:
    process.env.NODE_ENV === 'production'
      ? ['.env.production.local', '.env.production', '.env']
      : ['.env.development.local', '.env.development', '.env'],
  validationSchema: Joi.object({
    // Mainnet configuration
    MAINNET_DATABASE_FILE: Joi.string().default('./ckb-mainnet.db'),
    MAINNET_WS_RPC_URL: Joi.string().uri().default('wss://mainnet.ckb.dev/ws'),
    MAINNET_HTTP_RPC_URL: Joi.string().uri().default('https://mainnet.ckb.dev'),
    API_MAINNET_PORT: Joi.number().default(3001),

    // Testnet configuration
    TESTNET_DATABASE_FILE: Joi.string().default('./ckb-testnet.db'),
    TESTNET_WS_RPC_URL: Joi.string().uri().default('wss://testnet.ckb.dev/ws'),
    TESTNET_HTTP_RPC_URL: Joi.string().uri().default('https://testnet.ckb.dev'),
    API_TESTNET_PORT: Joi.number().default(3000),

    // General configuration
    LOG_LEVEL: Joi.string().default('error,warn,log'),
  }),
  validationOptions: {
    abortEarly: true,
  },
});

export default configModule;
