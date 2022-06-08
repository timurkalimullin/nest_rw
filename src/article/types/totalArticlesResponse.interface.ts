import { ArticleType } from '../entities/article.entity';

export interface TotalArticlesResponseInterface {
  articles: ArticleType[];
  articlesCount: number;
}
