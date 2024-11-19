import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto as SignupDto, LoginDto } from './dto';
import { JWtGaurd } from './gaurd';
import { User } from '@prisma/client';
import { GetUser } from './decorator/get-user.decorator';
import { AppleSSoDto } from './dto/sso_dto/apple.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ChangePasswordDto } from './dto/chnagePassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(200)
  @Post('signin')
  signin(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @HttpCode(200)
  @Post('with-google/:access_token')
  loginWithGoogle(
    @Param('access_token')
    access_token: string,
  ) {
    return this.authService.loginWithGoogle(access_token);
  }

  @HttpCode(200)
  @Post('with-apple')
  loginWithApple(@Body() dto: AppleSSoDto) {
    return this.authService.loginWithApple(dto);
  }

  @HttpCode(200)
  @Post('request-otp/')
  requestOtp(
    @Query('email')
    email: string,
  ) {
    return this.authService.requestOtp(email);
  }

  @HttpCode(200)
  @Post('verify-otp')
  verifyOtp(@Body('otp') otp: string, @Body('email') email: string) {
    return this.authService.verifyOtp(otp, email);
  }

  @HttpCode(200)
  @Post('forgot-password')
  forgotPassword(@Body() payload: ForgotPasswordDto) {
    return this.authService.forgotPassword(payload);
  }

  @UseGuards(JWtGaurd)
  @HttpCode(200)
  @Post('change-password')
  changePassword(@GetUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user, dto);
  }

  @HttpCode(200)
  @Post('/:refresh_token')
  tokenRefresh(@Param('refresh_token') refresh_token: string) {
    return this.authService.tokenRefresh(refresh_token);
  }
}
