import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { OtpService } from './utils/otp/otp.service';
import { MailService } from './utils/mail/mail.service';
import { MailModule } from './utils/mail/mail.module';
import { OtpModule } from './utils/otp/otp.module';
@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    BookmarkModule,
    ConfigModule.forRoot({ isGlobal: true }),
    //Mailer
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: configService.get('MAIL_SERVICE'),
          auth: {
            user: configService.get('MAIL'),
            pass: configService.get('MAIL_PASSWORD'),
          },
        },
      }),
    }),
    MailModule,
    OtpModule,
  ],
  providers: [OtpService, MailService],
})
export class AppModule {}
