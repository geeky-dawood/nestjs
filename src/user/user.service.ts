import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto/edit-user.dto';
import { User } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async sendMail() {
    try {
      //find all emails
      const listOfEmails = await this.prisma.user.findMany({
        select: {
          email: true,
        },
      });
      // map emails to add them in list
      const emailAddresses = listOfEmails.map((e) => e.email);
      if (emailAddresses.length > 0) {
        const mailSent = await this.mailerService.sendMail({
          to: emailAddresses,
          from: 'noreply@nestjs.com',
          subject: 'Testing Nest MailerModule ✔',
          text: 'welcome',
          html: '<b>welcome</b>',
        });

        const { response, ...rest } = mailSent;
        rest.envelope.to = emailAddresses;

        return { message: 'Mail sent to', emailAddresses };
      } else {
        return { message: 'No emails found' };
      }
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
