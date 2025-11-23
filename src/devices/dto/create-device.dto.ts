import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { DeviceStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({
    description: 'Unique serial number used as the device identifier',
    example: 'B3-EDGE-0001',
  })
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @ApiProperty({ description: 'Friendly name shown in the UI', example: 'Kebun A Gateway' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Optional explanation of where or how the device is deployed',
    example: 'Gateway for greenhouse row 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Free-form location text such as room name or coordinates label',
    example: 'Warehouse 3',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Latitude component of the geo position',
    example: -6.21154,
    required: false,
  })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  latitude?: number;

  @ApiProperty({
    description: 'Longitude component of the geo position',
    example: 106.84517,
    required: false,
  })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  longitude?: number;

  @ApiProperty({
    description: 'Reported device connectivity status',
    enum: DeviceStatus,
    example: DeviceStatus.ONLINE,
    required: false,
  })
  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;
}
