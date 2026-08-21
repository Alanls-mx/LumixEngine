import nodemailer from "nodemailer";

type LeadEmailPayload = {
  nome: string;
  email?: string | null;
  telefone?: string | null;
  valor_estimado?: string | number | null;
  conteudo?: string | null | undefined;
  origem?: string | null | undefined;
};

export type MailSettings = {
  SMTP_HOST?: string | null | undefined;
  SMTP_PORT?: string | null | undefined;
  SMTP_USER?: string | null | undefined;
  SMTP_PASS?: string | null | undefined;
  SMTP_FROM?: string | null | undefined;
  INTERNAL_LEAD_NOTIFICATION_EMAIL?: string | null | undefined;
};

function normalizeSender(
  from: string | null | undefined,
  user: string | null | undefined,
) {
  if (!from) {
    return user ?? undefined;
  }

  if (from.includes("@")) {
    return from;
  }

  return user ? `${from} <${user}>` : from;
}

function getMailConfig(settings: MailSettings = {}) {
  const smtpHost = settings.SMTP_HOST ?? process.env.SMTP_HOST;
  const smtpPort = Number(settings.SMTP_PORT ?? process.env.SMTP_PORT ?? 587);
  const smtpUser = settings.SMTP_USER ?? process.env.SMTP_USER;
  const smtpPass = settings.SMTP_PASS ?? process.env.SMTP_PASS;
  const smtpFrom = normalizeSender(
    settings.SMTP_FROM ?? process.env.SMTP_FROM,
    smtpUser,
  );
  const internalEmail =
    settings.INTERNAL_LEAD_NOTIFICATION_EMAIL ??
    process.env.INTERNAL_LEAD_NOTIFICATION_EMAIL ??
    smtpFrom;

  return {
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    smtpFrom,
    internalEmail,
  };
}

function createTransporter(settings: MailSettings = {}) {
  const config = getMailConfig(settings);

  if (
    !config.smtpHost ||
    !config.smtpUser ||
    !config.smtpPass ||
    !config.smtpFrom
  ) {
    return null;
  }

  return {
    transporter: nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    }),
    config,
  };
}

function formatCurrency(value: LeadEmailPayload["valor_estimado"]) {
  if (value === undefined || value === null || value === "") {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMultilineHtml(value: string | null | undefined) {
  if (!value) {
    return "Não informado";
  }

  return escapeHtml(value).replace(/\n/g, "<br />");
}

function leadReceivedTemplate(lead: LeadEmailPayload) {
  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Recebemos sua mensagem</title>
      </head>
      <body style="margin:0;background:#f4f7f5;font-family:Arial,sans-serif;color:#17202a;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f5;padding:24px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #dfe7e2;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 28px 12px;">
                    <div style="font-size:13px;font-weight:700;color:#047857;text-transform:uppercase;letter-spacing:.08em;">LumixEngine</div>
                    <h1 style="margin:12px 0 0;font-size:24px;line-height:1.25;color:#111827;">Recebemos sua mensagem!</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 28px;font-size:15px;line-height:1.7;color:#4b5563;">
                    <p>Olá${lead.nome ? `, ${escapeHtml(lead.nome)}` : ""}.</p>
                    <p>Obrigado pelo contato. Em breve nossa equipe entrará em contato para entender sua necessidade e avançar com o atendimento.</p>
                    <p style="margin-top:24px;color:#111827;font-weight:700;">Equipe LumixEngine</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function internalNotificationTemplate(lead: LeadEmailPayload) {
  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Novo Lead Recebido</title>
      </head>
      <body style="margin:0;background:#111827;font-family:Arial,sans-serif;color:#e5e7eb;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#111827;padding:24px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#18212f;border:1px solid #273449;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:28px;">
                    <div style="font-size:13px;font-weight:700;color:#34d399;text-transform:uppercase;letter-spacing:.08em;">Novo Lead Recebido</div>
                    <h1 style="margin:12px 0 20px;font-size:24px;line-height:1.25;color:#ffffff;">${escapeHtml(lead.nome)}</h1>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:15px;line-height:1.7;color:#cbd5e1;">
                      <tr><td style="padding:8px 0;color:#94a3b8;">Valor</td><td align="right" style="padding:8px 0;color:#ffffff;font-weight:700;">${formatCurrency(lead.valor_estimado)}</td></tr>
                      <tr><td style="padding:8px 0;color:#94a3b8;">Telefone</td><td align="right" style="padding:8px 0;color:#ffffff;">${escapeHtml(lead.telefone ?? "Não informado")}</td></tr>
                      <tr><td style="padding:8px 0;color:#94a3b8;">Email</td><td align="right" style="padding:8px 0;color:#ffffff;">${escapeHtml(lead.email ?? "Não informado")}</td></tr>
                      <tr><td style="padding:8px 0;color:#94a3b8;">Origem</td><td align="right" style="padding:8px 0;color:#ffffff;">${escapeHtml(lead.origem ?? "Não informado")}</td></tr>
                    </table>
                    <div style="margin-top:22px;padding:16px;border-radius:10px;background:#111827;border:1px solid #334155;color:#dbeafe;font-size:14px;line-height:1.65;">
                      <div style="margin-bottom:8px;color:#94a3b8;font-size:12px;text-transform:uppercase;font-weight:700;letter-spacing:.08em;">Mensagem e contexto</div>
                      ${formatMultilineHtml(lead.conteudo)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function getMailStatus(settings: MailSettings = {}) {
  const config = getMailConfig(settings);

  return {
    configured: Boolean(
      config.smtpHost &&
        config.smtpUser &&
        config.smtpPass &&
        config.smtpFrom,
    ),
    host: config.smtpHost ?? null,
    port: config.smtpPort,
    from: config.smtpFrom ?? null,
    internalEmail: config.internalEmail ?? null,
  };
}

export async function verifyMailSettings(settings: MailSettings = {}) {
  const mail = createTransporter(settings);

  if (!mail) {
    return {
      ok: false,
      message: "Configuração SMTP incompleta.",
    };
  }

  await mail.transporter.verify();

  return {
    ok: true,
    message: "SMTP configurado e autenticado.",
  };
}

export async function sendTestEmail(to: string, settings: MailSettings = {}) {
  const mail = createTransporter(settings);

  if (!mail) {
    return {
      ok: false,
      message: "Configuração SMTP incompleta.",
    };
  }

  await mail.transporter.sendMail({
    from: mail.config.smtpFrom,
    to,
    subject: "Teste de e-mail LumixEngine",
    html: `
      <div style="font-family:Arial,sans-serif;background:#f4f7f5;padding:24px;">
        <div style="max-width:560px;margin:auto;background:white;border-radius:12px;padding:24px;border:1px solid #dfe7e2;">
          <h1 style="margin:0 0 12px;color:#111827;font-size:22px;">SMTP configurado</h1>
          <p style="color:#4b5563;line-height:1.6;">Este é um e-mail de teste enviado pelo LumixEngine App.</p>
        </div>
      </div>
    `,
  });

  return {
    ok: true,
    message: "E-mail de teste enviado.",
  };
}

export async function sendLeadWebhookEmails(
  lead: LeadEmailPayload,
  settings: MailSettings = {},
) {
  const mail = createTransporter(settings);

  if (!mail) {
    console.info("SMTP não configurado; e-mails transacionais ignorados.");
    return;
  }

  const jobs: Array<Promise<unknown>> = [];

  if (lead.email) {
    jobs.push(
      mail.transporter.sendMail({
        from: mail.config.smtpFrom,
        to: lead.email,
        subject: "Recebemos sua mensagem!",
        html: leadReceivedTemplate(lead),
      }),
    );
  }

  if (mail.config.internalEmail) {
    jobs.push(
      mail.transporter.sendMail({
        from: mail.config.smtpFrom,
        to: mail.config.internalEmail,
        subject: `Novo Lead Recebido: ${lead.nome}`,
        html: internalNotificationTemplate(lead),
      }),
    );
  }

  await Promise.all(jobs);
}
