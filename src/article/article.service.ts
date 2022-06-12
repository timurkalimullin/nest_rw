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
    currentUserId: string,
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

    if (query.favorited) {
      const author = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: ['favorites'],
      });
      const ids = author?.favorites?.map((el) => el.id);

      if (ids?.length) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    let favoriteIds: string[] | undefined = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['favorites'],
      });
      favoriteIds = currentUser?.favorites.map((favorite) => favorite.id);
    }
    const articles = await queryBuilder.getMany();
    const articlesWithFavorited = articles.map((article) => {
      const favorited = favoriteIds?.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorited ?? [], articlesCount };
  }

  async findByKey(slug: string): Promise<ArticleEntity | null> {
    return await this.repository.findOne({
      where: { slug },
    });
  }

  async update(
    slug: string,
    user: UserEntity,
    updateArticleDto: UpdateArticleDto
  ) {
    const article = (await this.findByKey(slug)) as ArticleEntity;

    this.checkArticleAuthor(article, user);

    if (updateArticleDto?.title && updateArticleDto?.title !== article?.title) {
      const updatedSlug = generateSlug(updateArticleDto?.title);
      article.slug = updatedSlug;
    }

    Object.assign(article, updateArticleDto);

    return this.repository.save(article);
  }

  async remove(user: UserEntity, slug: string): Promise<DeleteResult> {
    const currentArticle = await this.findByKey(slug);

    this.checkArticleAuthor(currentArticle, user);

    return await this.repository.delete({ slug });
  }

  async addArticleToFavorites(
    userId: string,
    slug: string
  ): Promise<ArticleEntity> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });
    const article = (await this.findByKey(slug)) as ArticleEntity;

    const isNotFavorited =
      user?.favorites.findIndex((art) => art.id === article.id) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount += 1;
      await this.userRepository.save(user);
      await this.repository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(userId: string, slug: string) {
    const user = (await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    })) as UserEntity;
    const article = (await this.findByKey(slug)) as ArticleEntity;

    const articlesIndex = user?.favorites.findIndex(
      (art) => art.id === article.id
    );

    if (typeof articlesIndex === 'number' && articlesIndex >= 0) {
      user?.favorites.splice(articlesIndex, 1);
      article.favoritesCount -= 1;
      await this.repository.save(article);
      await this.userRepository.save(user);
    }

    return article;
  }

  //#endregion

  //#region Helpers

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  checkArticleAuthor(
    article: ArticleEntity | null,
    user: UserEntity | null
  ): article is ArticleEntity {
    if (!article) {
      throw new HttpException('No article found', HttpStatus.NOT_FOUND);
    }

    if (article?.author.id !== user?.id) {
      throw new HttpException('No permission for action', HttpStatus.FORBIDDEN);
    }

    return true;
  }

  //#endregion
}
