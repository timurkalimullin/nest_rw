import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { sign } from 'jsonwebtoken';
import { UserResponse, UserType } from './types/UserResponse.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>
  ) {}

  // #region Main

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userByEmail = await this.repository.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    const userByUsername = await this.repository.findOne({
      where: {
        username: createUserDto.username,
      },
    });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        'Email or username are taken',
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }
    const newUser = await this.repository.create(createUserDto);
    return await this.repository.save(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const requiredUser = await this.repository.findOne({
      where: {
        email: loginUserDto.email,
      },
      select: ['id', 'username', 'bio', 'image', 'password', 'email'],
    });

    if (!requiredUser) {
      throw new HttpException(
        `Credentials are not valid`,
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    const isPasswordMatch = await compare(
      loginUserDto.password,
      requiredUser.password
    );

    if (!isPasswordMatch) {
      throw new HttpException(
        `Credentials are not valid`,
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    return requiredUser;
  }

  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({ where: { id } });
  }

  // #endregion

  // #region Helpers

  buildUserResponse(user: User): UserResponse {
    const { password, ...rest } = user;
    return {
      user: { ...rest, token: this.generateJwt(rest) },
    };
  }

  generateJwt(user: UserType) {
    const { id, email, username } = user;
    return sign({ id, email, username }, process.env.JWT_SECRET);
  }

  // #endregion
}
