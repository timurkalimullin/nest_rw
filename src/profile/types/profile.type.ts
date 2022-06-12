import { UserType } from '../../user/types/UserResponse.interface';

export type ProfileType = Pick<UserType, 'bio' | 'image' | 'username'> & {
  following: boolean;
};

export interface ProfileResponseInterface {
  profile: ProfileType;
}
