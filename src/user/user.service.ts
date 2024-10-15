import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto/edit-user.dto';
import { User } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { log } from 'handlebars';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async sendMail() {
    try {
      const mailSent = await this.mailerService.sendMail({
        to: 'naturein30@gmail.com', // list of receivers
        from: 'noreply@nestjs.com', // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        html: '<b>welcome</b>', // HTML body content
      });

      console.log(mailSent);
      return { message: 'Mail sent', mailSent };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateUser(user: User, dto: EditUserDto) {
    try {
      const updateUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: dto,
      });
      const { password, ...rest } = updateUser;
      return { user: rest };
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(user: User) {
    try {
      await this.prisma.user.delete({
        where: {
          id: user.id,
        },
      });
      return { message: 'User deleted' };
    } catch (error) {
      throw error;
    }
  }
}
