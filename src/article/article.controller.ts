import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { User } from 'src/common/decorators/user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { ArticleResponseinterface } from './types/articleResponse.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto
  ): Promise<ArticleResponseinterface> {
    const article = await this.articleService.create(
      currentUser,
      createArticleDto
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Get()
  findAll() {
    return this.articleService.findAll();
  }

  @Get(':slug')
  async findOne(
    @Param('slug') slug: string
  ): Promise<ArticleResponseinterface> {
    const article = await this.articleService.findOne(slug);
    if (!article)
      throw new HttpException('No article found', HttpStatus.NOT_FOUND);

    return this.articleService.buildArticleResponse(article);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(+id, updateArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleService.remove(+id);
  }
}
