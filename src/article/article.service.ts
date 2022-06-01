import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleEntity } from './entities/article.entity';
import { UserEntity } from '../user/entities/user.entity';
import { ArticleResponseinterface } from './types/articleResponse.interface';
import { generateSlug } from '../common/helpers';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly repository: Repository<ArticleEntity>
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

  findAll() {
    return `This action returns all article`;
  }

  async findOne(slug: string): Promise<ArticleEntity | null> {
    return await this.repository.findOne({
      where: { slug },
    });
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return `This action updates a #${id} article`;
  }

  async remove(user: UserEntity, slug: string): Promise<DeleteResult> {
    const currentArticle = await this.findOne(slug);

    if (!currentArticle) {
      throw new HttpException('No article found', HttpStatus.NOT_FOUND);
    }

    if (currentArticle?.author.id !== user.id) {
      throw new HttpException(
        'no permission for dlete articles',
        HttpStatus.FORBIDDEN
      );
    }
    return await this.repository.delete({ slug });
  }

  //#endregion

  //#region Helpers

  buildArticleResponse(article: ArticleEntity): ArticleResponseinterface {
    return { article };
  }

  //#endregion
}
