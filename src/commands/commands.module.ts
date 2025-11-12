import { Module } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { CommandsController } from './commands.controller';
import { PrismaService } from '../database/prisma.service';
import { MqttModule } from '../mqtt/mqtt.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [MqttModule, GroupsModule],
  controllers: [CommandsController],
  providers: [CommandsService, PrismaService],
})
export class CommandsModule {}
