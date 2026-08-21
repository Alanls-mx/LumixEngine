import "dotenv/config";

import cors from "@fastify/cors";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Fastify from "fastify";
import { Server as SocketIOServer } from "socket.io";
import { z } from "zod";

import {
  LeadStatus,
  MessageDirecao,
  MessageOrigem,
  MessageStatusEnvio,
  NotificationTipo,
  Prisma,
  PrismaClient,
} from "../generated/prisma/client.js";
import {
  getMailStatus,
  sendLeadWebhookEmails,
  sendTestEmail,
  verifyMailSettings,
  type MailSettings,
} from "./services/mail.js";
import {
  getWhatsAppStatus,
  normalizePhone,
  sendWhatsAppMessage,
  type WhatsAppSettings,
} from "./services/whatsapp.js";

const PORT = Number(process.env.PORT ?? 3333);
const HOST = process.env.HOST ?? "0.0.0.0";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

function parseOriginList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = [
  ...new Set([
    FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://lumixengine-app.onrender.com",
    "https://lumixengine-app-frontend.onrender.com",
    "https://lumixengine.com",
    "https://www.lumixengine.com",
    ...parseOriginList(process.env.CORS_ORIGINS),
  ]),
];

const sqliteUrl =
  process.env.DATABASE_URL === "file:./dev.db"
    ? "file:./prisma/dev.db"
    : (process.env.DATABASE_URL ?? "file:./prisma/dev.db");

const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
const prisma = new PrismaClient({ adapter });

const app = Fastify({
  logger: true,
});

const leadInclude = {
  assigned_to: true,
  messages: {
    include: {
      user: true,
    },
    orderBy: {
      data_envio: "desc",
    },
  },
  tasks: {
    orderBy: {
      data_limite: "asc",
    },
  },
} satisfies Prisma.LeadInclude;

await app.register(cors, {
  origin: allowedOrigins,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
  credentials: true,
});

const io = new SocketIOServer(app.server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  app.log.info({ socketId: socket.id }, "WebSocket client connected");

  socket.on("disconnect", (reason) => {
    app.log.info({ socketId: socket.id, reason }, "WebSocket client disconnected");
  });
});

const leadStatusSchema = z.enum([
  LeadStatus.NOVO_LEAD,
  LeadStatus.NEGOCIACAO,
  LeadStatus.PROPOSTA,
  LeadStatus.GANHO,
  LeadStatus.PERDIDO,
]);

const leadCreateSchema = z.object({
  nome: z.string().trim().min(1),
  email: z.string().trim().email().optional(),
  telefone: z.string().trim().min(1).optional(),
  status: leadStatusSchema.default(LeadStatus.NOVO_LEAD),
  valor_estimado: z.coerce.number().nonnegative().optional(),
});

const leadUpdateSchema = z
  .object({
    nome: z.string().trim().min(1).optional(),
    email: z.string().trim().email().nullable().optional(),
    telefone: z.string().trim().min(1).nullable().optional(),
    status: leadStatusSchema.optional(),
    valor_estimado: z.coerce.number().nonnegative().nullable().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Informe pelo menos um campo para atualizar.",
  });

const leadAssignSchema = z.object({
  assigned_to_id: z.string().trim().min(1).nullable(),
});

const sendMessageSchema = z.object({
  lead_id: z.string().trim().min(1),
  conteudo: z.string().trim().min(1),
  user_id: z.string().trim().min(1).optional(),
});

const appSettingsSchema = z.object({
  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: z.string().trim().optional(),
  SMTP_USER: z.string().trim().optional(),
  SMTP_PASS: z.string().trim().optional(),
  SMTP_FROM: z.string().trim().optional(),
  INTERNAL_LEAD_NOTIFICATION_EMAIL: z.string().trim().optional(),
  WHATSAPP_API_URL: z.string().trim().optional(),
  WHATSAPP_API_TOKEN: z.string().trim().optional(),
});

const testEmailSchema = z.object({
  to: z.string().trim().email(),
});

const notificationCreateSchema = z.object({
  titulo: z.string().trim().min(1),
  conteudo: z.string().trim().min(1),
  tipo: z
    .enum([
      NotificationTipo.NEW_LEAD,
      NotificationTipo.NEW_MESSAGE,
      NotificationTipo.LEAD_ASSIGNED,
      NotificationTipo.SEND_ERROR,
      NotificationTipo.SYSTEM,
    ])
    .default(NotificationTipo.SYSTEM),
  lead_id: z.string().trim().min(1).optional(),
  user_id: z.string().trim().min(1).optional(),
});

const webhookMetadataSchema = z
  .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
  .optional();

const webhookLeadRawSchema = z
  .object({
    nome: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    telefone: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1).optional(),
    status: leadStatusSchema.optional(),
    valor_estimado: z.coerce.number().nonnegative().optional(),
    estimated_value: z.coerce.number().nonnegative().optional(),
    conteudo: z.string().trim().min(1).optional(),
    message: z.string().trim().min(1).optional(),
    origem: z.enum([MessageOrigem.SITE, MessageOrigem.WHATSAPP]).optional(),
    source: z.enum(["site", "whatsapp", "SITE", "WHATSAPP"]).optional(),
    form_id: z.string().trim().min(1).optional(),
    pagina_url: z.string().trim().min(1).optional(),
    page_url: z.string().trim().min(1).optional(),
    pagina_path: z.string().trim().min(1).optional(),
    page_path: z.string().trim().min(1).optional(),
    pagina_titulo: z.string().trim().min(1).optional(),
    page_title: z.string().trim().min(1).optional(),
    referrer: z.string().trim().min(1).optional(),
    referer: z.string().trim().min(1).optional(),
    user_agent: z.string().trim().min(1).optional(),
    userAgent: z.string().trim().min(1).optional(),
    idioma: z.string().trim().min(1).optional(),
    language: z.string().trim().min(1).optional(),
    timezone: z.string().trim().min(1).optional(),
    viewport: z.string().trim().min(1).optional(),
    utm_source: z.string().trim().min(1).optional(),
    utm_medium: z.string().trim().min(1).optional(),
    utm_campaign: z.string().trim().min(1).optional(),
    utm_term: z.string().trim().min(1).optional(),
    utm_content: z.string().trim().min(1).optional(),
    gclid: z.string().trim().min(1).optional(),
    fbclid: z.string().trim().min(1).optional(),
    metadata: webhookMetadataSchema,
  })
  .passthrough();

const webhookLeadSchema = z.object({
  nome: z.string().trim().min(1),
  email: z.string().trim().email().optional(),
  telefone: z.string().trim().min(1).optional(),
  status: leadStatusSchema,
  valor_estimado: z.coerce.number().nonnegative().optional(),
  conteudo: z.string().trim().min(1).optional(),
  origem: z.enum([MessageOrigem.SITE, MessageOrigem.WHATSAPP]),
});

function normalizeOrigem(
  value: "site" | "whatsapp" | "SITE" | "WHATSAPP" | undefined,
) {
  if (!value) {
    return MessageOrigem.SITE;
  }

  return value.toUpperCase() as typeof MessageOrigem.SITE | typeof MessageOrigem.WHATSAPP;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNestedString(value: unknown, path: string[]) {
  let currentValue = value;

  for (const segment of path) {
    if (!isRecord(currentValue)) {
      return undefined;
    }

    currentValue = currentValue[segment];
  }

  return typeof currentValue === "string" ? currentValue : undefined;
}

function extractWhatsAppPhone(body: unknown) {
  const phone =
    getNestedString(body, ["telefone"]) ??
    getNestedString(body, ["phone"]) ??
    getNestedString(body, ["from"]) ??
    getNestedString(body, ["number"]) ??
    getNestedString(body, ["sender"]) ??
    getNestedString(body, ["data", "key", "remoteJid"]) ??
    getNestedString(body, ["data", "remoteJid"]);

  return phone ? normalizePhone(phone) : undefined;
}

function extractWhatsAppText(body: unknown) {
  return (
    getNestedString(body, ["conteudo"]) ??
    getNestedString(body, ["text"]) ??
    getNestedString(body, ["message"]) ??
    getNestedString(body, ["body"]) ??
    getNestedString(body, ["data", "message", "conversation"]) ??
    getNestedString(body, ["data", "message", "extendedTextMessage", "text"])
  );
}

function extractWhatsAppName(body: unknown) {
  return (
    getNestedString(body, ["nome"]) ??
    getNestedString(body, ["name"]) ??
    getNestedString(body, ["pushName"]) ??
    getNestedString(body, ["data", "pushName"]) ??
    "Lead WhatsApp"
  );
}

function settingCategory(key: string) {
  if (key.startsWith("SMTP_") || key === "INTERNAL_LEAD_NOTIFICATION_EMAIL") {
    return "email";
  }

  if (key.startsWith("WHATSAPP_")) {
    return "whatsapp";
  }

  return "system";
}

function isSecretSetting(key: string) {
  return key.endsWith("_PASS") || key.endsWith("_TOKEN");
}

async function getSettingsMap() {
  const settings = await prisma.appSetting.findMany();

  return Object.fromEntries(
    settings.map((setting) => [setting.chave, setting.valor]),
  ) as Record<string, string | null>;
}

async function getMailSettings() {
  const settings = await getSettingsMap();

  return {
    SMTP_HOST: settings.SMTP_HOST,
    SMTP_PORT: settings.SMTP_PORT,
    SMTP_USER: settings.SMTP_USER,
    SMTP_PASS: settings.SMTP_PASS,
    SMTP_FROM: settings.SMTP_FROM,
    INTERNAL_LEAD_NOTIFICATION_EMAIL:
      settings.INTERNAL_LEAD_NOTIFICATION_EMAIL,
  } satisfies MailSettings;
}

async function getWhatsAppSettings() {
  const settings = await getSettingsMap();

  return {
    WHATSAPP_API_URL: settings.WHATSAPP_API_URL,
    WHATSAPP_API_TOKEN: settings.WHATSAPP_API_TOKEN,
  } satisfies WhatsAppSettings;
}

async function listPublicSettings() {
  const settings = await prisma.appSetting.findMany({
    orderBy: [
      {
        categoria: "asc",
      },
      {
        chave: "asc",
      },
    ],
  });

  return settings.map((setting) => ({
    ...setting,
    valor: setting.secreto && setting.valor ? "********" : setting.valor,
    configured: Boolean(setting.valor),
  }));
}

async function upsertSettings(payload: z.infer<typeof appSettingsSchema>) {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);

  for (const [key, value] of entries) {
    if (isSecretSetting(key) && value === "") {
      continue;
    }

    const settingValue = value === "" ? null : (value ?? null);

    await prisma.appSetting.upsert({
      where: {
        chave: key,
      },
      update: {
        valor: settingValue,
        categoria: settingCategory(key),
        secreto: isSecretSetting(key),
      },
      create: {
        chave: key,
        valor: settingValue,
        categoria: settingCategory(key),
        secreto: isSecretSetting(key),
      },
    });
  }
}

async function createNotification(
  input: z.infer<typeof notificationCreateSchema>,
) {
  const data: Prisma.NotificationUncheckedCreateInput = {
    titulo: input.titulo,
    conteudo: input.conteudo,
    tipo: input.tipo,
    lead_id: input.lead_id ?? null,
    user_id: input.user_id ?? null,
  };

  const notification = await prisma.notification.create({
    data,
    include: {
      lead: true,
      user: true,
    },
  });

  io.emit("notification_created", notification);

  return notification;
}

function getSmtpErrorMessage(error: unknown) {
  if (!isRecord(error)) {
    return "Falha ao conectar ao SMTP.";
  }

  const code = typeof error.code === "string" ? error.code : undefined;
  const command =
    typeof error.command === "string" ? error.command : undefined;
  const hostname =
    typeof error.hostname === "string" ? error.hostname : undefined;
  const response =
    typeof error.response === "string" ? error.response : undefined;

  if (code === "EDNS" || code === "ENOTFOUND" || code === "EAI_AGAIN") {
    return `Host SMTP nao encontrado${hostname ? `: ${hostname}` : ""}. Confira o campo SMTP Host ou crie o registro DNS correspondente.`;
  }

  if (code === "EAUTH") {
    return "Falha de autenticacao SMTP. Confira usuario, senha/app password e permissoes da conta.";
  }

  if (code === "ECONNECTION" || code === "ETIMEDOUT" || code === "ESOCKET") {
    return "Nao foi possivel conectar ao servidor SMTP. Confira host, porta e SSL/TLS.";
  }

  if (response) {
    return `Servidor SMTP recusou a operacao${command ? ` (${command})` : ""}: ${response}`;
  }

  return "Falha ao conectar ao SMTP. Confira host, porta, usuario, senha e remetente.";
}

function pushDetail(lines: string[], label: string, value: unknown) {
  if (typeof value === "string" && value.trim().length > 0) {
    lines.push(`${label}: ${value.trim()}`);
  }
}

function formatWebhookLeadContext(payload: z.infer<typeof webhookLeadRawSchema>) {
  const lines: string[] = [];

  pushDetail(lines, "Formulário", payload.form_id);
  pushDetail(lines, "Página", payload.pagina_url ?? payload.page_url);
  pushDetail(lines, "Caminho", payload.pagina_path ?? payload.page_path);
  pushDetail(lines, "Título", payload.pagina_titulo ?? payload.page_title);
  pushDetail(lines, "Referrer", payload.referrer ?? payload.referer);
  pushDetail(lines, "Idioma", payload.idioma ?? payload.language);
  pushDetail(lines, "Timezone", payload.timezone);
  pushDetail(lines, "Viewport", payload.viewport);
  pushDetail(lines, "User-Agent", payload.user_agent ?? payload.userAgent);
  pushDetail(lines, "UTM Source", payload.utm_source);
  pushDetail(lines, "UTM Medium", payload.utm_medium);
  pushDetail(lines, "UTM Campaign", payload.utm_campaign);
  pushDetail(lines, "UTM Term", payload.utm_term);
  pushDetail(lines, "UTM Content", payload.utm_content);
  pushDetail(lines, "GCLID", payload.gclid);
  pushDetail(lines, "FBCLID", payload.fbclid);

  if (payload.metadata && Object.keys(payload.metadata).length > 0) {
    lines.push("Metadados:");

    for (const [key, value] of Object.entries(payload.metadata)) {
      lines.push(`- ${key}: ${String(value)}`);
    }
  }

  return lines.length > 0 ? `[Contexto do site]\n${lines.join("\n")}` : undefined;
}

function parseWebhookLead(body: unknown) {
  const payload = webhookLeadRawSchema.parse(body);
  const conteudo = [payload.conteudo ?? payload.message, formatWebhookLeadContext(payload)]
    .filter(Boolean)
    .join("\n\n");

  return webhookLeadSchema.parse({
    nome: payload.nome ?? payload.name,
    email: payload.email,
    telefone: payload.telefone ?? payload.phone,
    status: payload.status ?? LeadStatus.NOVO_LEAD,
    valor_estimado: payload.valor_estimado ?? payload.estimated_value,
    conteudo: conteudo || undefined,
    origem: normalizeOrigem(payload.origem ?? payload.source),
  });
}

function toLeadCreateData(payload: z.infer<typeof leadCreateSchema>) {
  const data: Prisma.LeadCreateInput = {
    nome: payload.nome,
    status: payload.status,
    last_interaction_at: new Date(),
  };

  if (payload.email) {
    data.email = payload.email;
  }

  if (payload.telefone) {
    data.telefone = payload.telefone;
  }

  if (payload.valor_estimado !== undefined) {
    data.valor_estimado = new Prisma.Decimal(payload.valor_estimado);
  }

  return data;
}

function toLeadUpdateData(payload: z.infer<typeof leadUpdateSchema>) {
  const data: Prisma.LeadUpdateInput = {};

  if (payload.nome !== undefined) {
    data.nome = payload.nome;
  }

  if (payload.email !== undefined) {
    data.email = payload.email;
  }

  if (payload.telefone !== undefined) {
    data.telefone = payload.telefone;
  }

  if (payload.status !== undefined) {
    data.status = payload.status;
  }

  if (payload.valor_estimado !== undefined) {
    data.valor_estimado =
      payload.valor_estimado === null
        ? null
        : new Prisma.Decimal(payload.valor_estimado);
  }

  return data;
}

async function listLeads() {
  return prisma.lead.findMany({
    include: leadInclude,
    orderBy: {
      last_interaction_at: "desc",
    },
  });
}

app.get("/health", async () => ({
  status: "ok",
  service: "lumixengine-api",
}));

app.get("/api/settings", async () => {
  const [settings, mailSettings, whatsappSettings] = await Promise.all([
    listPublicSettings(),
    getMailSettings(),
    getWhatsAppSettings(),
  ]);

  return {
    settings,
    status: {
      email: getMailStatus(mailSettings),
      whatsapp: getWhatsAppStatus(whatsappSettings),
    },
  };
});

app.put("/api/settings", async (request) => {
  const payload = appSettingsSchema.parse(request.body);
  await upsertSettings(payload);

  return {
    ok: true,
    ...(await (async () => {
      const [settings, mailSettings, whatsappSettings] = await Promise.all([
        listPublicSettings(),
        getMailSettings(),
        getWhatsAppSettings(),
      ]);

      return {
        settings,
        status: {
          email: getMailStatus(mailSettings),
          whatsapp: getWhatsAppStatus(whatsappSettings),
        },
      };
    })()),
  };
});

app.post("/api/settings/email/test", async (request, reply) => {
  const payload = testEmailSchema.parse(request.body);
  const mailSettings = await getMailSettings();

  try {
    const result = await sendTestEmail(payload.to, mailSettings);

    if (!result.ok) {
      return reply.status(400).send(result);
    }

    await createNotification({
      titulo: "E-mail de teste enviado",
      conteudo: `Teste SMTP enviado para ${payload.to}.`,
      tipo: NotificationTipo.SYSTEM,
    });

    return result;
  } catch (error) {
    app.log.error({ error }, "Erro no teste SMTP");

    return reply.status(400).send({
      ok: false,
      message: getSmtpErrorMessage(error),
    });
  }
});

app.post("/api/settings/email/verify", async (_request, reply) => {
  const mailSettings = await getMailSettings();

  try {
    return await verifyMailSettings(mailSettings);
  } catch (error) {
    app.log.error({ error }, "Erro ao verificar SMTP");

    return reply.status(400).send({
      ok: false,
      message: getSmtpErrorMessage(error),
    });
  }
});

app.get("/api/notifications", async () =>
  prisma.notification.findMany({
    include: {
      lead: true,
      user: true,
    },
    orderBy: {
      data_criacao: "desc",
    },
    take: 50,
  }),
);

app.post("/api/notifications", async (request, reply) => {
  const payload = notificationCreateSchema.parse(request.body);
  const notification = await createNotification(payload);
  reply.code(201);
  return notification;
});

app.patch("/api/notifications/:id/read", async (request) => {
  const { id } = z.object({ id: z.string().min(1) }).parse(request.params);

  return prisma.notification.update({
    where: {
      id,
    },
    data: {
      lida: true,
    },
    include: {
      lead: true,
      user: true,
    },
  });
});

app.post("/api/notifications/read-all", async () => {
  await prisma.notification.updateMany({
    data: {
      lida: true,
    },
    where: {
      lida: false,
    },
  });

  return {
    ok: true,
  };
});

app.get("/api/users", async () =>
  prisma.user.findMany({
    orderBy: {
      nome: "asc",
    },
  }),
);

app.get("/api/leads", async () => listLeads());
app.get("/leads", async () => listLeads());

async function createLeadRoute(request: { body: unknown }) {
  const payload = leadCreateSchema.parse(request.body);
  const lead = await prisma.lead.create({
    data: toLeadCreateData(payload),
    include: leadInclude,
  });

  io.emit("new_lead", lead);
  await createNotification({
    titulo: "Novo lead manual",
    conteudo: `${lead.nome} foi adicionado ao pipeline.`,
    tipo: NotificationTipo.NEW_LEAD,
    lead_id: lead.id,
  });

  return lead;
}

app.post("/api/leads", createLeadRoute);
app.post("/leads", createLeadRoute);

async function updateLeadRoute(request: { body: unknown; params: unknown }) {
  const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
  const payload = leadUpdateSchema.parse(request.body);

  const lead = await prisma.lead.update({
    where: {
      id,
    },
    data: toLeadUpdateData(payload),
    include: leadInclude,
  });

  io.emit("lead_updated", lead);

  return lead;
}

app.patch("/api/leads/:id", updateLeadRoute);
app.patch("/leads/:id", updateLeadRoute);

async function assignLeadRoute(request: { body: unknown; params: unknown }) {
  const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
  const payload = leadAssignSchema.parse(request.body);

  if (payload.assigned_to_id) {
    await prisma.user.findUniqueOrThrow({
      where: {
        id: payload.assigned_to_id,
      },
    });
  }

  const lead = await prisma.lead.update({
    where: {
      id,
    },
    data: {
      assigned_to_id: payload.assigned_to_id,
    },
    include: leadInclude,
  });

  io.emit("lead_assigned", lead);
  io.emit("lead_updated", lead);
  await createNotification({
    titulo: "Atendimento atribuído",
    conteudo: lead.assigned_to
      ? `${lead.nome} agora está com ${lead.assigned_to.nome}.`
      : `${lead.nome} ficou sem atendente atribuído.`,
    tipo: NotificationTipo.LEAD_ASSIGNED,
    lead_id: lead.id,
    ...(lead.assigned_to_id
      ? {
          user_id: lead.assigned_to_id,
        }
      : {}),
  });

  return lead;
}

app.patch("/api/leads/:id/assign", assignLeadRoute);

async function sendMessageRoute(request: { body: unknown }, reply: { status: (statusCode: number) => { send: (payload: unknown) => unknown } }) {
  const payload = sendMessageSchema.parse(request.body);

  const lead = await prisma.lead.findUniqueOrThrow({
    where: {
      id: payload.lead_id,
    },
  });

  if (!lead.telefone) {
    return reply.status(400).send({
      error: "missing_phone",
      message: "Lead sem telefone para envio via WhatsApp.",
    });
  }

  const message = await prisma.message.create({
    data: {
      lead_id: payload.lead_id,
      conteudo: payload.conteudo,
      origem: MessageOrigem.WHATSAPP,
      direcao: MessageDirecao.OUTBOUND,
      status_envio: MessageStatusEnvio.ENVIADO,
      ...(payload.user_id ? { user_id: payload.user_id } : {}),
    },
    include: {
      user: true,
      lead: true,
    },
  });

  await prisma.lead.update({
    where: {
      id: payload.lead_id,
    },
    data: {
      last_interaction_at: new Date(),
    },
  });

  io.emit("message_sent", message);
  const whatsappSettings = await getWhatsAppSettings();

  const delivery = await sendWhatsAppMessage({
    telefone: lead.telefone,
    conteudo: payload.conteudo,
    settings: whatsappSettings,
  });

  if (!delivery.ok && !delivery.skipped) {
    const failedMessage = await prisma.message.update({
      where: {
        id: message.id,
      },
      data: {
        status_envio: MessageStatusEnvio.ERRO,
      },
      include: {
        user: true,
        lead: true,
      },
    });

    io.emit("message_updated", failedMessage);
    await createNotification({
      titulo: "Falha no envio WhatsApp",
      conteudo: `A mensagem para ${lead.nome} não foi entregue pelo gateway.`,
      tipo: NotificationTipo.SEND_ERROR,
      lead_id: lead.id,
      ...(payload.user_id
        ? {
            user_id: payload.user_id,
          }
        : {}),
    });

    return {
      ok: false,
      delivery,
      message: failedMessage,
    };
  }

  return {
    ok: true,
    delivery,
    message,
  };
}

app.post("/api/messages/send", sendMessageRoute);

async function webhookLeadRoute(request: { body: unknown }, reply: { code: (statusCode: number) => unknown }) {
  const payload = parseWebhookLead(request.body);

  const lead = await prisma.lead.create({
    data: {
      ...toLeadCreateData(payload),
      ...(payload.conteudo
        ? {
            messages: {
              create: {
                conteudo: payload.conteudo,
                origem: payload.origem,
                direcao: MessageDirecao.INBOUND,
                status_envio: MessageStatusEnvio.ENTREGUE,
              },
            },
          }
        : {}),
    },
    include: leadInclude,
  });

  io.emit("new_lead", lead);
  await createNotification({
    titulo: "Novo lead recebido",
    conteudo: `${lead.nome} entrou pelo webhook ${payload.origem}.`,
    tipo: NotificationTipo.NEW_LEAD,
    lead_id: lead.id,
  });

  void getMailSettings()
    .then((mailSettings) =>
      sendLeadWebhookEmails(
        {
          nome: lead.nome,
          email: lead.email,
          telefone: lead.telefone,
          conteudo: payload.conteudo,
          origem: payload.origem,
          ...(lead.valor_estimado
            ? {
                valor_estimado: lead.valor_estimado.toString(),
              }
            : {}),
        },
        mailSettings,
      ),
    )
    .catch((error) => {
      app.log.error({ error }, "Erro ao enviar e-mails do webhook de lead");
    });

  reply.code(201);

  return {
    ok: true,
    lead,
  };
}

async function findLeadByNormalizedPhone(phone: string) {
  const leadsWithPhone = await prisma.lead.findMany({
    where: {
      telefone: {
        not: null,
      },
    },
  });

  return leadsWithPhone.find((lead) => normalizePhone(lead.telefone ?? "") === phone);
}

async function sendWelcomeAutoResponse(lead: { id: string; telefone: string | null }) {
  if (!lead.telefone) {
    return;
  }

  const autoResponse = await prisma.autoResponse.findFirst({
    where: {
      gatilho: "boas_vindas",
      ativo: true,
    },
  });

  if (!autoResponse) {
    return;
  }

  const message = await prisma.message.create({
    data: {
      lead_id: lead.id,
      conteudo: autoResponse.conteudo_texto,
      origem: MessageOrigem.WHATSAPP,
      direcao: MessageDirecao.OUTBOUND,
      status_envio: MessageStatusEnvio.ENVIADO,
    },
    include: {
      user: true,
      lead: true,
    },
  });

  io.emit("message_sent", message);
  const whatsappSettings = await getWhatsAppSettings();

  const delivery = await sendWhatsAppMessage({
    telefone: lead.telefone,
    conteudo: autoResponse.conteudo_texto,
    settings: whatsappSettings,
  });

  if (!delivery.ok && !delivery.skipped) {
    const failedMessage = await prisma.message.update({
      where: {
        id: message.id,
      },
      data: {
        status_envio: MessageStatusEnvio.ERRO,
      },
      include: {
        user: true,
        lead: true,
      },
    });

    io.emit("message_updated", failedMessage);
    await createNotification({
      titulo: "Falha na resposta automática",
      conteudo: "A resposta automática de boas-vindas não foi entregue.",
      tipo: NotificationTipo.SEND_ERROR,
      lead_id: lead.id,
    });
  }
}

async function webhookWhatsAppRoute(request: { body: unknown }, reply: { status: (statusCode: number) => { send: (payload: unknown) => unknown }; code: (statusCode: number) => unknown }) {
  const phone = extractWhatsAppPhone(request.body);
  const conteudo = extractWhatsAppText(request.body);

  if (!phone || !conteudo) {
    return reply.status(400).send({
      error: "invalid_whatsapp_payload",
      message: "Payload sem telefone ou conteúdo de mensagem.",
    });
  }

  const existingLead = await findLeadByNormalizedPhone(phone);
  const isNewLead = !existingLead;

  const lead = existingLead
    ? await prisma.lead.update({
        where: {
          id: existingLead.id,
        },
        data: {
          last_interaction_at: new Date(),
        },
        include: leadInclude,
      })
    : await prisma.lead.create({
        data: {
          nome: extractWhatsAppName(request.body),
          telefone: `+${phone}`,
          status: LeadStatus.NOVO_LEAD,
          last_interaction_at: new Date(),
        },
        include: leadInclude,
      });

  const inboundMessage = await prisma.message.create({
    data: {
      lead_id: lead.id,
      conteudo,
      origem: MessageOrigem.WHATSAPP,
      direcao: MessageDirecao.INBOUND,
      status_envio: MessageStatusEnvio.ENTREGUE,
    },
    include: {
      user: true,
      lead: true,
    },
  });

  const updatedLead = await prisma.lead.findUniqueOrThrow({
    where: {
      id: lead.id,
    },
    include: leadInclude,
  });

  io.emit("new_message", inboundMessage);
  io.emit(isNewLead ? "new_lead" : "lead_updated", updatedLead);
  await createNotification({
    titulo: isNewLead ? "Novo lead via WhatsApp" : "Nova mensagem WhatsApp",
    conteudo: `${updatedLead.nome}: ${conteudo.slice(0, 120)}`,
    tipo: isNewLead
      ? NotificationTipo.NEW_LEAD
      : NotificationTipo.NEW_MESSAGE,
    lead_id: updatedLead.id,
    ...(updatedLead.assigned_to_id
      ? {
          user_id: updatedLead.assigned_to_id,
        }
      : {}),
  });

  if (isNewLead) {
    void sendWelcomeAutoResponse({
      id: updatedLead.id,
      telefone: updatedLead.telefone,
    })
      .then(async () => {
        const refreshedLead = await prisma.lead.findUnique({
          where: {
            id: updatedLead.id,
          },
          include: leadInclude,
        });

        if (refreshedLead) {
          io.emit("lead_updated", refreshedLead);
        }
      })
      .catch((error) => {
        app.log.error({ error }, "Erro ao enviar resposta automática");
      });
  }

  reply.code(201);

  return {
    ok: true,
    lead: updatedLead,
    message: inboundMessage,
  };
}

app.post("/api/webhooks/lead", webhookLeadRoute);
app.post("/api/webhooks", webhookLeadRoute);
app.post("/webhooks", webhookLeadRoute);
app.post("/api/webhooks/whatsapp", webhookWhatsAppRoute);

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof z.ZodError) {
    return reply.status(400).send({
      error: "validation_error",
      issues: error.issues,
    });
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return reply.status(404).send({
      error: "not_found",
      message: "Lead nao encontrado.",
    });
  }

  app.log.error(error);

  return reply.status(500).send({
    error: "internal_server_error",
    message: "Erro interno no servidor.",
  });
});

const close = async () => {
  app.log.info("Shutting down LumixEngine API");
  await prisma.$disconnect();
  await app.close();
};

process.on("SIGINT", () => {
  void close().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void close().finally(() => process.exit(0));
});

try {
  await app.listen({
    port: PORT,
    host: HOST,
  });

  app.log.info(`LumixEngine API running on http://${HOST}:${PORT}`);
} catch (error) {
  app.log.error(error);
  await prisma.$disconnect();
  process.exit(1);
}
