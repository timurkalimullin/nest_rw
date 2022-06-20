import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { FollowEntity } from './entities/follow.entity';
import { ProfileResponseInterface, ProfileType } from './types/profile.type';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>
  ) {}

  async getProfile(
    userId: string,
    profileUsername: string
  ): Promise<ProfileType> {
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
    const following = await this.followRepository.findOne({
      where: {
        followerId: userId,
        followingId: user.id,
      },
    });
    return { ...user, following: !!following };
  }

  async followProfile(
    currentUserId: string,
    profileUsername: string
  ): Promise<ProfileType> {
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
    if (currentUserId === user.id) {
      throw new HttpException(
        'You cant follow yourself',
        HttpStatus.BAD_REQUEST
      );
    }

    const follow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    });

    if (!follow) {
      const newFollow = await this.followRepository.create({
        followerId: currentUserId,
        followingId: user.id,
      });
      await this.followRepository.save(newFollow);
    }
    return { ...user, following: true };
  }

  async unfollowProfile(
    currentUserId: string,
    profileUsername: string
  ): Promise<ProfileType> {
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
    if (currentUserId === user.id) {
      throw new HttpException(
        'You cant follow yourself',
        HttpStatus.BAD_REQUEST
      );
    }

    const follow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id,
      },
    });
    if (!follow) {
      throw new HttpException(
        'Can`t unfollow profile',
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }
    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: user.id,
    });
    return { ...user, following: false };
  }

  buildProfileResponse(user: ProfileType): ProfileResponseInterface {
    const { bio, username, image, following } = user;
    return { profile: { bio, username, image, following } };
  }
}
