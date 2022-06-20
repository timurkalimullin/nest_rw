import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFollows1655747522649 implements MigrationInterface {
    name = 'CreateFollows1655747522649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "follows" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "followerId" character varying NOT NULL, "followingId" character varying NOT NULL, CONSTRAINT "PK_8988f607744e16ff79da3b8a627" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "follows"`);
    }

}
