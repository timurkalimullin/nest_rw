import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(100)
  readonly username: string;

  @IsNotEmpty()
  @MaxLength(100)
  @IsEmail()
  readonly email: string;

  @MinLength(8)
  @MaxLength(100)
  readonly password: string;
}
