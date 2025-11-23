import { PartialType } from '@nestjs/swagger';
import { CreateDeviceDto } from './create-device.dto';

// Inherit and make all fields optional for partial updates with Swagger metadata
export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {}
