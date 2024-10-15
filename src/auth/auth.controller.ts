import { Body, Controller, HttpCode, Param, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto as SignupDto, LoginDto } from './dto';

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
  @HttpCode(200)
  @Post('with-google')
  loginWithGoogle(
    @Query('access_token')
    access_token: string,
  ) {
    return this.authService.loginWithGoogle(access_token);
  }
}
