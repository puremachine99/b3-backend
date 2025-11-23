import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendCommandDto {
  @ApiProperty({ description: 'Plain text or JSON command forwarded to the device', example: 'REBOOT' })
  @IsString()
  @IsNotEmpty()
  command: string;
}
