type SendWhatsAppMessageInput = {
  telefone: string;
  conteudo: string;
  settings?: WhatsAppSettings;
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
};

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function getWhatsAppStatus(settings: WhatsAppSettings = {}) {
  const apiUrl = settings.WHATSAPP_API_URL ?? process.env.WHATSAPP_API_URL;
  const apiToken =
    settings.WHATSAPP_API_TOKEN ?? process.env.WHATSAPP_API_TOKEN;

  return {
    configured: Boolean(apiUrl),
    apiUrl: apiUrl ?? null,
    hasToken: Boolean(apiToken),
  };
}

export async function sendWhatsAppMessage({
  telefone,
  conteudo,
  settings = {},
}: SendWhatsAppMessageInput): Promise<WhatsAppSendResult> {
  const whatsappApiUrl =
    settings.WHATSAPP_API_URL ?? process.env.WHATSAPP_API_URL;
  const whatsappApiToken =
    settings.WHATSAPP_API_TOKEN ?? process.env.WHATSAPP_API_TOKEN;

  if (!whatsappApiUrl) {
    console.info("WHATSAPP_API_URL não configurada; envio WhatsApp ignorado.");
    return {
      ok: false,
      skipped: true,
      reason: "WHATSAPP_API_URL não configurada.",
    };
  }

  const response = await fetch(whatsappApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(whatsappApiToken
        ? {
            Authorization: `Bearer ${whatsappApiToken}`,
            apikey: whatsappApiToken,
          }
        : {}),
    },
    body: JSON.stringify({
      phone: normalizePhone(telefone),
      number: normalizePhone(telefone),
      text: conteudo,
      message: conteudo,
    }),
  });

  const payload = await response.json().catch(() => null);

  return {
    ok: response.ok,
    skipped: false,
    status: response.status,
    response: payload,
  };
}
