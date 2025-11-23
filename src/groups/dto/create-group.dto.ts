// src/groups/dto/create-group.dto.ts
import { IsString, IsOptional, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ description: 'Human friendly group name used to cluster devices', example: 'Greenhouse West' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Optional description that explains this device group', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Arbitrary metadata (tags, thresholds, etc.) stored along the group',
    required: false,
    example: { season: 'dry', irrigationSchedule: '08:00,18:00' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
