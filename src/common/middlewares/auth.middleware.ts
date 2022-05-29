import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { ExpressRequestInterface } from '../types/express.request.interface';
import { UserService } from '../../user/user.service';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    const userToken = req.headers.authorization;
    if (!userToken) {
      req.user = null;
      next();
      return;
    }
    try {
      const decoded = verify(userToken, process.env.JWT_SECRET);
      const user = await this.userService.findById(decoded.id);
      req.user = user;
      next();
      return;
    } catch (error) {
      req.user = null;
      next();
      return;
    }
  }
}
