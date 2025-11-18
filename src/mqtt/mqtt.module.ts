import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { ConfigModule } from '@nestjs/config';
import { RealtimeModule } from '../realtime/realtime.module';
import { DeviceLogsModule } from '../device-logs/device-logs.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [ConfigModule, RealtimeModule, DeviceLogsModule, DatabaseModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
