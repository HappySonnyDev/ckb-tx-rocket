import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LogLevel } from '@nestjs/common';

async function bootstrap() {
  // 从环境变量读取日志级别配置
  const logLevels: LogLevel[] = process.env.LOG_LEVEL
    ? (process.env.LOG_LEVEL.split(',') as LogLevel[])
    : ['error', 'warn', 'log'];

  // Determine which network to run based on NETWORK environment variable
  const network = process.env.NETWORK || 'testnet';
  const port =
    network === 'mainnet'
      ? process.env.API_MAINNET_PORT || 3001
      : process.env.API_TESTNET_PORT || 3000;

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });

  // Enable CORS for frontend applications
  app.enableCors();

  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);

  console.log(`🚀 Server running on port ${port} for ${network.toUpperCase()}`);
}

void bootstrap();
