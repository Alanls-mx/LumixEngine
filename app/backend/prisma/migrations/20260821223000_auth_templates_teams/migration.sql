-- User authentication and team management
ALTER TABLE "users" ALTER COLUMN "senha_hash" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN "google_id" TEXT;
ALTER TABLE "users" ADD COLUMN "avatar_url" TEXT;
ALTER TABLE "users" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "team_id" TEXT;
ALTER TABLE "users" ADD COLUMN "ultimo_login" TIMESTAMP(3);

CREATE TABLE "teams" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "descricao" TEXT,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
CREATE INDEX "users_ativo_idx" ON "users"("ativo");
CREATE INDEX "users_team_id_idx" ON "users"("team_id");
CREATE INDEX "teams_ativo_idx" ON "teams"("ativo");

ALTER TABLE "users" ADD CONSTRAINT "users_team_id_fkey"
  FOREIGN KEY ("team_id") REFERENCES "teams"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Message idempotency and provider deduplication
ALTER TABLE "messages" ADD COLUMN "client_request_id" TEXT;
ALTER TABLE "messages" ADD COLUMN "provider_message_id" TEXT;

CREATE UNIQUE INDEX "messages_client_request_id_key" ON "messages"("client_request_id");
CREATE UNIQUE INDEX "messages_provider_message_id_key" ON "messages"("provider_message_id");
CREATE INDEX "messages_provider_message_id_idx" ON "messages"("provider_message_id");

-- Reusable manual and AI-assisted templates
CREATE TABLE "message_templates" (
  "id" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "categoria" TEXT NOT NULL DEFAULT 'geral',
  "conteudo_texto" TEXT NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "uso_ia" BOOLEAN NOT NULL DEFAULT false,
  "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "message_templates_categoria_idx" ON "message_templates"("categoria");
CREATE INDEX "message_templates_ativo_idx" ON "message_templates"("ativo");
