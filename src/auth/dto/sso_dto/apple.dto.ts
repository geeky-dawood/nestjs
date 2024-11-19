import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AppleSSoDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @IsOptional()
  first_name?: string;

  @IsOptional()
  last_name?: string;
}
