import { Allow, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateArticleDto {
  @MaxLength(100)
  @IsNotEmpty()
  readonly title: string;

  @MaxLength(250)
  @IsNotEmpty()
  readonly description: string;

  @IsNotEmpty()
  readonly body: string;

  @Allow()
  readonly taglist?: string[];
}
