import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateToDoDto } from './dto/create_todo.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { UpdateTODO } from './dto/update_todo.dto';
import { Pagination } from 'src/utils/pagination';
import { QueryFilterDto } from './dto/query_filter.dto';

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

  async getAllTodos(user: User, query?: Pagination) {
    try {
      const skip = (query.page - 1) * query.size;

      const findManyQuery: Prisma.todosFindManyArgs = {
        where: {
          userId: user.id,
        },
      };

      if (query.size) {
        findManyQuery.take = +query.size;
      }
      if (query.page) {
        findManyQuery.skip = skip;
      }

      const todo = await this.prisma.todos.findMany(findManyQuery);
      if (query.size && query.page) {
        const totalCount = await this.prisma.todos.count({
          where: {
            userId: user.id,
          },
        });

        return {
          message: 'Todo with pagination fetched successfully',
          pagination: {
            total_data: totalCount,
            total_pages_on_data: totalCount / query.size,
          },
          data: [...todo],
        };
      } else {
        return {
          message: 'Todo fetched successfully',
          data: [...todo],
        };
      }
    } catch (error) {
      console.log(error);
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

  async getTodoByStatusOrPririty(query: QueryFilterDto, user: User) {
    try {
      const todo = await this.prisma.todos.findMany({
        where: {
          userId: user.id,
          status: query.status,
          priority: query.priority,
          is_vital: query.is_vital,
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
    if (!search) {
      throw new BadRequestException('Search query cannot be empty');
    }

    try {
      const todos = await this.prisma.todos.findMany({
        where: {
          userId: user.id,
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
      });

      if (todos.length === 0) {
        return {
          message: 'No todos match the search query',
          data: [],
        };
      }

      return {
        message: 'Todos fetched successfully',
        data: [...todos],
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetching todos',
      );
    }
  }
}
