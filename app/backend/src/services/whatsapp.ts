type SendWhatsAppMessageInput = {
  telefone: string;
  conteudo: string;
  settings?: WhatsAppSettings;
  logger?: {
    warn: (payload: unknown, message?: string) => void;
    error: (payload: unknown, message?: string) => void;
  };
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
  errorType?:
    | "configuration_missing"
    | "auth_error"
    | "instance_disconnected"
    | "invalid_number"
    | "gateway_error"
    | "network_error";
};

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
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

  if (status === 401 || status === 403 || normalized.includes("apikey")) {
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

export async function sendWhatsAppMessage({
  telefone,
  conteudo,
  settings = {},
  logger,
}: SendWhatsAppMessageInput): Promise<WhatsAppSendResult> {
  const whatsappApiUrl =
    settings.WHATSAPP_API_URL ?? process.env.WHATSAPP_API_URL;
  const whatsappApiToken =
    settings.WHATSAPP_API_TOKEN ?? process.env.WHATSAPP_API_TOKEN;
  const number = normalizePhone(telefone);

  if (!whatsappApiUrl || !whatsappApiToken) {
    console.info("Evolution API não configurada; envio WhatsApp ignorado.");
    return {
      ok: false,
      skipped: true,
      reason: "URL de envio ou Token / API Key não configurados.",
      errorType: "configuration_missing",
    };
  }

  if (!number || number.length < 12) {
    return {
      ok: false,
      skipped: false,
      reason: "Número inválido para Evolution API.",
      errorType: "invalid_number",
    };
  }

  try {
    const response = await fetch(whatsappApiUrl, {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: {
        "Content-Type": "application/json",
        apikey: whatsappApiToken,
      },
      body: JSON.stringify({
        number,
        text: conteudo,
      }),
    });

    const payload = await readEvolutionPayload(response);
    const result: WhatsAppSendResult = {
      ok: response.ok,
      skipped: false,
      status: response.status,
      response: payload,
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
      reason: "Não foi possível conectar à Evolution API.",
      errorType: "network_error",
    };
  }
}
