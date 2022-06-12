import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1613122798443 implements MigrationInterface {
  name = 'SeedDb1613122798443';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('test tag'), ('next text tag'), ('nestjs')`,
    );
      // password 123456789
    await queryRunner.query(`
    INSERT INTO users (username, email, password) VALUES ('mcgill', 'mail@mail.ru', '$2b$10$NPvqVIJJY0SYGxquoKciv.VVU8orxkD3pZ8OjTYUQNjhA0GsrXKQe')`)

    const user = await queryRunner.query(`
    SELECT * FROM  users WHERE username = 'mcgill' 
    `)

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'First article description', 'First article body', 'coffee,dragons', '${user[0].id}'), ('second-article', 'Second article', 'Second article description', 'Second article body', 'coffee,dragons', '${user[0].id}')`,
    );
  }

  public async down(): Promise<void> {}
}
