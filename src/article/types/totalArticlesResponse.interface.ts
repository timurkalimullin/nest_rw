import { ArticleEntity } from '../entities/article.entity';

export interface TotalArticlesResponseInterface {
  articles: ArticleEntity[];
  articlesCount: number;
}
