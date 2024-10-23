import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { EditUserDto } from './dto/edit-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async sendMail(email: string, name: string) {
    try {
      //find all emails
      // const listOfEmails = await this.prisma.user.findMany({
      //   select: {
      //     email: true,
      //   },
      // });
      // map emails to add them in list
      // const emailAddresses = listOfEmails.map((e) => e.email);
      const mailSent = await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Learning Earning!',
        text: `Hello ${name},
      
      Thank you for joining Learning Earning! We're excited to have you on board.
      
      Get ready to explore all the amazing features we have to offer. If you have any questions or need assistance, feel free to reach out.
      
      Best regards,
      The Learning Earning Team`,
        html: `<h1>Welcome to <b>Learning Earning</b>!</h1>
               <p>Hello ${name},</p>
               <p>Thank you for joining <b>Learning Earning</b>! We're excited to have you on board.</p>
               <p>Get ready to explore all the amazing features we have to offer. If you have any questions or need assistance, feel free to reach out.</p>
               <br>
               <p>Best regards,<br>The Learning Earning Team</p>`,
      });

      const { response, ...rest } = mailSent;
      rest.envelope.to = email;

      return { message: 'Mail sent to', email };
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
