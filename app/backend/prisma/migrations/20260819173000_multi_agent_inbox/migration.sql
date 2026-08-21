-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ATENDENTE',
    "data_criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "auto_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gatilho" TEXT NOT NULL,
    "conteudo_texto" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AlterTable
ALTER TABLE "leads" ADD COLUMN "assigned_to_id" TEXT REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "leads" ADD COLUMN "last_interaction_at" DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00';
UPDATE "leads" SET "last_interaction_at" = COALESCE(
    (SELECT MAX("data_envio") FROM "messages" WHERE "messages"."lead_id" = "leads"."id"),
    "data_criacao",
    CURRENT_TIMESTAMP
);

-- AlterTable
ALTER TABLE "messages" ADD COLUMN "direcao" TEXT NOT NULL DEFAULT 'INBOUND';
ALTER TABLE "messages" ADD COLUMN "user_id" TEXT REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "messages" ADD COLUMN "status_envio" TEXT NOT NULL DEFAULT 'ENTREGUE';

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "auto_responses_gatilho_key" ON "auto_responses"("gatilho");

-- CreateIndex
CREATE INDEX "auto_responses_ativo_idx" ON "auto_responses"("ativo");

-- CreateIndex
CREATE INDEX "leads_assigned_to_id_idx" ON "leads"("assigned_to_id");

-- CreateIndex
CREATE INDEX "leads_last_interaction_at_idx" ON "leads"("last_interaction_at");

-- CreateIndex
CREATE INDEX "messages_direcao_idx" ON "messages"("direcao");

-- CreateIndex
CREATE INDEX "messages_user_id_idx" ON "messages"("user_id");

-- CreateIndex
CREATE INDEX "messages_status_envio_idx" ON "messages"("status_envio");
