import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateToDoDto } from './dto/create_todo.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ToDoPriority, ToDoStatus, User } from '@prisma/client';
import { UpdateTODO } from './dto/update_todo.dto';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async create(user: User, payload: CreateToDoDto) {
    try {
      const todo = await this.prisma.todos.create({
        data: {
          ...payload,
          userId: user.id,
        },
      });
      return {
        message: 'Todo created successfully',
        data: todo,
      };
    } catch (error) {
      throw new ForbiddenException('Failed to create todo');
    }
  }

  async getAllTodos(user: User) {
    try {
      const todo = await this.prisma.todos.findMany({
        where: {
          userId: user.id,
        },
      });

      return {
        message: 'Todo fetched successfully',
        data: [...todo],
      };
    } catch (error) {
      throw new ForbiddenException('Failed to fetch todos');
    }
  }

  async getTodoById(id: string) {
    try {
      if (!id) {
        throw new ForbiddenException('Required resource is missing');
      }
      const todo = await this.prisma.todos.findUnique({
        where: {
          id: id,
        },
      });

      return {
        message: 'Todo fetched successfully',
        data: todo,
      };
    } catch (error) {
      throw new ForbiddenException('No todo found');
    }
  }

  async getTodoByStatusOrPririty(
    priority: ToDoPriority,
    status: ToDoStatus,
    user: User,
  ) {
    try {
      const todo = await this.prisma.todos.findMany({
        where: {
          userId: user.id,
          status: status,
          priority: priority,
        },
      });

      if (!todo) {
        throw new ForbiddenException('No todo found');
      }

      return {
        message: 'Todo fetched successfully',
        data: [...todo],
      };
    } catch (error) {
      console.log(error);
      throw new ForbiddenException(
        'Invalid value for priority or status , must be enum value',
      );
    }
  }

  async updateTodo(id: string, payload: UpdateTODO, user: User) {
    if (!id) {
      throw new ForbiddenException('Required resource is missing');
    }
    try {
      const userTodo = await this.prisma.todos.findMany({
        where: {
          userId: user.id,
        },
      });

      if (userTodo.length > 0) {
        const updatedTodo = await this.prisma.todos.update({
          where: {
            id: id,
          },
          data: {
            ...payload,
          },
        });

        return {
          message: 'Todo updated successfully',
          data: updatedTodo,
        };
      } else {
        throw new ForbiddenException('No todo found for this user');
      }
    } catch (error) {
      console.log(error);
      throw new ForbiddenException('Failed to update todo');
    }
  }

  async deleteById(id: string) {
    if (!id) {
      throw new ForbiddenException('Todo id is missing');
    }
    try {
      await this.prisma.todos.delete({
        where: {
          id: id,
        },
      });

      return {
        message: 'Todo deleted successfully',
      };
    } catch (error) {
      throw new ForbiddenException('Failed to delete todo');
    }
  }

  async searchTodos(search: string, user: User) {
    if (search === '') {
      throw new ForbiddenException('Search query is empty or null');
    }

    const searchQuery = search.toLowerCase();

    try {
      const todo = await this.prisma.todos.findMany({
        where: {
          userId: user.id,
          title: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      });

      return {
        message: 'Todo fetched successfully',
        data: [...todo],
      };
    } catch (error) {
      throw new ForbiddenException('No todo found');
    }
  }
}
