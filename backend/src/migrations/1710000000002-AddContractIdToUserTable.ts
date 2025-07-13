import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContractIdToUserTable1710000000002 implements MigrationInterface {
    name = 'AddContractIdToUserTable1710000000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "shop_user"
            ADD COLUMN "contract_id" VARCHAR;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "shop_user"
            DROP COLUMN "contract_id";
        `);
    }
} 