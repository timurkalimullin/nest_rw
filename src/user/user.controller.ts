import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponse } from './types/UserResponse.interface';
import { User } from '../common/decorators/user.decorator';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body('user') createUserDto: CreateUserDto
  ): Promise<UserResponse> {
    const newUser = await this.userService.create(createUserDto);
    return this.userService.buildUserResponse(newUser);
  }

  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponse> {
    const requiredUser = await this.userService.login(loginUserDto);
    return this.userService.buildUserResponse(requiredUser);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(@User() user: UserEntity): Promise<UserResponse> {
    return this.userService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateUser(
    @User() user: UserEntity,
    @Body('user') updateUserDto: UpdateUserDto
  ): Promise<UserResponse> {
    const updatedUser = await this.userService.update(user.id, updateUserDto);
    return this.userService.buildUserResponse(updatedUser);
  }
}
