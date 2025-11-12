import { Module } from '@nestjs/common';
import { DeviceLogsService } from './device-logs.service';
import { DeviceLogsController } from './device-logs.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DeviceLogsController],
  providers: [DeviceLogsService],
  exports: [DeviceLogsService], // <── ini penting!
})
export class DeviceLogsModule {}
