import { ToDoPriority, ToDoStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryFilterDto {
  @IsOptional()
  priority?: ToDoPriority;

  @IsOptional()
  status?: ToDoStatus;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (value == 'false' || value == '0' ? false : true))
  is_vital?: boolean;
}
