// src/commands/dto/send-command.dto.ts
import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendCommandDto {
  @ApiProperty({
    description: 'Arbitrary payload that will be relayed to the device or group topic',
    example: { command: 'fan_on', params: { speed: 3 } },
  })
  @IsObject()
  payload: Record<string, any>;
}
