import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Registered user email used for authentication', example: 'operator@b3sahabat.id' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Plain password belonging to the email', example: 'Sup3rStr0ng!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
