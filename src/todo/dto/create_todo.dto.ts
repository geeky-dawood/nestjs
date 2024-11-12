import { ToDoPriority, ToDoStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateToDoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  date_time: Date;

  @IsEnum(ToDoPriority)
  priority: ToDoPriority;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsEnum(ToDoStatus)
  status: ToDoStatus;

  @IsBoolean()
  is_vital: boolean;
}
