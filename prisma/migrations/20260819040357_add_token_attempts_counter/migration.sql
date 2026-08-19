-- AlterTable
ALTER TABLE "reset_password_tokens" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "token2fa" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0;
