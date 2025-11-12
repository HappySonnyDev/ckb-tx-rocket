import { Module } from '@nestjs/common';
import { SnapshotController } from './snapshot.controller';
import { SnapshotService } from './snapshot.service';
import { DatabaseModule } from '../../core/database/database.module';
import { CkbModule } from '../../core/ckb/ckb.module';

@Module({
  imports: [DatabaseModule, CkbModule],
  controllers: [SnapshotController],
  providers: [SnapshotService],
  exports: [SnapshotService],
})
export class SnapshotModule {}
