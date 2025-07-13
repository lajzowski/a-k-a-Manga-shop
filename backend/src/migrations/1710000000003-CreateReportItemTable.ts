import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateReportItemTable1710000000003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'report_item',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'name',
                    type: 'varchar',
                },
                {
                    name: 'sale_price',
                    type: 'float',
                },
                {
                    name: 'amount',
                    type: 'float',
                },
                {
                    name: 'total',
                    type: 'float',
                },
                {
                    name: 'commission',
                    type: 'float',
                },
                {
                    name: 'authorAmount',
                    type: 'float',
                },
                {
                    name: 'rest',
                    type: 'float',
                    isNullable: true,
                },
                {
                    name: 'group',
                    type: 'varchar',
                },
                {
                    name: 'sale_date',
                    type: 'timestamp',
                },
                {
                    name: 'source',
                    type: 'varchar',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('report_item');
    }
} 