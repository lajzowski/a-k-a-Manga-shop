import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateUserTable1710000000001 implements MigrationInterface {
    name = 'CreateUserTable1710000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "shop_user" (
                "id" SERIAL PRIMARY KEY,
                "username" VARCHAR NOT NULL UNIQUE,
                "password" VARCHAR NOT NULL,
                "role" VARCHAR NOT NULL
            );
        `);
        // Вставка дефолтного админа
        const passwordHash = await bcrypt.hash('admin', 10);
        await queryRunner.query(`
            INSERT INTO "shop_user" (username, password, role) VALUES ('admin', '${passwordHash}', 'admin')
            ON CONFLICT (username) DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "shop_user";
        `);
    }
} 