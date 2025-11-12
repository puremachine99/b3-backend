import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { ConfigModule } from '@nestjs/config';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [ConfigModule, RealtimeModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
