// src/groups/dto/create-group.dto.ts
import { IsString, IsOptional, IsNotEmpty, IsObject } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
