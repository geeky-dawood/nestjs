import { IsOptional, IsString } from 'class-validator';
import { AddressDto } from 'src/auth/dto';

export class EditUserDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsOptional()
  address?: AddressDto;
}
