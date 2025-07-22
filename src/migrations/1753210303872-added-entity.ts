import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedEntity1753210303872 implements MigrationInterface {
    name = 'AddedEntity1753210303872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "passwordResetToken" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "passwordResetExpires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetExpires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetToken"`);
    }

}
