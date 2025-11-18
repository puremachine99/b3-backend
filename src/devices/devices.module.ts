import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DatabaseModule } from '../database/database.module';
import { MqttModule } from '../mqtt/mqtt.module';
import { AuthModule } from '../auth/auth.module'; // ✅ tambahkan ini
import { DeviceLogsModule } from '../device-logs/device-logs.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [DatabaseModule, MqttModule, AuthModule, DeviceLogsModule, RealtimeModule], // ✅ wajib
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
