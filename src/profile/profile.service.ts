import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileResponseInterface, ProfileType } from './types/profile.type';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async getProfile(
    userId: string,
    profileUsername: string
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        username: profileUsername,
      },
    });
    if (!user)
      throw new HttpException(
        'No profile with username' + profileUsername,
        HttpStatus.NOT_FOUND
      );
    return user;
  }

  buildProfileResponse(user: UserEntity): ProfileResponseInterface {
    const { bio, username, image } = user;
    return { profile: { bio, username, image, following: false } };
  }
}
