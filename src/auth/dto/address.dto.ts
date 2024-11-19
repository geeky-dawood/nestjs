import {
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsInt()
  @IsOptional()
  zipcode: number;

  @IsDecimal()
  @IsNotEmpty()
  latitude: number;

  @IsDecimal()
  @IsNotEmpty()
  longitude: number;
}
