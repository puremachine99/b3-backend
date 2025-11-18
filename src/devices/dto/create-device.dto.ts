import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { DeviceStatus } from '@prisma/client';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  latitude?: number;

  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  longitude?: number;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;
}
