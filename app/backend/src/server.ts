import "dotenv/config";

import cors from "@fastify/cors";
import { PrismaPg } from "@prisma/adapter-pg";
import Fastify from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  createHmac,
  createPublicKey,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  verify as verifySignature,
} from "node:crypto";
import { promisify } from "node:util";
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
  UserRole,
} from "../generated/prisma/client.js";
import {
  getMailStatus,
  sendLeadReplyEmail,
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
const JWT_SECRET = process.env.JWT_SECRET ?? "lumixengine-dev-secret-change-me";
const JWT_EXPIRES_IN_SECONDS = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 60 * 60 * 12);
const scrypt = promisify(scryptCallback);

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

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});
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

const userInclude = {
  team: true,
} satisfies Prisma.UserInclude;

await app.register(cors, {
  origin: allowedOrigins,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept", "Authorization", "X-Idempotency-Key"],
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
  client_request_id: z.string().trim().min(8).optional(),
  channels: z
    .array(z.enum(["WHATSAPP", "EMAIL"]))
    .min(1)
    .optional()
    .default(["WHATSAPP"]),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

const bootstrapSchema = z.object({
  nome: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const googleLoginSchema = z.object({
  credential: z.string().trim().min(20),
});

const userCreateSchema = z.object({
  nome: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8).optional(),
  role: z.enum([UserRole.ADMIN, UserRole.ATENDENTE]).default(UserRole.ATENDENTE),
  team_id: z.string().trim().min(1).nullable().optional(),
  ativo: z.boolean().optional(),
});

const userUpdateSchema = z
  .object({
    nome: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    password: z.string().min(8).nullable().optional(),
    role: z.enum([UserRole.ADMIN, UserRole.ATENDENTE]).optional(),
    team_id: z.string().trim().min(1).nullable().optional(),
    ativo: z.boolean().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Informe pelo menos um campo para atualizar.",
  });

const teamCreateSchema = z.object({
  nome: z.string().trim().min(1),
  descricao: z.string().trim().nullable().optional(),
  ativo: z.boolean().optional(),
});

const teamUpdateSchema = teamCreateSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  {
    message: "Informe pelo menos um campo para atualizar.",
  },
);

const messageTemplateCreateSchema = z.object({
  titulo: z.string().trim().min(1),
  categoria: z.string().trim().min(1).default("geral"),
  conteudo_texto: z.string().trim().min(1),
  ativo: z.boolean().optional(),
  uso_ia: z.boolean().optional(),
});

const messageTemplateUpdateSchema = messageTemplateCreateSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  {
    message: "Informe pelo menos um campo para atualizar.",
  },
);

const messageSuggestionSchema = z.object({
  lead_id: z.string().trim().min(1),
  intent: z
    .enum(["boas_vindas", "qualificacao", "follow_up", "proposta", "recuperacao"])
    .optional()
    .default("follow_up"),
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
  GOOGLE_CLIENT_ID: z.string().trim().optional(),
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

function extractWhatsAppEvent(body: unknown) {
  return (
    getNestedString(body, ["event"]) ??
    getNestedString(body, ["type"]) ??
    getNestedString(body, ["data", "event"]) ??
    getNestedString(body, ["data", "type"])
  );
}

function isTechnicalWhatsAppEvent(body: unknown) {
  const event = extractWhatsAppEvent(body)?.toLowerCase();

  if (!event) {
    return false;
  }

  return (
    event.includes("connection") ||
    event.includes("qrcode") ||
    event.includes("status") ||
    event.includes("presence")
  );
}

function extractWhatsAppProviderMessageId(body: unknown) {
  return (
    getNestedString(body, ["provider_message_id"]) ??
    getNestedString(body, ["messageId"]) ??
    getNestedString(body, ["id"]) ??
    getNestedString(body, ["data", "key", "id"]) ??
    getNestedString(body, ["data", "id"])
  );
}

type AuthUser = {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
};

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

function base64UrlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signJwt(user: AuthUser) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlJson({
    alg: "HS256",
    typ: "JWT",
  });
  const payload = base64UrlJson({
    sub: user.id,
    email: user.email,
    nome: user.nome,
    role: user.role,
    iat: now,
    exp: now + JWT_EXPIRES_IN_SECONDS,
  });
  const signature = createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

function parseJwtPayload(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return undefined;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: string;
      email?: string;
      nome?: string;
      role?: UserRole;
      exp?: number;
    };
  } catch {
    return undefined;
  }
}

function verifyJwt(token: string) {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    return undefined;
  }

  const expectedSignature = createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return undefined;
  }

  const jwtPayload = parseJwtPayload(token);
  const now = Math.floor(Date.now() / 1000);

  if (!jwtPayload?.sub || !jwtPayload.exp || jwtPayload.exp < now) {
    return undefined;
  }

  return jwtPayload;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, passwordHash: string | null) {
  if (!passwordHash) {
    return false;
  }

  if (passwordHash.startsWith("$2a$10$seed.")) {
    return password === "Lumix@2026";
  }

  const [algorithm, salt, storedHash] = passwordHash.split("$");

  if (algorithm !== "scrypt" || !salt || !storedHash) {
    return false;
  }

  const storedBuffer = Buffer.from(storedHash, "hex");
  const derivedKey = (await scrypt(password, salt, storedBuffer.length)) as Buffer;

  return (
    storedBuffer.length === derivedKey.length &&
    timingSafeEqual(storedBuffer, derivedKey)
  );
}

function toSafeUser<
  T extends {
    id: string;
    nome: string;
    email: string;
    role: UserRole;
    ativo: boolean;
    avatar_url: string | null;
    google_id?: string | null;
    team_id: string | null;
    ultimo_login: Date | null;
    data_criacao: Date;
    team?: unknown;
  },
>(user: T) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    ativo: user.ativo,
    avatar_url: user.avatar_url,
    google_id: user.google_id ?? null,
    team_id: user.team_id,
    ultimo_login: user.ultimo_login,
    data_criacao: user.data_criacao,
    ...(user.team !== undefined ? { team: user.team } : {}),
  };
}

function isPublicRequest(request: FastifyRequest) {
  if (request.method === "OPTIONS") {
    return true;
  }

  const path = request.url.split("?")[0] ?? "";

  return (
    path === "/health" ||
    path === "/api/health" ||
    path === "/api/auth/config" ||
    path === "/api/auth/bootstrap" ||
    path === "/api/auth/login" ||
    path === "/api/auth/google" ||
    path.startsWith("/api/webhooks") ||
    path.startsWith("/webhooks")
  );
}

async function requireAuthenticatedRequest(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const path = request.url.split("?")[0] ?? "";

  if (
    (!request.url.startsWith("/api") && !["/leads"].includes(path)) ||
    isPublicRequest(request)
  ) {
    return;
  }

  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;
  const jwtPayload = token ? verifyJwt(token) : undefined;

  if (!jwtPayload?.sub) {
    return reply.status(401).send({
      error: "unauthorized",
      message: "Sessao expirada ou token ausente.",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: jwtPayload.sub,
    },
  });

  if (!user?.ativo) {
    return reply.status(401).send({
      error: "inactive_user",
      message: "Usuario inativo ou inexistente.",
    });
  }

  request.user = {
    id: user.id,
    email: user.email,
    nome: user.nome,
    role: user.role,
  };
}

function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (request.user?.role !== UserRole.ADMIN) {
    return reply.status(403).send({
      error: "forbidden",
      message: "Apenas administradores podem executar esta acao.",
    });
  }
}

let googleJwksCache:
  | {
      expiresAt: number;
      keys: Array<Record<string, unknown>>;
    }
  | undefined;

async function fetchGoogleJwks() {
  const now = Date.now();

  if (googleJwksCache && googleJwksCache.expiresAt > now) {
    return googleJwksCache.keys;
  }

  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs");

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar as chaves publicas do Google.");
  }

  const cacheControl = response.headers.get("cache-control") ?? "";
  const maxAgeMatch = /max-age=(\d+)/.exec(cacheControl);
  const maxAge = maxAgeMatch ? Number(maxAgeMatch[1]) : 60 * 30;
  const body = (await response.json()) as { keys?: Array<Record<string, unknown>> };

  googleJwksCache = {
    expiresAt: now + maxAge * 1000,
    keys: body.keys ?? [],
  };

  return googleJwksCache.keys;
}

async function verifyGoogleCredential(credential: string, clientId: string) {
  const [headerSegment, payloadSegment, signatureSegment] = credential.split(".");

  if (!headerSegment || !payloadSegment || !signatureSegment) {
    throw new Error("Token Google invalido.");
  }

  const header = JSON.parse(
    Buffer.from(headerSegment, "base64url").toString("utf8"),
  ) as { kid?: string; alg?: string };
  const payload = JSON.parse(
    Buffer.from(payloadSegment, "base64url").toString("utf8"),
  ) as {
    aud?: string;
    iss?: string;
    exp?: number;
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
  };

  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Assinatura Google invalida.");
  }

  if (
    payload.aud !== clientId ||
    !["accounts.google.com", "https://accounts.google.com"].includes(
      payload.iss ?? "",
    ) ||
    !payload.exp ||
    payload.exp < Math.floor(Date.now() / 1000) ||
    !payload.sub ||
    !payload.email
  ) {
    throw new Error("Credencial Google recusada.");
  }

  const jwk = (await fetchGoogleJwks()).find((key) => key.kid === header.kid);

  if (!jwk) {
    throw new Error("Chave publica Google nao encontrada.");
  }

  const publicKey = createPublicKey({
    key: jwk,
    format: "jwk",
  });
  const isValid = verifySignature(
    "RSA-SHA256",
    Buffer.from(`${headerSegment}.${payloadSegment}`),
    publicKey,
    Buffer.from(signatureSegment, "base64url"),
  );

  if (!isValid) {
    throw new Error("Assinatura Google invalida.");
  }

  return payload;
}

function renderTemplate(template: string, lead: Awaited<ReturnType<typeof listLeads>>[number]) {
  const latestMessage = lead.messages[0]?.conteudo ?? "";
  const variables: Record<string, string> = {
    nome: lead.nome,
    primeiro_nome: lead.nome.split(" ").filter(Boolean)[0] ?? lead.nome,
    email: lead.email ?? "",
    telefone: lead.telefone ?? "",
    status: lead.status,
    valor_estimado: lead.valor_estimado?.toString() ?? "",
    ultima_mensagem: latestMessage,
  };

  return template.replace(/\{\{\s*([\w_]+)\s*\}\}/g, (_match, key: string) =>
    variables[key] ?? "",
  );
}

function buildAiSuggestion(
  lead: Awaited<ReturnType<typeof listLeads>>[number],
  intent: z.infer<typeof messageSuggestionSchema>["intent"],
) {
  const firstName = lead.nome.split(" ").filter(Boolean)[0] ?? lead.nome;
  const latestInbound = lead.messages.find((message) => message.direcao === "INBOUND");
  const hasValue = Boolean(lead.valor_estimado);

  if (intent === "boas_vindas") {
    return `Olá, ${firstName}! Aqui é a equipe LumixEngine. Recebemos seu contato e já vamos te ajudar. Para eu direcionar melhor, você busca site, sistema, automação ou integração?`;
  }

  if (intent === "qualificacao") {
    return `Perfeito, ${firstName}. Para montar uma orientação mais precisa, me conta três pontos: qual processo você quer melhorar, quais ferramentas usa hoje e qual prazo ideal para colocar isso no ar?`;
  }

  if (intent === "proposta") {
    return `Obrigado pelas informações, ${firstName}. Pelo que você descreveu${hasValue ? ` e pelo investimento estimado de R$ ${lead.valor_estimado}` : ""}, o próximo passo é estruturarmos uma proposta com escopo, prazo e integrações. Posso te enviar um resumo ainda hoje?`;
  }

  if (intent === "recuperacao") {
    return `Oi, ${firstName}! Passando para retomar nossa conversa. Ainda faz sentido avançarmos com a solução digital para sua operação ou prefere que eu ajuste a proposta para outra prioridade?`;
  }

  return `Olá, ${firstName}! Vi sua mensagem${latestInbound ? ` sobre "${latestInbound.conteudo.slice(0, 90)}"` : ""}. Vou te ajudar com isso. Podemos alinhar rapidamente objetivo, prazo e melhor canal para retorno?`;
}

function settingCategory(key: string) {
  if (key.startsWith("SMTP_") || key === "INTERNAL_LEAD_NOTIFICATION_EMAIL") {
    return "email";
  }

  if (key.startsWith("WHATSAPP_")) {
    return "whatsapp";
  }

  if (key.startsWith("GOOGLE_")) {
    return "auth";
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

app.addHook("preHandler", requireAuthenticatedRequest);

app.get("/health", async () => ({
  status: "ok",
  service: "lumixengine-api",
}));

app.get("/api/health", async () => ({
  status: "ok",
  service: "lumixengine-api",
}));

app.get("/api/auth/config", async () => {
  const settings = await getSettingsMap();

  return {
    googleClientId: settings.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID ?? null,
  };
});

app.post("/api/auth/bootstrap", async (request, reply) => {
  const existingUsers = await prisma.user.count();

  if (existingUsers > 0) {
    return reply.status(409).send({
      error: "bootstrap_unavailable",
      message: "Bootstrap bloqueado porque ja existem usuarios cadastrados.",
    });
  }

  const payload = bootstrapSchema.parse(request.body);
  const user = await prisma.user.create({
    data: {
      nome: payload.nome,
      email: payload.email.toLowerCase(),
      senha_hash: await hashPassword(payload.password),
      role: UserRole.ADMIN,
      ultimo_login: new Date(),
    },
    include: userInclude,
  });
  const safeUser = toSafeUser(user);

  return {
    token: signJwt(safeUser),
    user: safeUser,
  };
});

app.post("/api/auth/login", async (request, reply) => {
  const payload = loginSchema.parse(request.body);
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email.toLowerCase(),
    },
    include: userInclude,
  });

  if (!user || !user.ativo || !(await verifyPassword(payload.password, user.senha_hash))) {
    return reply.status(401).send({
      error: "invalid_credentials",
      message: "E-mail ou senha invalidos.",
    });
  }

  const data: Prisma.UserUpdateInput = {
    ultimo_login: new Date(),
  };

  if (user.senha_hash?.startsWith("$2a$10$seed.")) {
    data.senha_hash = await hashPassword(payload.password);
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data,
    include: userInclude,
  });
  const safeUser = toSafeUser(updatedUser);

  return {
    token: signJwt(safeUser),
    user: safeUser,
  };
});

app.post("/api/auth/google", async (request, reply) => {
  const payload = googleLoginSchema.parse(request.body);
  const settings = await getSettingsMap();
  const googleClientId = settings.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return reply.status(400).send({
      error: "google_not_configured",
      message: "Google Client ID nao configurado.",
    });
  }

  try {
    const googlePayload = await verifyGoogleCredential(
      payload.credential,
      googleClientId,
    );
    const googleId = googlePayload.sub as string;
    const email = googlePayload.email!.toLowerCase();
    const name = googlePayload.name ?? googlePayload.email!;
    const picture = googlePayload.picture ?? null;

    const user = await prisma.user.upsert({
      where: {
        email,
      },
      update: {
        google_id: googleId,
        nome: name,
        avatar_url: picture,
        ativo: true,
        ultimo_login: new Date(),
      },
      create: {
        email,
        nome: name,
        google_id: googleId,
        avatar_url: picture,
        role: UserRole.ATENDENTE,
        ativo: true,
        ultimo_login: new Date(),
      },
      include: userInclude,
    });
    const safeUser = toSafeUser(user);

    return {
      token: signJwt(safeUser),
      user: safeUser,
    };
  } catch (error) {
    app.log.warn({ error }, "Falha no login Google");

    return reply.status(401).send({
      error: "invalid_google_credential",
      message: "Nao foi possivel validar a conta Google.",
    });
  }
});

app.get("/api/auth/me", async (request) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: request.user!.id,
    },
    include: userInclude,
  });

  return {
    user: toSafeUser(user),
  };
});

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
    const result = await verifyMailSettings(mailSettings);

    if (!result.ok) {
      return reply.status(400).send(result);
    }

    return result;
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

app.get("/api/teams", async () =>
  prisma.team.findMany({
    include: {
      users: {
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          ativo: true,
          avatar_url: true,
          team_id: true,
          ultimo_login: true,
          data_criacao: true,
        },
        orderBy: {
          nome: "asc",
        },
      },
    },
    orderBy: {
      nome: "asc",
    },
  }),
);

app.post("/api/teams", async (request, reply) => {
  const forbidden = requireAdmin(request, reply);

  if (forbidden) {
    return forbidden;
  }

  const payload = teamCreateSchema.parse(request.body);
  const team = await prisma.team.create({
    data: {
      nome: payload.nome,
      descricao: payload.descricao ?? null,
      ativo: payload.ativo ?? true,
    },
  });

  reply.code(201);
  return team;
});

app.patch("/api/teams/:id", async (request, reply) => {
  const forbidden = requireAdmin(request, reply);

  if (forbidden) {
    return forbidden;
  }

  const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
  const payload = teamUpdateSchema.parse(request.body);
  const data: Prisma.TeamUpdateInput = {};

  if (payload.nome !== undefined) {
    data.nome = payload.nome;
  }

  if (payload.descricao !== undefined) {
    data.descricao = payload.descricao;
  }

  if (payload.ativo !== undefined) {
    data.ativo = payload.ativo;
  }

  return prisma.team.update({
    where: {
      id,
    },
    data,
  });
});

app.get("/api/users", async () => {
  const users = await prisma.user.findMany({
    include: userInclude,
    orderBy: {
      nome: "asc",
    },
  });

  return users.map(toSafeUser);
});

app.post("/api/users", async (request, reply) => {
  const forbidden = requireAdmin(request, reply);

  if (forbidden) {
    return forbidden;
  }

  const payload = userCreateSchema.parse(request.body);
  const user = await prisma.user.create({
    data: {
      nome: payload.nome,
      email: payload.email.toLowerCase(),
      role: payload.role,
      ativo: payload.ativo ?? true,
      team_id: payload.team_id ?? null,
      senha_hash: payload.password ? await hashPassword(payload.password) : null,
    },
    include: userInclude,
  });

  reply.code(201);
  return toSafeUser(user);
});

app.patch("/api/users/:id", async (request, reply) => {
  const forbidden = requireAdmin(request, reply);

  if (forbidden) {
    return forbidden;
  }

  const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
  const payload = userUpdateSchema.parse(request.body);
  const data: Prisma.UserUpdateInput = {};

  if (payload.nome !== undefined) {
    data.nome = payload.nome;
  }

  if (payload.email !== undefined) {
    data.email = payload.email.toLowerCase();
  }

  if (payload.password !== undefined) {
    data.senha_hash = payload.password ? await hashPassword(payload.password) : null;
  }

  if (payload.role !== undefined) {
    data.role = payload.role;
  }

  if (payload.team_id !== undefined) {
    data.team = payload.team_id
      ? {
          connect: {
            id: payload.team_id,
          },
        }
      : {
          disconnect: true,
        };
  }

  if (payload.ativo !== undefined) {
    data.ativo = payload.ativo;
  }

  const user = await prisma.user.update({
    where: {
      id,
    },
    data,
    include: userInclude,
  });

  return toSafeUser(user);
});

app.delete("/api/users/:id", async (request, reply) => {
  const forbidden = requireAdmin(request, reply);

  if (forbidden) {
    return forbidden;
  }

  const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
  const user = await prisma.user.update({
    where: {
      id,
    },
    data: {
      ativo: false,
    },
    include: userInclude,
  });

  return toSafeUser(user);
});

app.get("/api/message-templates", async () =>
  prisma.messageTemplate.findMany({
    orderBy: [
      {
        ativo: "desc",
      },
      {
        categoria: "asc",
      },
      {
        titulo: "asc",
      },
    ],
  }),
);

app.post("/api/message-templates", async (request, reply) => {
  const forbidden = requireAdmin(request, reply);

  if (forbidden) {
    return forbidden;
  }

  const payload = messageTemplateCreateSchema.parse(request.body);
  const template = await prisma.messageTemplate.create({
    data: {
      titulo: payload.titulo,
      categoria: payload.categoria,
      conteudo_texto: payload.conteudo_texto,
      ativo: payload.ativo ?? true,
      uso_ia: payload.uso_ia ?? false,
    },
  });

  reply.code(201);
  return template;
});

app.patch("/api/message-templates/:id", async (request, reply) => {
  const forbidden = requireAdmin(request, reply);

  if (forbidden) {
    return forbidden;
  }

  const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
  const payload = messageTemplateUpdateSchema.parse(request.body);
  const data: Prisma.MessageTemplateUpdateInput = {};

  if (payload.titulo !== undefined) {
    data.titulo = payload.titulo;
  }

  if (payload.categoria !== undefined) {
    data.categoria = payload.categoria;
  }

  if (payload.conteudo_texto !== undefined) {
    data.conteudo_texto = payload.conteudo_texto;
  }

  if (payload.ativo !== undefined) {
    data.ativo = payload.ativo;
  }

  return prisma.messageTemplate.update({
    where: {
      id,
    },
    data,
  });
});

app.delete("/api/message-templates/:id", async (request, reply) => {
  const forbidden = requireAdmin(request, reply);

  if (forbidden) {
    return forbidden;
  }

  const { id } = z.object({ id: z.string().min(1) }).parse(request.params);

  return prisma.messageTemplate.update({
    where: {
      id,
    },
    data: {
      ativo: false,
    },
  });
});

app.post("/api/messages/suggest", async (request) => {
  const payload = messageSuggestionSchema.parse(request.body);
  const lead = await prisma.lead.findUniqueOrThrow({
    where: {
      id: payload.lead_id,
    },
    include: leadInclude,
  });
  const templates = await prisma.messageTemplate.findMany({
    where: {
      ativo: true,
      OR: [
        {
          uso_ia: true,
        },
        {
          categoria: payload.intent,
        },
      ],
    },
    orderBy: {
      data_atualizacao: "desc",
    },
    take: 4,
  });

  const suggestions = [
    {
      id: "ai-contextual",
      titulo: "Sugestão inteligente",
      categoria: payload.intent,
      conteudo_texto: buildAiSuggestion(lead, payload.intent),
      origem: "AI",
    },
    ...templates.map((template) => ({
      id: template.id,
      titulo: template.titulo,
      categoria: template.categoria,
      conteudo_texto: renderTemplate(template.conteudo_texto, lead),
      origem: template.uso_ia ? "AI_TEMPLATE" : "TEMPLATE",
    })),
  ];

  return {
    suggestions,
  };
});

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

async function sendMessageRoute(request: FastifyRequest, reply: FastifyReply) {
  const payload = sendMessageSchema.parse(request.body);
  const headerRequestId = Array.isArray(request.headers["x-idempotency-key"])
    ? request.headers["x-idempotency-key"][0]
    : request.headers["x-idempotency-key"];
  const clientRequestId = payload.client_request_id ?? headerRequestId;

  if (clientRequestId) {
    const existingMessage = await prisma.message.findUnique({
      where: {
        client_request_id: clientRequestId,
      },
      include: {
        user: true,
        lead: true,
      },
    });

    if (existingMessage) {
      return {
        ok: true,
        deduplicated: true,
        delivery: {
          ok: true,
          skipped: true,
          reason: "Mensagem ja registrada para esta requisicao.",
        },
        deliveries: {},
        message: existingMessage,
      };
    }
  }

  const lead = await prisma.lead.findUniqueOrThrow({
    where: {
      id: payload.lead_id,
    },
  });
  const shouldSendWhatsApp = payload.channels.includes("WHATSAPP");
  const shouldSendEmail = payload.channels.includes("EMAIL");

  if (shouldSendWhatsApp && !lead.telefone) {
    return reply.status(400).send({
      error: "missing_phone",
      message: "Lead sem telefone para envio via WhatsApp.",
    });
  }

  if (shouldSendEmail && !lead.email && !shouldSendWhatsApp) {
    return reply.status(400).send({
      error: "missing_email",
      message: "Lead sem e-mail para envio.",
    });
  }

  const message = await prisma.message.create({
    data: {
      lead_id: payload.lead_id,
      conteudo: payload.conteudo,
      origem: shouldSendWhatsApp ? MessageOrigem.WHATSAPP : MessageOrigem.SITE,
      direcao: MessageDirecao.OUTBOUND,
      status_envio: MessageStatusEnvio.ENVIADO,
      ...(clientRequestId ? { client_request_id: clientRequestId } : {}),
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
  const deliveries: {
    whatsapp?: Awaited<ReturnType<typeof sendWhatsAppMessage>>;
    email?: Awaited<ReturnType<typeof sendLeadReplyEmail>>;
  } = {};

  if (shouldSendWhatsApp && lead.telefone) {
    const whatsappSettings = await getWhatsAppSettings();
    deliveries.whatsapp = await sendWhatsAppMessage({
      telefone: lead.telefone,
      conteudo: payload.conteudo,
      settings: whatsappSettings,
      logger: app.log,
    });
  }

  if (shouldSendEmail) {
    const mailSettings = await getMailSettings();

    try {
      deliveries.email = await sendLeadReplyEmail(
        {
          lead,
          conteudo: payload.conteudo,
          userName: message.user?.nome ?? null,
        },
        mailSettings,
      );
    } catch (error) {
      app.log.error(
        {
          error,
          leadId: lead.id,
          email: lead.email,
        },
        "Erro ao enviar resposta por e-mail",
      );
      deliveries.email = {
        ok: false,
        skipped: false,
        reason: "Falha ao enviar resposta por e-mail.",
      };
    }
  }

  const whatsappFailed =
    deliveries.whatsapp && !deliveries.whatsapp.ok && !deliveries.whatsapp.skipped;
  const emailFailed =
    deliveries.email && !deliveries.email.ok && !deliveries.email.skipped;

  if (whatsappFailed || emailFailed) {
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
      titulo: "Falha no envio de resposta",
      conteudo: `A resposta para ${lead.nome} foi registrada, mas falhou em ${whatsappFailed ? "WhatsApp" : ""}${whatsappFailed && emailFailed ? " e " : ""}${emailFailed ? "e-mail" : ""}.`,
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
      delivery: deliveries.whatsapp ?? deliveries.email,
      deliveries,
      message: failedMessage,
    };
  }

  return {
    ok: true,
    delivery: deliveries.whatsapp ?? deliveries.email ?? {
      ok: true,
      skipped: true,
      reason: "Nenhum canal externo selecionado.",
    },
    deliveries,
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
    logger: app.log,
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
  const providerMessageId = extractWhatsAppProviderMessageId(request.body);

  if (!phone || !conteudo) {
    if (isTechnicalWhatsAppEvent(request.body)) {
      return {
        ok: true,
        ignored: true,
        event: extractWhatsAppEvent(request.body),
      };
    }

    return reply.status(400).send({
      error: "invalid_whatsapp_payload",
      message: "Payload sem telefone ou conteúdo de mensagem.",
    });
  }

  if (providerMessageId) {
    const existingMessage = await prisma.message.findUnique({
      where: {
        provider_message_id: providerMessageId,
      },
      include: {
        user: true,
        lead: true,
      },
    });

    if (existingMessage) {
      return {
        ok: true,
        deduplicated: true,
        lead: existingMessage.lead,
        message: existingMessage,
      };
    }
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
      ...(providerMessageId ? { provider_message_id: providerMessageId } : {}),
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
app.post("/api/webhooks/whatsapp/:event", webhookWhatsAppRoute);

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

let isClosing = false;

const closeSocketServer = () =>
  new Promise<void>((resolve) => {
    io.close(() => resolve());
  });

const close = async () => {
  if (isClosing) {
    return;
  }

  isClosing = true;
  app.log.info("Shutting down LumixEngine API");
  await Promise.race([
    Promise.all([closeSocketServer(), app.close(), prisma.$disconnect()]),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);
};

process.on("SIGINT", () => {
  void close().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void close().finally(() => process.exit(0));
});

async function ensureDefaultMessageTemplates() {
  const templateCount = await prisma.messageTemplate.count();

  if (templateCount > 0) {
    return;
  }

  await prisma.messageTemplate.createMany({
    data: [
      {
        titulo: "Boas-vindas consultiva",
        categoria: "boas_vindas",
        conteudo_texto:
          "Olá, {{primeiro_nome}}! Aqui é a equipe LumixEngine. Recebemos seu contato e já vamos te ajudar. Você busca site, sistema, automação ou integração?",
        uso_ia: true,
      },
      {
        titulo: "Qualificação rápida",
        categoria: "qualificacao",
        conteudo_texto:
          "Perfeito, {{primeiro_nome}}. Para entender melhor, me conta qual processo você quer melhorar, quais ferramentas usa hoje e qual prazo ideal para iniciar?",
        uso_ia: true,
      },
      {
        titulo: "Follow-up comercial",
        categoria: "follow_up",
        conteudo_texto:
          "Oi, {{primeiro_nome}}! Passando para retomar nossa conversa. Ainda faz sentido avançarmos com a solução digital para sua operação?",
        uso_ia: true,
      },
      {
        titulo: "Próximo passo proposta",
        categoria: "proposta",
        conteudo_texto:
          "Obrigado pelas informações, {{primeiro_nome}}. O próximo passo é estruturarmos uma proposta com escopo, prazo e integrações. Posso te enviar um resumo?",
        uso_ia: true,
      },
    ],
  });
}

try {
  await ensureDefaultMessageTemplates();

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
