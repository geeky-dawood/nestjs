import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JWtStrategy } from 'src/strategy/jwt.strategy';

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthService, JWtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
