// src/commands/dto/send-command.dto.ts
import { IsObject } from 'class-validator';

export class SendCommandDto {
  @IsObject()
  payload: Record<string, any>;
}
