import { Decimal } from '@prisma/client/runtime/library';
import { IsDecimal, IsNotEmpty, IsNumber } from 'class-validator';

export class GetUserAreaSpecificDto {
  @IsDecimal()
  @IsNotEmpty()
  lat: Decimal;

  @IsDecimal()
  @IsNotEmpty()
  lng: Decimal;

  @IsNotEmpty()
  radius: number;
}
