import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { JWtStrategy } from 'src/auth/strategy/jwt.strategy';

@Module({
  controllers: [TodoController],
  providers: [TodoService, JWtStrategy],
  exports: [TodoService],
})
export class TodoModule {}
