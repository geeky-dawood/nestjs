import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JWtStrategy } from 'src/auth/strategy/jwt.strategy';
import { Axios } from 'axios';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/utils/mail/mail.module';
import { OtpModule } from 'src/utils/otp/otp.module';
import { RefreshStrategy } from './strategy/refresh.strategy';

@Module({
  imports: [JwtModule.register({}), UserModule, MailModule, OtpModule],
  providers: [AuthService, JWtStrategy, Axios, RefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
