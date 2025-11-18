import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// Extends create DTO and makes all fields optional for PATCH
export class UpdateUserDto extends PartialType(CreateUserDto) {}
