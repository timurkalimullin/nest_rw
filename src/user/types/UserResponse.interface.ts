import { User } from '../entities/user.entity';

export type UserType = Omit<User, 'hashPassword' | 'password'>;

export interface UserResponse {
  user: UserType & { token: string };
}
