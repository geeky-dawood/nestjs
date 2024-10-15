import { Global, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
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
          service: 'Gmail',
          auth: {
            user: configService.get('MAIL'),
            pass: configService.get('MAIL_PASSWORD'),
          },
        },

        // template: {
        //   dir: __dirname + '/templates',
        //   adapter: new PugAdapter(),
        //   options: {
        //     strict: true,
        //   },
        // },
      }),
    }),
  ],
})
export class AppModule {}
