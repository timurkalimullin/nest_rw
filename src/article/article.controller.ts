import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpException,
  Put,
  Query,
} from '@nestjs/common';
import { User } from 'src/common/decorators/user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { TotalArticlesResponseInterface } from './types/totalArticlesResponse.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAAll(
    @User('id') currentUserId: string,
    @Query() query: any
  ): Promise<TotalArticlesResponseInterface> {
    return await this.articleService.findAll(currentUserId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.create(
      currentUser,
      createArticleDto
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async findOne(
    @Param('slug') slug: string
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.findByKey(slug);
    if (!article)
      throw new HttpException('No article found', HttpStatus.NOT_FOUND);

    return this.articleService.buildArticleResponse(article);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  async update(
    @User() user: UserEntity,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto
  ): Promise<ArticleResponseInterface> {
    const updatedArticle = await this.articleService.update(
      slug,
      user,
      updateArticleDto
    );
    return this.articleService.buildArticleResponse(updatedArticle);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async remove(@User() currentUser: UserEntity, @Param('slug') slug: string) {
    return await this.articleService.remove(currentUser, slug);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async addArticleToFavorites(
    @User('id') userId: string,
    @Param('slug') slug: string
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorites(
      userId,
      slug
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async deleteArticleFromFavorites(
    @User('id') userId: string,
    @Param('slug') slug: string
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteArticleFromFavorites(
      userId,
      slug
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Get('feed')
  @UseGuards(AuthGuard)
  async getFeed(
    @User('id') userId: string,
    @Query() query: any
  ): Promise<TotalArticlesResponseInterface> {
    return await this.articleService.getFeed(userId, query);
  }
}
