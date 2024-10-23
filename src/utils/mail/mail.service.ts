import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(email: string, otp: string) {
    try {
      const mailSent = await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Learning Earning!',
        text: `Hello,

Thank you for registering with Learning Earning! Use the OTP below to complete your registration:

OTP: ${otp}

Please note: This OTP will expire in 2 minutes, so be sure to enter it promptly.

Best regards,
The Learning Earning Team`,
        html: `<h1>Welcome to <b>Learning Earning</b>!</h1>
               <p>Hello,</p>
               <p>Thank you for registering with <b>Learning Earning</b>! Use the OTP below to complete your registration:</p>
               <h2>OTP: <b>${otp}</b></h2>
               <p><b>Please note:</b> This OTP will expire in 2 minutes, so be sure to enter it promptly.</p>
               <br>
               <p>Best regards,<br>The Learning Earning Team</p>`,
      });

      return { message: 'Mail sent to', mailSent };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
