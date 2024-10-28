import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto, LoginDto, ChangePasswordDto, AppleSSoDto } from './dto';
import * as argon2 from 'argon2';
import { Prisma, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { OtpService } from 'src/utils/otp/otp.service';
import { MailService } from 'src/utils/mail/mail.service';
import { log } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private otp: OtpService,
    private mailService: MailService,
  ) {}

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
      await this.prisma.user.create({
        data: {
          first_name: dto.first_name,
          last_name: dto.last_name,
          email: dto.email,
          password: hashPassword,
          address: {
            create: { ...dto.address },
          },
        },
      });

      const otp = this.otp.generateSixDigitCode();
      const dateTime = new Date();
      const expiresIn = dateTime.setMinutes(dateTime.getMinutes() + 2);
      await this.mailService.sendMail(dto.email, otp);

      await this.prisma.otp.create({
        data: {
          otp: otp,
          email: dto.email,
          expiresAt: new Date(expiresIn),
        },
      });

      return {
        message: 'OTP sent to your email for verification',
        otp: otp,
        email: dto.email,

        expireAt: convertTimestampToUTC(expiresIn),
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
        include: {
          address: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User with this email not found');
      }

      const isPasswordMatch = await argon2.verify(user.password, dto.password);

      if (!isPasswordMatch) {
        throw new UnauthorizedException('Password does not match');
      }

      if (user.is_verified === false) {
        throw new UnauthorizedException('Account not verified');
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

      return {
        message: 'Token refreshed',
        data: {
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

      if (!data.data.sub) {
        throw new UnauthorizedException('Invalid google access token');
      }
      //check if user exists
      const user = await this.prisma.user.findUnique({
        where: {
          google_id: data.data.sub,
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
            image_url: data.data.picture,
            google_id: data.data.sub,
            is_verified: data.data.email_verified,
          },
        });

        const newUserAccessToken = this.jwtTokken(newUser.id, newUser.email);
        const newUserRefreshToken = this.refreshToken(
          newUser.id,
          newUser.email,
        );

        await this.prisma.user.update({
          where: {
            id: newUser.id,
          },
          data: {
            refresh_token: newUserRefreshToken,
          },
        });

        const { password, ...rest } = newUser;

        return {
          message: 'User created successfully',
          user: {
            ...rest,
            access_token: newUserAccessToken,
            refresh_token: newUserRefreshToken,
          },
        };
      } else {
        //user found
        const oldUserAccessToken = this.jwtTokken(user.id, user.email);
        const oldUserRefreshToken = this.refreshToken(user.id, user.email);
        const { password, ...rest } = user;

        return {
          message: 'Login success',
          user: {
            ...rest,
            access_token: oldUserAccessToken,
            refresh_token: oldUserRefreshToken,
          },
        };
      }

      // Further processing
    } catch (error) {
      console.error('Error fetching user info from Google:', { error });
      throw new ForbiddenException('Invalid google access token');
    }
  }

  async loginWithApple(dto: AppleSSoDto) {
    if (!dto.access_token) {
      throw new UnauthorizedException('Apple token not provided');
    }

    try {
      const parts = dto.access_token.split('.');
      const base64Payload = parts[1];
      const decodedPayload = Buffer.from(base64Payload, 'base64').toString(
        'utf-8',
      );

      const applePayload = JSON.parse(decodedPayload);
      const email = applePayload.email;
      const user = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        //create user
        const hashPassword = await argon2.hash('apple');
        const newUser = await this.prisma.user.create({
          data: {
            first_name: dto.first_name,
            last_name: dto.last_name,
            email: email,
            password: hashPassword,
            image_url: null,
            apple_id: applePayload.sub,
            is_verified: true,
          },
        });

        const newUserAccessToken = this.jwtTokken(newUser.id, newUser.email);
        const newUserRefreshToken = this.refreshToken(
          newUser.id,
          newUser.email,
        );

        await this.prisma.user.update({
          where: {
            id: newUser.id,
          },
          data: {
            refresh_token: newUserRefreshToken,
          },
        });

        const { password, ...rest } = newUser;

        return {
          message: 'User created successfully',
          user: {
            ...rest,
            access_token: newUserAccessToken,
            refresh_token: newUserRefreshToken,
          },
        };
      } else {
        //user found
        const oldUserAccessToken = this.jwtTokken(user.id, user.email);
        const oldUserRefreshToken = this.refreshToken(user.id, user.email);
        const { password, ...rest } = user;

        return {
          message: 'Login success',
          user: {
            ...rest,
            access_token: oldUserAccessToken,
            refresh_token: oldUserRefreshToken,
          },
        };
      }
    } catch (error) {
      console.error('Error fetching user info from apple:', error);
      throw new UnauthorizedException('Invalid apple access token');
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
        throw new ForbiddenException('Invalid OTP');
      }

      if (checkOtp.isUsed) {
        throw new ForbiddenException('OTP already used');
      }

      if (checkOtp.expiresAt < new Date()) {
        throw new ForbiddenException('OTP expired');
      }

      await this.prisma.otp.update({
        where: {
          id: checkOtp.id,
        },
        data: {
          isUsed: true,
        },
      });

      await this.prisma.user.update({
        where: {
          email: email,
        },
        data: {
          is_verified: true,
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

  async forgotPassword(paylod: string) {
    // Implement this method
    const user = await this.prisma.user.findUnique({
      where: {
        email: paylod,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User with this email not found');
    } else {
      this.requestOtp(paylod);

      return {
        message: 'OTP sent to your email',
      };
    }
  }
}

function convertTimestampToUTC(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toUTCString();
}
