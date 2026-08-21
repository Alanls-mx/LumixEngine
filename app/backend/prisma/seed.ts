import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import {
  LeadStatus,
  MessageOrigem,
  Prisma,
  PrismaClient,
  TaskStatus,
  UserRole,
} from "../generated/prisma/client.js";

const sqliteUrl =
  process.env.DATABASE_URL === "file:./dev.db"
    ? "file:./prisma/dev.db"
    : (process.env.DATABASE_URL ?? "file:./prisma/dev.db");

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: sqliteUrl }),
});

const today = new Date();

function daysFromNow(days: number) {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date;
}

const leads: Prisma.LeadCreateInput[] = [
  {
    nome: "Mariana Alves",
    email: "mariana.alves@auroradigital.com.br",
    telefone: "+55 11 98742-1189",
    status: LeadStatus.NOVO_LEAD,
    valor_estimado: new Prisma.Decimal(3200),
    messages: {
      create: [
        {
          conteudo: "Olá, vi o site de vocês e quero entender os planos para automação de atendimento.",
          origem: MessageOrigem.SITE,
        },
      ],
    },
    tasks: {
      create: [
        {
          descricao: "Fazer primeiro contato e qualificar necessidade",
          status: TaskStatus.PENDENTE,
          data_limite: daysFromNow(1),
        },
      ],
    },
  },
  {
    nome: "Rafael Moreira",
    email: "rafael.moreira@bravaconsultoria.com.br",
    telefone: "+55 21 99831-7742",
    status: LeadStatus.NOVO_LEAD,
    valor_estimado: new Prisma.Decimal(4800),
    messages: {
      create: [
        {
          conteudo: "Preciso integrar formulários do site com CRM e WhatsApp.",
          origem: MessageOrigem.WHATSAPP,
        },
      ],
    },
  },
  {
    nome: "Camila Rocha",
    email: "camila.rocha@novarejo.com.br",
    telefone: "+55 31 99116-4308",
    status: LeadStatus.NEGOCIACAO,
    valor_estimado: new Prisma.Decimal(7800),
    messages: {
      create: [
        {
          conteudo: "Podemos agendar uma demonstração ainda esta semana?",
          origem: MessageOrigem.SITE,
        },
      ],
    },
    tasks: {
      create: [
        {
          descricao: "Enviar resumo da solução antes da demo",
          status: TaskStatus.PENDENTE,
          data_limite: daysFromNow(2),
        },
        {
          descricao: "Confirmar participantes da reunião",
          status: TaskStatus.PENDENTE,
          data_limite: daysFromNow(2),
        },
      ],
    },
  },
  {
    nome: "Gustavo Ferreira",
    email: "gustavo.ferreira@studioforma.com.br",
    telefone: "+55 41 98804-2210",
    status: LeadStatus.NEGOCIACAO,
    valor_estimado: new Prisma.Decimal(6200),
  },
  {
    nome: "Patrícia Nogueira",
    email: "patricia.nogueira@clinicavitta.com.br",
    telefone: "+55 51 99675-8022",
    status: LeadStatus.NEGOCIACAO,
    valor_estimado: new Prisma.Decimal(9400),
    messages: {
      create: [
        {
          conteudo: "Hoje recebemos muitos leads pelo Instagram. Vocês conseguem centralizar isso?",
          origem: MessageOrigem.WHATSAPP,
        },
      ],
    },
    tasks: {
      create: [
        {
          descricao: "Mapear canais de entrada da clínica",
          status: TaskStatus.PENDENTE,
          data_limite: daysFromNow(3),
        },
      ],
    },
  },
  {
    nome: "Leandro Martins",
    email: "leandro.martins@construtec.eng.br",
    telefone: "+55 11 97620-5521",
    status: LeadStatus.PROPOSTA,
    valor_estimado: new Prisma.Decimal(12500),
    messages: {
      create: [
        {
          conteudo: "A diretoria pediu proposta com implantação e suporte mensal.",
          origem: MessageOrigem.SITE,
        },
      ],
    },
    tasks: {
      create: [
        {
          descricao: "Enviar proposta comercial revisada",
          status: TaskStatus.PENDENTE,
          data_limite: daysFromNow(1),
        },
      ],
    },
  },
  {
    nome: "Bianca Teixeira",
    email: "bianca.teixeira@mercadomais.com.br",
    telefone: "+55 19 99244-6180",
    status: LeadStatus.PROPOSTA,
    valor_estimado: new Prisma.Decimal(15000),
    messages: {
      create: [
        {
          conteudo: "Gostei da proposta. Preciso validar o contrato com financeiro.",
          origem: MessageOrigem.WHATSAPP,
        },
      ],
    },
  },
  {
    nome: "Eduardo Lima",
    email: "eduardo.lima@fluxocontabil.com.br",
    telefone: "+55 27 99718-3306",
    status: LeadStatus.PROPOSTA,
    valor_estimado: new Prisma.Decimal(8700),
    tasks: {
      create: [
        {
          descricao: "Revisar escopo de automações fiscais",
          status: TaskStatus.PENDENTE,
          data_limite: daysFromNow(4),
        },
      ],
    },
  },
  {
    nome: "Fernanda Costa",
    email: "fernanda.costa@bellacasa.com.br",
    telefone: "+55 48 99903-4175",
    status: LeadStatus.GANHO,
    valor_estimado: new Prisma.Decimal(11200),
    messages: {
      create: [
        {
          conteudo: "Podemos seguir com o plano anual. Envie o link de pagamento.",
          origem: MessageOrigem.WHATSAPP,
        },
      ],
    },
    tasks: {
      create: [
        {
          descricao: "Criar checklist de onboarding",
          status: TaskStatus.PENDENTE,
          data_limite: daysFromNow(2),
        },
      ],
    },
  },
  {
    nome: "Thiago Barbosa",
    email: "thiago.barbosa@agenciametro.com.br",
    telefone: "+55 85 98812-9044",
    status: LeadStatus.GANHO,
    valor_estimado: new Prisma.Decimal(6900),
  },
  {
    nome: "Juliana Campos",
    email: "juliana.campos@escolaprisma.com.br",
    telefone: "+55 62 99662-5187",
    status: LeadStatus.PERDIDO,
    valor_estimado: new Prisma.Decimal(2400),
    messages: {
      create: [
        {
          conteudo: "Vamos pausar por orçamento, mas podemos retomar no próximo trimestre.",
          origem: MessageOrigem.SITE,
        },
      ],
    },
  },
  {
    nome: "André Siqueira",
    email: "andre.siqueira@logfast.com.br",
    telefone: "+55 81 98761-0369",
    status: LeadStatus.PERDIDO,
    valor_estimado: new Prisma.Decimal(5300),
    tasks: {
      create: [
        {
          descricao: "Registrar motivo de perda e agendar recontato futuro",
          status: TaskStatus.PENDENTE,
          data_limite: daysFromNow(30),
        },
      ],
    },
  },
];

async function main() {
  console.log("Limpando banco local...");

  await prisma.task.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.autoResponse.deleteMany();
  await prisma.appSetting.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all([
    prisma.user.create({
      data: {
        nome: "Ana Beatriz Lima",
        email: "ana.lima@lumixengine.com.br",
        senha_hash: "$2a$10$seed.admin.hash",
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        nome: "Caio Menezes",
        email: "caio.menezes@lumixengine.com.br",
        senha_hash: "$2a$10$seed.atendente.caio",
        role: UserRole.ATENDENTE,
      },
    }),
    prisma.user.create({
      data: {
        nome: "Larissa Duarte",
        email: "larissa.duarte@lumixengine.com.br",
        senha_hash: "$2a$10$seed.atendente.larissa",
        role: UserRole.ATENDENTE,
      },
    }),
  ]);

  await prisma.autoResponse.create({
    data: {
      gatilho: "boas_vindas",
      conteudo_texto:
        "Olá! Recebemos sua mensagem. Um atendente da LumixEngine vai continuar seu atendimento em instantes.",
      ativo: true,
    },
  });

  await prisma.appSetting.createMany({
    data: [
      { chave: "SMTP_HOST", valor: null, categoria: "email" },
      { chave: "SMTP_PORT", valor: "587", categoria: "email" },
      { chave: "SMTP_USER", valor: null, categoria: "email" },
      { chave: "SMTP_PASS", valor: null, categoria: "email", secreto: true },
      { chave: "SMTP_FROM", valor: null, categoria: "email" },
      {
        chave: "INTERNAL_LEAD_NOTIFICATION_EMAIL",
        valor: null,
        categoria: "email",
      },
      { chave: "WHATSAPP_API_URL", valor: null, categoria: "whatsapp" },
      {
        chave: "WHATSAPP_API_TOKEN",
        valor: null,
        categoria: "whatsapp",
        secreto: true,
      },
    ],
  });

  console.log("Inserindo leads realistas...");

  for (const [index, lead] of leads.entries()) {
    const assignedUser = users[index % users.length];

    await prisma.lead.create({
      data: {
        ...lead,
        ...(index % 2 === 0 && assignedUser
          ? {
              assigned_to: {
                connect: {
                  id: assignedUser.id,
                },
              },
            }
          : {}),
      },
    });
  }

  const [
    leadCount,
    messageCount,
    taskCount,
    userCount,
    autoResponseCount,
    settingCount,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.message.count(),
    prisma.task.count(),
    prisma.user.count(),
    prisma.autoResponse.count(),
    prisma.appSetting.count(),
  ]);

  console.log(
    `Seed concluído: ${leadCount} leads, ${messageCount} mensagens, ${taskCount} tarefas, ${userCount} usuários, ${autoResponseCount} resposta automática e ${settingCount} configurações.`,
  );
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
