import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';

@Injectable()
export class OtpService {
  generateSixDigitCode = () => {
    return randomInt(1, 999999).toString().padStart(6, '0');
  };
}
