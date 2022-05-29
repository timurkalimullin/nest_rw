import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserEntity } from './entities/user.entity';
import { sign } from 'jsonwebtoken';
import { UserResponse, UserType } from './types/UserResponse.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>
  ) {}

  // #region Main

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
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

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
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

  async findById(id: string): Promise<UserEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserEntity> {
    const user = await this.findById(userId);
    if (!user)
      throw new HttpException(
        'Unexpected db error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );

    const updatedUser = { ...user, ...updateUserDto };
    return this.repository.save(updatedUser);
  }

  // #endregion

  // #region Helpers

  buildUserResponse(user: UserEntity): UserResponse {
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
