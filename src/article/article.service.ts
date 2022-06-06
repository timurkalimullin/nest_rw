import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleEntity } from './entities/article.entity';
import { UserEntity } from '../user/entities/user.entity';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { generateSlug } from '../common/helpers';
import { TotalArticlesResponseInterface } from './types/totalArticlesResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly repository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  //#region Main

  async create(
    user: UserEntity,
    createArticleDto: CreateArticleDto
  ): Promise<ArticleEntity> {
    const article = await this.repository.create({
      ...createArticleDto,
    });
    article.author = user;
    article.slug = generateSlug(article.title);
    return await this.repository.save(article);
  }

  async findAll(
    id: string,
    query: any
  ): Promise<TotalArticlesResponseInterface> {
    const queryBuilder = await this.repository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: { username: query.author },
      });
      queryBuilder.andWhere('articles.authorId = :id', { id: author?.id });
    }

    const articles = await queryBuilder.getMany();
    return { articles, articlesCount };
  }

  async findOne(slug: string): Promise<ArticleEntity | null> {
    return await this.repository.findOne({
      where: { slug },
    });
  }

  async update(
    slug: string,
    user: UserEntity,
    updateArticleDto: UpdateArticleDto
  ) {
    const article = (await this.findOne(slug)) as ArticleEntity;

    this.checkArticleAuthor(article, user);

    if (updateArticleDto?.title && updateArticleDto?.title !== article?.title) {
      const updatedSlug = generateSlug(updateArticleDto?.title);
      article.slug = updatedSlug;
    }

    Object.assign(article, updateArticleDto);

    return this.repository.save(article);
  }

  async remove(user: UserEntity, slug: string): Promise<DeleteResult> {
    const currentArticle = await this.findOne(slug);

    this.checkArticleAuthor(currentArticle, user);

    return await this.repository.delete({ slug });
  }

  //#endregion

  //#region Helpers

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  checkArticleAuthor(
    article: ArticleEntity | null,
    user: UserEntity
  ): article is ArticleEntity {
    if (!article) {
      throw new HttpException('No article found', HttpStatus.NOT_FOUND);
    }

    if (article?.author.id !== user.id) {
      throw new HttpException(
        'No permission for delete articles',
        HttpStatus.FORBIDDEN
      );
    }

    return true;
  }

  //#endregion
}
