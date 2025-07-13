import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueIndexToReportItem1710000000004 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_report_item_unique"
            ON "report_item" ("source", "name", "group", "sale_price", "sale_date")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "IDX_report_item_unique"
        `);
    }
} 