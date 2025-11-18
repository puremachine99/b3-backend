import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { DatabaseModule } from '../database/database.module';
import { MqttModule } from '../mqtt/mqtt.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, MqttModule, AuthModule],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
