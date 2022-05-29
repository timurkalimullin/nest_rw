import { UserEntity } from '../entities/user.entity';

export type UserType = Omit<UserEntity, 'hashPassword' | 'password'>;

export interface UserResponse {
  user: UserType & { token: string };
}
