-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'SYSTEM',
    "lead_id" TEXT,
    "user_id" TEXT,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "data_criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chave" TEXT NOT NULL,
    "valor" TEXT,
    "categoria" TEXT NOT NULL,
    "secreto" BOOLEAN NOT NULL DEFAULT false,
    "data_atualizacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "notifications_lida_idx" ON "notifications"("lida");

-- CreateIndex
CREATE INDEX "notifications_tipo_idx" ON "notifications"("tipo");

-- CreateIndex
CREATE INDEX "notifications_lead_id_idx" ON "notifications"("lead_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_data_criacao_idx" ON "notifications"("data_criacao");

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_chave_key" ON "app_settings"("chave");

-- CreateIndex
CREATE INDEX "app_settings_categoria_idx" ON "app_settings"("categoria");
