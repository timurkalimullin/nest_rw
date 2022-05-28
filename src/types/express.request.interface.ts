import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';

export interface ExpressRequestInterface extends Request {
  user: User | null;
}
