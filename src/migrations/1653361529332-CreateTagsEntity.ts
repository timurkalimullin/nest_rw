import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTagsEntity1653361529332 implements MigrationInterface {
    name = 'CreateTagsEntity1653361529332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tags"`);
    }

}
