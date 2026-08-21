CREATE TYPE "LeadStatus" AS ENUM ('NOVO_LEAD', 'NEGOCIACAO', 'PROPOSTA', 'GANHO', 'PERDIDO');
CREATE TYPE "MessageOrigem" AS ENUM ('SITE', 'WHATSAPP');
CREATE TYPE "TaskStatus" AS ENUM ('PENDENTE', 'CONCLUIDA');
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ATENDENTE');
CREATE TYPE "MessageDirecao" AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE "MessageStatusEnvio" AS ENUM ('ENVIADO', 'ENTREGUE', 'LIDO', 'ERRO');
CREATE TYPE "NotificationTipo" AS ENUM ('NEW_LEAD', 'NEW_MESSAGE', 'LEAD_ASSIGNED', 'SEND_ERROR', 'SYSTEM');

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "senha_hash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'ATENDENTE',
  "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "leads" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT,
  "telefone" TEXT,
  "status" "LeadStatus" NOT NULL DEFAULT 'NOVO_LEAD',
  "valor_estimado" DECIMAL(12,2),
  "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "assigned_to_id" TEXT,
  "last_interaction_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "messages" (
  "id" TEXT NOT NULL,
  "lead_id" TEXT NOT NULL,
  "conteudo" TEXT NOT NULL,
  "origem" "MessageOrigem" NOT NULL,
  "direcao" "MessageDirecao" NOT NULL DEFAULT 'INBOUND',
  "user_id" TEXT,
  "status_envio" "MessageStatusEnvio" NOT NULL DEFAULT 'ENTREGUE',
  "data_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tasks" (
  "id" TEXT NOT NULL,
  "lead_id" TEXT NOT NULL,
  "descricao" TEXT NOT NULL,
  "status" "TaskStatus" NOT NULL DEFAULT 'PENDENTE',
  "data_limite" TIMESTAMP(3),
  CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auto_responses" (
  "id" TEXT NOT NULL,
  "gatilho" TEXT NOT NULL,
  "conteudo_texto" TEXT NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "auto_responses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "conteudo" TEXT NOT NULL,
  "tipo" "NotificationTipo" NOT NULL DEFAULT 'SYSTEM',
  "lead_id" TEXT,
  "user_id" TEXT,
  "lida" BOOLEAN NOT NULL DEFAULT false,
  "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "app_settings" (
  "id" TEXT NOT NULL,
  "chave" TEXT NOT NULL,
  "valor" TEXT,
  "categoria" TEXT NOT NULL,
  "secreto" BOOLEAN NOT NULL DEFAULT false,
  "data_atualizacao" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "leads_status_idx" ON "leads"("status");
CREATE INDEX "leads_email_idx" ON "leads"("email");
CREATE INDEX "leads_assigned_to_id_idx" ON "leads"("assigned_to_id");
CREATE INDEX "leads_last_interaction_at_idx" ON "leads"("last_interaction_at");
CREATE INDEX "messages_lead_id_idx" ON "messages"("lead_id");
CREATE INDEX "messages_origem_idx" ON "messages"("origem");
CREATE INDEX "messages_direcao_idx" ON "messages"("direcao");
CREATE INDEX "messages_user_id_idx" ON "messages"("user_id");
CREATE INDEX "messages_status_envio_idx" ON "messages"("status_envio");
CREATE INDEX "tasks_lead_id_idx" ON "tasks"("lead_id");
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
CREATE UNIQUE INDEX "auto_responses_gatilho_key" ON "auto_responses"("gatilho");
CREATE INDEX "auto_responses_ativo_idx" ON "auto_responses"("ativo");
CREATE INDEX "notifications_lida_idx" ON "notifications"("lida");
CREATE INDEX "notifications_tipo_idx" ON "notifications"("tipo");
CREATE INDEX "notifications_lead_id_idx" ON "notifications"("lead_id");
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX "notifications_data_criacao_idx" ON "notifications"("data_criacao");
CREATE UNIQUE INDEX "app_settings_chave_key" ON "app_settings"("chave");
CREATE INDEX "app_settings_categoria_idx" ON "app_settings"("categoria");

ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
