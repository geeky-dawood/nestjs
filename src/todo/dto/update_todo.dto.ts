import { ToDoPriority, ToDoStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTODO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsOptional()
  date_time?: Date;

  @IsEnum(ToDoPriority)
  @IsOptional()
  priority?: ToDoPriority;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsEnum(ToDoStatus)
  @IsOptional()
  status?: ToDoStatus;

  @IsBoolean()
  @IsOptional()
  is_vital?: boolean;
}
