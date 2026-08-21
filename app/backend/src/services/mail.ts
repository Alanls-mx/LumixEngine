import nodemailer from "nodemailer";

type LeadEmailPayload = {
  nome: string;
  email?: string | null;
  telefone?: string | null;
  valor_estimado?: string | number | null;
  conteudo?: string | null | undefined;
  origem?: string | null | undefined;
};

type LeadReplyEmailPayload = {
  lead: {
    nome: string;
    email?: string | null;
  };
  conteudo: string;
  userName?: string | null;
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

function plainTextPreview(value: string | null | undefined, maxLength = 180) {
  if (!value) {
    return "Sem mensagem detalhada.";
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1)}...`
    : normalized;
}

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 0;color:#94a3b8;font-size:13px;">${label}</td>
      <td align="right" style="padding:10px 0;color:#ffffff;font-size:14px;font-weight:700;">${value}</td>
    </tr>
  `;
}

function emailShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer = "LumixEngine - Sites, sistemas, automações e integrações.",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: string;
  footer?: string;
}) {
  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0;background:#090d16;font-family:Arial,Helvetica,sans-serif;color:#e5e7eb;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#090d16;background-image:radial-gradient(circle at 50% 0%,rgba(16,185,129,.18),transparent 34rem),radial-gradient(circle at 12% 22%,rgba(20,184,166,.10),transparent 26rem);padding:28px 14px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#0f172a;border:1px solid #1e293b;border-radius:18px;overflow:hidden;box-shadow:0 24px 80px rgba(2,6,23,.38);">
                <tr>
                  <td style="padding:28px 28px 22px;border-bottom:1px solid #1e293b;background:linear-gradient(135deg,rgba(16,185,129,.18),rgba(20,184,166,.06),rgba(15,23,42,0));">
                    <div style="display:inline-block;border:1px solid rgba(52,211,153,.28);background:rgba(16,185,129,.12);color:#bbf7d0;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;">${escapeHtml(eyebrow)}</div>
                    <h1 style="margin:16px 0 0;font-size:28px;line-height:1.18;color:#ffffff;letter-spacing:0;">${escapeHtml(title)}</h1>
                    <p style="margin:12px 0 0;color:#cbd5e1;font-size:15px;line-height:1.7;">${escapeHtml(subtitle)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:26px 28px 28px;">${children}</td>
                </tr>
                <tr>
                  <td style="padding:18px 28px;border-top:1px solid #1e293b;color:#64748b;font-size:12px;line-height:1.6;">${escapeHtml(footer)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function leadReceivedTemplate(lead: LeadEmailPayload) {
  return emailShell({
    eyebrow: "Solicitação recebida",
    title: "Recebemos sua mensagem!",
    subtitle:
      "Sua solicitação entrou no fluxo de atendimento da LumixEngine. Agora nossa equipe vai analisar o contexto e retornar com o próximo passo.",
    children: `
      <p style="margin:0;color:#e5e7eb;font-size:16px;line-height:1.75;">Olá${lead.nome ? `, ${escapeHtml(lead.nome)}` : ""}.</p>
      <p style="margin:14px 0 0;color:#cbd5e1;font-size:15px;line-height:1.75;">Obrigado pelo contato. Normalmente começamos entendendo o processo, os dados envolvidos e onde automação, site, sistema ou integração podem reduzir trabalho manual.</p>
      <div style="margin:22px 0 0;border:1px solid #1e293b;border-radius:14px;background:#090d16;padding:18px;">
        <div style="color:#34d399;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Resumo enviado</div>
        <p style="margin:10px 0 0;color:#e2e8f0;font-size:14px;line-height:1.7;">${escapeHtml(plainTextPreview(lead.conteudo))}</p>
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:22px;border-top:1px solid #1e293b;">
        ${detailRow("Canal", escapeHtml(lead.origem ?? "SITE"))}
        ${detailRow("WhatsApp", escapeHtml(lead.telefone ?? "Não informado"))}
        ${detailRow("E-mail", escapeHtml(lead.email ?? "Não informado"))}
      </table>
      <div style="margin-top:22px;border-left:3px solid #34d399;padding-left:14px;color:#cbd5e1;font-size:14px;line-height:1.75;">Próximo passo: a equipe LumixEngine revisa sua demanda e retorna com perguntas objetivas para transformar a ideia em um plano de execução.</div>
    `,
  });
}

function internalNotificationTemplate(lead: LeadEmailPayload) {
  return emailShell({
    eyebrow: "Novo lead no CRM",
    title: lead.nome,
    subtitle:
      "Um novo contato chegou pelo site e já foi registrado no LumixEngine App com histórico, origem e contexto.",
    children: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #1e293b;border-bottom:1px solid #1e293b;">
        ${detailRow("Valor estimado", formatCurrency(lead.valor_estimado))}
        ${detailRow("Telefone", escapeHtml(lead.telefone ?? "Não informado"))}
        ${detailRow("E-mail", escapeHtml(lead.email ?? "Não informado"))}
        ${detailRow("Origem", escapeHtml(lead.origem ?? "Não informado"))}
      </table>
      <div style="margin-top:22px;border:1px solid rgba(52,211,153,.22);border-radius:14px;background:rgba(16,185,129,.08);padding:18px;">
        <div style="color:#bbf7d0;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Prioridade operacional</div>
        <p style="margin:10px 0 0;color:#e5e7eb;font-size:14px;line-height:1.7;">Responder rápido aumenta a chance de conversão. Verifique telefone, contexto da página e possíveis sinais de intenção comercial.</p>
      </div>
      <div style="margin-top:18px;padding:18px;border-radius:14px;background:#020617;border:1px solid #1e293b;color:#dbeafe;font-size:14px;line-height:1.7;">
        <div style="margin-bottom:10px;color:#94a3b8;font-size:12px;text-transform:uppercase;font-weight:800;letter-spacing:.08em;">Mensagem e contexto técnico</div>
        ${formatMultilineHtml(lead.conteudo)}
      </div>
      <div style="margin-top:18px;color:#94a3b8;font-size:13px;line-height:1.7;">Ação sugerida: abrir o LumixEngine App, atribuir um atendente e registrar a próxima tarefa comercial.</div>
    `,
  });
}

function testEmailTemplate() {
  return emailShell({
    eyebrow: "Teste SMTP",
    title: "Canal de e-mail operacional",
    subtitle:
      "Este teste confirma que a VPS, o provedor SMTP e o LumixEngine App conseguem enviar mensagens transacionais.",
    children: `
      <div style="border:1px solid rgba(52,211,153,.24);border-radius:14px;background:rgba(16,185,129,.10);padding:18px;">
        <div style="color:#bbf7d0;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Status</div>
        <p style="margin:10px 0 0;color:#ffffff;font-size:18px;font-weight:800;">SMTP configurado e pronto para envio.</p>
        <p style="margin:10px 0 0;color:#cbd5e1;font-size:14px;line-height:1.7;">A partir daqui, os formulários do site podem notificar a equipe interna e responder automaticamente ao lead.</p>
      </div>
    `,
  });
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
    html: testEmailTemplate(),
  });

  return {
    ok: true,
    message: "E-mail de teste enviado.",
  };
}

export async function sendLeadReplyEmail(
  payload: LeadReplyEmailPayload,
  settings: MailSettings = {},
) {
  const mail = createTransporter(settings);

  if (!payload.lead.email) {
    return {
      ok: false,
      skipped: true,
      reason: "Lead sem e-mail para resposta.",
    };
  }

  if (!mail) {
    return {
      ok: false,
      skipped: true,
      reason: "Configuração SMTP incompleta.",
    };
  }

  await mail.transporter.sendMail({
    from: mail.config.smtpFrom,
    to: payload.lead.email,
    subject: "Resposta da LumixEngine",
    html: emailShell({
      eyebrow: "Atendimento LumixEngine",
      title: "Nova resposta da nossa equipe",
      subtitle:
        "Recebemos seu contato e nossa equipe respondeu com o próximo passo do atendimento.",
      children: `
        <p style="margin:0;color:#e5e7eb;font-size:16px;line-height:1.75;">Olá${payload.lead.nome ? `, ${escapeHtml(payload.lead.nome)}` : ""}.</p>
        <div style="margin-top:18px;padding:18px;border-radius:14px;background:#020617;border:1px solid #1e293b;color:#e2e8f0;font-size:14px;line-height:1.75;">
          ${formatMultilineHtml(payload.conteudo)}
        </div>
        <div style="margin-top:18px;color:#94a3b8;font-size:13px;line-height:1.7;">${payload.userName ? `Respondido por ${escapeHtml(payload.userName)}.` : "Equipe LumixEngine."}</div>
      `,
    }),
  });

  return {
    ok: true,
    skipped: false,
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
