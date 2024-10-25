import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @IsString()
  @IsNotEmpty()
  new_password: string;

  @IsString()
  @IsNotEmpty()
  confirm_password: string;
}

export class AppleSSoDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @IsOptional()
  first_name?: string;

  @IsOptional()
  last_name?: string;
}
