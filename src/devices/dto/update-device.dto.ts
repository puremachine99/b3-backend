import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceDto } from './create-device.dto';

// Inherit and make all fields optional for partial updates
export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {}
