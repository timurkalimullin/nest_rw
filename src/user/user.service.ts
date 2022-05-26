import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { sign } from 'jsonwebtoken';
import { UserResponse, UserType } from './types/UserResponse.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = await this.repository.create(createUserDto);
    return await this.repository.save(newUser);
  }

  buildUserResponse(user: User): UserResponse {
    const { password, ...rest } = user;
    return {
      user: { ...rest, token: this.generateJwt(user) },
    };
  }

  generateJwt(user: UserType) {
    const { id, username, email } = user;
    return sign({ id, email, username }, process.env.JWT_SECRET);
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
