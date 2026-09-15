type SendWhatsAppMessageInput = {
  telefone: string;
  conteudo: string;
  settings?: WhatsAppSettings;
  logger?: {
    warn: (payload: unknown, message?: string) => void;
    error: (payload: unknown, message?: string) => void;
  };
  quotedMessageId?: string | null;
};

export type WhatsAppSettings = {
  WHATSAPP_API_URL?: string | null | undefined;
  WHATSAPP_API_TOKEN?: string | null | undefined;
};

export type WhatsAppSendResult = {
  ok: boolean;
  skipped: boolean;
  status?: number;
  response?: unknown;
  reason?: string;
  providerMessageId?: string | null;
  errorType?:
    | "configuration_missing"
    | "auth_error"
    | "instance_disconnected"
    | "invalid_number"
    | "gateway_error"
    | "network_error";
};

export function normalizePhone(value: string) {
  let cleaned = value.replace(/\D/g, "");

  // Remove leading zeroes
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.replace(/^0+/, "");
  }

  // Se o número tiver 10 ou 11 dígitos (DDD + 8 ou 9 dígitos sem DDI no Brasil),
  // adiciona o DDI 55 do Brasil automaticamente.
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = `55${cleaned}`;
  }

  return cleaned;
}

export function getWhatsAppStatus(settings: WhatsAppSettings = {}) {
  const apiUrl = settings.WHATSAPP_API_URL ?? process.env.WHATSAPP_API_URL;
  const apiToken =
    settings.WHATSAPP_API_TOKEN ?? process.env.WHATSAPP_API_TOKEN;

  return {
    configured: Boolean(apiUrl && apiToken),
    apiUrl: apiUrl ?? null,
    hasToken: Boolean(apiToken),
  };
}

function classifyEvolutionError(status: number, payload: unknown) {
  const serialized =
    typeof payload === "string" ? payload : JSON.stringify(payload ?? {});
  const normalized = serialized.toLowerCase();

  if (status === 401 || status === 403 || normalized.includes("apikey") || normalized.includes("unauthorized")) {
    return "auth_error" as const;
  }

  if (
    normalized.includes("disconnect") ||
    normalized.includes("not connected") ||
    normalized.includes("instance not found") ||
    normalized.includes("instance_not_found") ||
    normalized.includes("instance")
  ) {
    return "instance_disconnected" as const;
  }

  if (
    status === 400 &&
    (normalized.includes("number") ||
      normalized.includes("jid") ||
      normalized.includes("phone"))
  ) {
    return "invalid_number" as const;
  }

  return "gateway_error" as const;
}

async function readEvolutionPayload(response: Response) {
  const responseText = await response.text().catch(() => "");

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return responseText;
  }
}

function extractProviderMessageId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as Record<string, unknown>;

  if (typeof (data.key as Record<string, unknown> | undefined)?.id === "string") {
    return (data.key as Record<string, unknown>).id as string;
  }

  const messageObj = data.message as Record<string, unknown> | undefined;
  if (typeof (messageObj?.key as Record<string, unknown> | undefined)?.id === "string") {
    return (messageObj!.key as Record<string, unknown>).id as string;
  }

  if (typeof data.id === "string") {
    return data.id;
  }

  if (typeof data.messageId === "string") {
    return data.messageId;
  }

  return null;
}

export async function sendWhatsAppMessage({
  telefone,
  conteudo,
  settings = {},
  logger,
  quotedMessageId,
}: SendWhatsAppMessageInput): Promise<WhatsAppSendResult> {
  const whatsappApiUrl =
    (settings.WHATSAPP_API_URL ?? process.env.WHATSAPP_API_URL ?? "").trim();
  const whatsappApiToken =
    (settings.WHATSAPP_API_TOKEN ?? process.env.WHATSAPP_API_TOKEN ?? "").trim();
  const number = normalizePhone(telefone);

  if (!whatsappApiUrl || !whatsappApiToken) {
    return {
      ok: false,
      skipped: true,
      reason: "URL de envio ou Token / API Key não configurados nas Configurações.",
      errorType: "configuration_missing",
    };
  }

  if (!number || number.length < 10) {
    return {
      ok: false,
      skipped: false,
      reason: "Número de telefone inválido para envio via WhatsApp.",
      errorType: "invalid_number",
    };
  }

  try {
    const cleanUrl = whatsappApiUrl.replace(/\/+$/, "");

    const payloadBody: Record<string, unknown> = {
      number,
      text: conteudo,
    };

    if (quotedMessageId) {
      payloadBody.quoted = {
        key: {
          id: quotedMessageId,
        },
      };
    }

    const response = await fetch(cleanUrl, {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: {
        "Content-Type": "application/json",
        apikey: whatsappApiToken,
        Authorization: `Bearer ${whatsappApiToken}`,
      },
      body: JSON.stringify(payloadBody),
    });

    const payload = await readEvolutionPayload(response);
    const providerMessageId = extractProviderMessageId(payload);

    const result: WhatsAppSendResult = {
      ok: response.ok,
      skipped: false,
      status: response.status,
      response: payload,
      providerMessageId,
      ...(response.ok
        ? {}
        : {
            reason: "Evolution API recusou o envio.",
            errorType: classifyEvolutionError(response.status, payload),
          }),
    };

    if (!result.ok) {
      logger?.warn(
        {
          status: result.status,
          errorType: result.errorType,
          response: result.response,
          number,
        },
        "Falha no envio via Evolution API",
      );
    }

    return result;
  } catch (error) {
    logger?.error(
      {
        error,
        number,
        gatewayUrl: whatsappApiUrl,
      },
      "Erro de rede ao chamar Evolution API",
    );

    return {
      ok: false,
      skipped: false,
      reason: "Não foi possível conectar à Evolution API (verifique se o servidor está ativo).",
      errorType: "network_error",
    };
  }
}
