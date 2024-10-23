import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto, LoginDto, ChangePasswordDto } from './dto';
import * as argon2 from 'argon2';
import { Prisma, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { UserService } from 'src/user/user.service';
import { OtpService } from 'src/utils/otp/otp.service';
import { MailService } from 'src/utils/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private userService: UserService,
    private otp: OtpService,
    private mailService: MailService,
  ) {}

  //---tokken
  jwtTokken(userid: string, email: string) {
    const payload = { sub: userid, email: email };
    const secret = this.config.get('JWT_SECRET');
    const tokken = this.jwt.sign(payload, {
      secret: secret,
      expiresIn: '60s',
    });

    return tokken;
  }

  refreshToken(userid: string, email: string) {
    const payload = { sub: userid, email: email };
    const secret = this.config.get('REFRESH_SECRET');
    const tokken = this.jwt.sign(payload, {
      secret: secret,
      expiresIn: '2m',
    });

    return tokken;
  }

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
      await this.userService.sendMail(
        user.email,
        `${user.first_name} ${user.last_name}`,
      );
      return {
        message: 'User created',
        user: rest,
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
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User with this email not found');
      }
      const isPasswordMatch = await argon2.verify(user.password, dto.password);

      if (!isPasswordMatch) {
        throw new UnauthorizedException('Password does not match');
      }

      const access_token = this.jwtTokken(user.id, user.email);
      const refresh_token = this.refreshToken(user.id, user.email);

      const { password, ...rest } = user;

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refresh_token: refresh_token,
        },
      });

      return {
        message: 'Login success',
        user: {
          ...rest,
          access_token: access_token,
          refresh_token: refresh_token,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw error;
      }
      throw error;
    }
  }

  async tokenRefresh(refresh_token: string) {
    try {
      const payload = this.jwt.verify(refresh_token, {
        secret: this.config.get('REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.refresh_token !== refresh_token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const access_token = this.jwtTokken(user.id, user.email);
      const newRefreshToken = this.refreshToken(user.id, user.email);

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refresh_token: newRefreshToken,
        },
      });

      const { password, ...rest } = user;
      return {
        message: 'Token refreshed',
        user: {
          ...rest,
          access_token: access_token,
          refresh_token: newRefreshToken,
        },
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async loginWithGoogle(access_token: string) {
    if (!access_token) {
      throw new UnauthorizedException('Google token not provided');
    }

    const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`;
    try {
      const data = await axios.get(url);

      console.log('Google user info:', data.data);

      if (!data.data.sub) {
        throw new UnauthorizedException('Invalid Google token');
      }

      //check if user exists
      const user = await this.prisma.user.findUnique({
        where: {
          email: data.data.email,
        },
      });

      if (!user) {
        //create user
        const hashPassword = await argon2.hash('google');
        const newUser = await this.prisma.user.create({
          data: {
            first_name: data.data.given_name,
            last_name: data.data.family_name,
            email: data.data.email,
            password: hashPassword,
            isVerified: true,
          },
        });
        const newUserAccessToken = this.jwtTokken(newUser.id, newUser.email);
        const { password, ...rest } = newUser;

        return {
          message: 'User created successfully',
          user: {
            ...rest,
            access_token: newUserAccessToken,
          },
        };
      } else {
        //user found
        const oldUserAccessToken = this.jwtTokken(user.id, user.email);
        const { password, ...rest } = user;
        return {
          message: 'Login success',
          user: { ...rest, access_token: oldUserAccessToken },
        };
      }

      // Further processing
    } catch (error) {
      console.error('Error fetching user info from Google:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async changePassword(user: User, dto: ChangePasswordDto) {
    try {
      const findUser = await this.prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      if (!findUser) {
        throw new UnauthorizedException('User not found');
      }

      const isPasswordMatch = await argon2.verify(
        findUser.password,
        dto.old_password,
      );

      if (!isPasswordMatch) {
        throw new UnauthorizedException('Old password does not match');
      }

      if (dto.new_password === dto.old_password) {
        throw new UnauthorizedException(
          'New password cannot be the same as the old password',
        );
      }

      if (dto.new_password !== dto.confirm_password) {
        throw new UnauthorizedException(
          'New password and confirm password do not match',
        );
      }

      const newHashPassword = await argon2.hash(dto.new_password);

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: newHashPassword,
        },
      });

      return {
        message: 'Password updated successfully',
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async requestOtp(email: string) {
    try {
      const checkUserEmail = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!checkUserEmail) {
        throw new UnauthorizedException('User with this email not found');
      }

      const otp = this.otp.generateSixDigitCode();
      const dateTime = new Date();
      const expiresIn = dateTime.setMinutes(dateTime.getMinutes() + 2);
      await this.mailService.sendMail(email, otp);

      //save this otp in the database
      await this.prisma.otp.create({
        data: {
          otp: otp,
          email: email,
          expiresAt: new Date(expiresIn),
        },
      });
      const utcDateTime = convertTimestampToUTC(expiresIn);
      return {
        message: 'OTP sent to your email',
        otp: otp,
        expireAt: utcDateTime,
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async verifyOtp(otp: string, email: string) {
    try {
      const checkOtp = await this.prisma.otp.findFirst({
        where: {
          otp: otp,
          email: email,
          isUsed: false,
          expiresAt: {
            gte: new Date(),
          },
        },
      });
      if (!checkOtp) {
        throw new UnauthorizedException('Invalid OTP');
      }

      if (checkOtp.isUsed) {
        throw new UnauthorizedException('OTP already used');
      }

      if (checkOtp.expiresAt < new Date()) {
        throw new UnauthorizedException('OTP expired');
      }

      await this.prisma.otp.update({
        where: {
          id: checkOtp.id,
        },
        data: {
          isUsed: true,
        },
      });

      return {
        message: 'OTP verified successfully',
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}

function convertTimestampToUTC(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toUTCString();
}
