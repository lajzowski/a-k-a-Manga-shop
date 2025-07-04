import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFandomTable1710000000000 implements MigrationInterface {
    name = 'CreateFandomTable1710000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "fandom" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "image_url" VARCHAR
      );
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      DROP TABLE "fandom";
    `);
    }
}