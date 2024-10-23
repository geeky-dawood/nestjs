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
import { SignupDto as SignupDto, LoginDto, ChangePasswordDto } from './dto';
import { JWtGaurd } from './gaurd';
import { User } from '@prisma/client';
import { GetUser } from './decorator/get-user.decorator';
import { RefreshGaurd } from './gaurd/refresh.guard';

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
    return this.authService.signin(dto);
  }

  @UseGuards(RefreshGaurd)
  @HttpCode(200)
  @Post('/:refresh_token')
  tokenRefresh(@Param('refresh_token') refresh_token: string) {
    return this.authService.tokenRefresh(refresh_token);
  }

  @HttpCode(200)
  @Post('with-google')
  loginWithGoogle(
    @Query('access_token')
    access_token: string,
  ) {
    return this.authService.loginWithGoogle(access_token);
  }

  @HttpCode(200)
  @Post('change-password')
  @UseGuards(JWtGaurd)
  changePassword(@GetUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user, dto);
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
}
