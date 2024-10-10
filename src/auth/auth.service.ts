import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto, LoginDto } from './dto';
import * as argon2 from 'argon2';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: SignupDto) {
    try {
      const hashPassword = await argon2.hash(dto.password);
      const user = await this.prisma.user.create({
        data: {
          first_name: dto.first_name,
          last_name: dto.last_name,
          email: dto.email,
          password: hashPassword,
        },
      });
      const { password, ...rest } = user;
      return {
        message: 'User created',
        data: rest,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return {
            message: 'User with this email already exists',
          };
        }
      }
      throw error;
    }
  }

  async signin(dto: LoginDto) {
    //find user
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new ForbiddenException('User with this email not found');
      }
      const isPasswordMatch = await argon2.verify(user.password, dto.password);

      if (!isPasswordMatch) {
        throw new ForbiddenException('Password does not match');
      }

      this.jwtTokken(user.id, user.email);
      const { password, ...rest } = user;

      return {
        message: 'Login success',
        user: { ...rest, access_token: this.jwtTokken(user.id, user.email) },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw error;
      }
      throw error;
    }
  }

  //---tokken
  jwtTokken(userid: string, email: string) {
    const payload = { sub: userid, email: email };
    const secret = this.config.get('JWT_SECRET');
    const tokken = this.jwt.sign(payload, {
      secret: secret,
      expiresIn: '15m',
    });

    return tokken;
  }
}
