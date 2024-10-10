import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JWtGaurd } from 'src/auth/gaurd/index';
import { Request } from 'express';

@Controller('user')
export class UserController {
  @UseGuards(JWtGaurd)
  @Get()
  userDetails(@Req() req: Request) {
    return req.user;
  }
}
