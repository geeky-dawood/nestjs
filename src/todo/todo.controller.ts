import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { JWtGaurd } from 'src/auth/gaurd';
import { CreateToDoDto } from './dto/create_todo.dto';
import { TodoService } from './todo.service';
import { ToDoPriority, ToDoStatus, User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { UpdateTODO } from './dto/update_todo.dto';

@UseGuards(JWtGaurd)
@Controller('todo')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Post('create')
  createTodo(@GetUser() user: User, @Body() dto: CreateToDoDto) {
    return this.todoService.create(user, dto);
  }

  @Get()
  getTodos(@GetUser() user: User) {
    return this.todoService.getAllTodos(user);
  }

  @Get('filter')
  getTodosByStatusOrPriority(
    @Query('priority') priority: ToDoPriority,
    @Query('status') status: ToDoStatus,
    @GetUser() user: User,
  ) {
    return this.todoService.getTodoByStatusOrPririty(priority, status, user);
  }

  @Patch('update/:id')
  updateTodo(
    @Param('id') id: string,
    @Body() dto: UpdateTODO,
    @GetUser() user: User,
  ) {
    return this.todoService.updateTodo(id, dto, user);
  }

  @Delete('delete/:id')
  deleteTodoById(@Param('id') id: string) {
    return this.todoService.deleteById(id);
  }

  @Get('search')
  searchTodos(@Param('search') search: string, @GetUser() user: User) {
    console.log(search);
    return this.todoService.searchTodos(search, user);
  }

  @Get('byId/:id')
  getTodoById(@Param('id') id: string) {
    return this.todoService.getTodoById(id);
  }
}
