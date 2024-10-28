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

@UseGuards(JWtGaurd)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  userDetails(@GetUser() user: User) {
    if (user.is_verified) {
      return {
        user: user,
      };
    } else {
      return {
        message: 'Please verify your email to continue',
      };
    }
  }

  @Patch()
  async updateUser(@GetUser() user: User, @Body() dto: EditUserDto) {
    return await this.userService.updateUser(user, dto);
  }
  @Delete()
  async deleteUser(@GetUser() user: User) {
    return await this.userService.deleteUser(user);
  }
}
