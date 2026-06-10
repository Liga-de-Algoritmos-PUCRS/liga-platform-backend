-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN "revoked_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- Tokens emitidos antes desta versão não carregam o claim jti e são
-- irrecuperáveis pelo novo fluxo de refresh: remove-os para forçar um
-- único relogin em vez de acumular linhas órfãs.
DELETE FROM "refresh_tokens";
