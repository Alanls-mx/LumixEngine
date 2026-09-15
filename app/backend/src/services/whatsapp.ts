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

export async function verifyWhatsAppConnection(
  settings: WhatsAppSettings = {},
  logger?: {
    warn: (payload: unknown, message?: string) => void;
    error: (payload: unknown, message?: string) => void;
  },
): Promise<{
  ok: boolean;
  state: "open" | "connecting" | "close" | "unconfigured" | "error";
  message: string;
  details?: unknown;
}> {
  const apiUrl = (
    settings.WHATSAPP_API_URL ?? process.env.WHATSAPP_API_URL ?? ""
  ).trim();
  const apiToken = (
    settings.WHATSAPP_API_TOKEN ?? process.env.WHATSAPP_API_TOKEN ?? ""
  ).trim();

  if (!apiUrl || !apiToken) {
    return {
      ok: false,
      state: "unconfigured",
      message:
        "URL de envio ou Token / API Key da Evolution API não estão configurados.",
    };
  }

  try {
    const cleanUrl = apiUrl.replace(/\/+$/, "");
    const match = cleanUrl.match(/(?:message\/sendText|sendText)\/([^/?#]+)/i);
    const instanceName = match ? match[1] : null;
    const baseUrl = match
      ? cleanUrl.slice(0, match.index).replace(/\/+$/, "")
      : cleanUrl.replace(/\/(?:message|instance).*$/i, "").replace(/\/+$/, "");

    const headers = {
      "Content-Type": "application/json",
      apikey: apiToken,
      Authorization: `Bearer ${apiToken}`,
    };

    // 1. Se identificou o nome da instância, tenta consultar o connectionState
    if (instanceName && baseUrl) {
      try {
        const stateRes = await fetch(
          `${baseUrl}/instance/connectionState/${encodeURIComponent(instanceName)}`,
          {
            method: "GET",
            headers,
            signal: AbortSignal.timeout(8000),
          },
        );

        if (stateRes.ok) {
          const data = (await stateRes.json().catch(() => ({}))) as Record<
            string,
            any
          >;
          const state = (
            data?.instance?.state ??
            data?.state ??
            ""
          ).toLowerCase();

          if (state === "open") {
            return {
              ok: true,
              state: "open",
              message: `Evolution API conectada e funcional! A instância "${instanceName}" está online e autenticada no WhatsApp.`,
              details: data,
            };
          }

          return {
            ok: false,
            state: state === "connecting" ? "connecting" : "close",
            message: `A Evolution API está acessível, mas a instância "${instanceName}" está com status "${state || "desconectada"}". É necessário escanear o QR Code no WhatsApp.`,
            details: data,
          };
        }

        if (stateRes.status === 401 || stateRes.status === 403) {
          return {
            ok: false,
            state: "error",
            message:
              "Falha de autenticação na Evolution API: API Key / Token inválido.",
          };
        }
      } catch (err) {
        logger?.warn(
          { err },
          "Tentativa de checar connectionState falhou, tentando fallback",
        );
      }
    }

    // 2. Fallback: consulta lista de instâncias (/instance/fetchInstances)
    if (baseUrl) {
      try {
        const instancesRes = await fetch(`${baseUrl}/instance/fetchInstances`, {
          method: "GET",
          headers,
          signal: AbortSignal.timeout(8000),
        });

        if (instancesRes.ok) {
          const list = (await instancesRes
            .json()
            .catch(() => [])) as Array<Record<string, any>>;
          if (Array.isArray(list)) {
            const target = instanceName
              ? list.find(
                  (item) =>
                    (item.name ??
                      item.instance?.instanceName ??
                      item.instanceName ??
                      "") === instanceName,
                )
              : list[0];

            if (target) {
              const state = (
                target.connectionStatus ??
                target.instance?.state ??
                target.state ??
                ""
              ).toLowerCase();
              const name =
                target.name ??
                target.instance?.instanceName ??
                instanceName ??
                "padrão";

              if (state === "open") {
                return {
                  ok: true,
                  state: "open",
                  message: `Evolution API conectada e funcional! Instância "${name}" está online e autenticada no WhatsApp.`,
                  details: target,
                };
              }

              return {
                ok: false,
                state: state === "connecting" ? "connecting" : "close",
                message: `Instância "${name}" encontrada na Evolution API, mas está com status "${state || "desconectada"}".`,
                details: target,
              };
            }
          }
        }

        if (instancesRes.status === 401 || instancesRes.status === 403) {
          return {
            ok: false,
            state: "error",
            message:
              "Falha de autenticação na Evolution API: API Key / Token inválido.",
          };
        }
      } catch {
        // ignore
      }
    }

    // 3. Fallback: testa o endpoint configurado
    const probeRes = await fetch(cleanUrl, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(8000),
    });

    if (probeRes.status === 401 || probeRes.status === 403) {
      return {
        ok: false,
        state: "error",
        message:
          "Falha de autenticação na Evolution API: API Key / Token inválido.",
      };
    }

    if (probeRes.ok || probeRes.status === 405) {
      return {
        ok: true,
        state: "open",
        message:
          "Servidor da Evolution API respondendo e autenticado com sucesso!",
      };
    }

    return {
      ok: false,
      state: "error",
      message: `Evolution API retornou status HTTP ${probeRes.status}. Verifique o endpoint configurado.`,
    };
  } catch (error) {
    return {
      ok: false,
      state: "error",
      message:
        "Não foi possível conectar à Evolution API (verifique se a URL está correta e o servidor ativo).",
      details: String(error),
    };
  }
}

export async function getWhatsAppConnectQrCode(
  settings: WhatsAppSettings = {},
  logger?: {
    warn: (payload: unknown, message?: string) => void;
    error: (payload: unknown, message?: string) => void;
  },
): Promise<{
  ok: boolean;
  base64?: string | null;
  pairingCode?: string | null;
  code?: string | null;
  message: string;
}> {
  const apiUrl = (
    settings.WHATSAPP_API_URL ?? process.env.WHATSAPP_API_URL ?? ""
  ).trim();
  const apiToken = (
    settings.WHATSAPP_API_TOKEN ?? process.env.WHATSAPP_API_TOKEN ?? ""
  ).trim();

  if (!apiUrl || !apiToken) {
    return {
      ok: false,
      message: "URL de envio ou Token da Evolution API não configurados.",
    };
  }

  try {
    const cleanUrl = apiUrl.replace(/\/+$/, "");
    const match = cleanUrl.match(/(?:message\/sendText|sendText)\/([^/?#]+)/i);
    const instanceName = (match && match[1]) ? match[1] : "lumixengine";
    const baseUrl = match
      ? cleanUrl.slice(0, match.index).replace(/\/+$/, "")
      : cleanUrl.replace(/\/(?:message|instance).*$/i, "").replace(/\/+$/, "");

    const headers = {
      "Content-Type": "application/json",
      apikey: apiToken,
      Authorization: `Bearer ${apiToken}`,
    };

    const res = await fetch(
      `${baseUrl}/instance/connect/${encodeURIComponent(instanceName)}`,
      {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(15000),
      },
    );

    if (!res.ok) {
      return {
        ok: false,
        message: `Evolution API retornou status HTTP ${res.status} ao solicitar conexão.`,
      };
    }

    const data = (await res.json().catch(() => ({}))) as Record<string, any>;
    let base64 = data.base64 ?? data.qrcode?.base64 ?? null;
    const pairingCode = data.pairingCode ?? null;
    const code = data.code ?? data.qrcode?.code ?? null;

    if (base64 && !base64.startsWith("data:image")) {
      base64 = `data:image/png;base64,${base64}`;
    }

    return {
      ok: true,
      base64,
      pairingCode,
      code,
      message: base64
        ? "QR Code gerado com sucesso."
        : "Instância solicitada para conexão.",
    };
  } catch (error) {
    logger?.error({ error }, "Erro ao obter QR Code da Evolution API");
    return {
      ok: false,
      message: "Não foi possível carregar o QR Code da Evolution API.",
    };
  }
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
