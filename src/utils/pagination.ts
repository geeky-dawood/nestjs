import { IsNumber, IsOptional } from 'class-validator';

export class Pagination {
  @IsOptional()
  page?: number;

  @IsOptional()
  size?: number;
}
