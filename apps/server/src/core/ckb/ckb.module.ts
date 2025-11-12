import { Module } from '@nestjs/common';
import { CkbWebsocketService } from './ckb-websocket.service';
import { CkbRpcService } from './ckb-rpc.service';

@Module({
  providers: [CkbWebsocketService, CkbRpcService],
  exports: [CkbWebsocketService, CkbRpcService],
})
export class CkbModule {}
