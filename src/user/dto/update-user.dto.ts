import { PartialType } from '@nestjs/mapped-types';
import { Allow } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @Allow()
  readonly bio?: string;
  @Allow()
  readonly image?: string;
}
