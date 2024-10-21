import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JWtGaurd } from 'src/auth/gaurd/index';
import { UserService } from './user.service';
import { EditUserDto } from './dto/edit-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(JWtGaurd)
  userDetails(@GetUser() user: User) {
    return {
      user: user,
    };
  }

  @Patch('update')
  @UseGuards(JWtGaurd)
  async updateUser(@GetUser() user: User, @Body() dto: EditUserDto) {
    return await this.userService.updateUser(user, dto);
  }
  @Delete('delete')
  @UseGuards(JWtGaurd)
  async deleteUser(@GetUser() user: User) {
    return await this.userService.deleteUser(user);
  }

  @Get('send-email')
  sendMail() {
    return this.userService.sendMail();
  }
}
