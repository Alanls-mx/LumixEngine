import { ArrowLeft, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

type LegalPageType = 'privacy' | 'terms';

type LegalSection = {
  title: string;
  body: string;
};

type LegalContent = {
  label: string;
  title: string;
  description: string;
  icon: typeof ShieldCheck;
  sections: LegalSection[];
};

const updatedAt = '18 de agosto de 2026';

const legalContent: Record<LegalPageType, LegalContent> = {
  privacy: {
    label: 'LGPD e privacidade',
    title: 'Política de Privacidade',
    description:
      'Explicamos de forma direta como a LumixEngine trata dados enviados pelo site e pelos canais de atendimento.',
    icon: ShieldCheck,
    sections: [
      {
        title: 'Dados coletados',
        body:
          'Coletamos apenas os dados informados voluntariamente em formulários ou contatos comerciais, como e-mail, WhatsApp com DDD e contexto necessário para responder à solicitação.',
      },
      {
        title: 'Finalidade de uso',
        body:
          'Os dados são usados para responder pedidos de orçamento, apresentar diagnósticos, prestar suporte comercial e melhorar a experiência de contato com a LumixEngine.',
      },
      {
        title: 'Retenção no frontend',
        body:
          'O site não grava dados pessoais do formulário em localStorage, sessionStorage ou cookies. Após envio bem-sucedido ao backend, os campos são limpos da memória da interface.',
      },
      {
        title: 'Cookies e medição',
        body:
          'Utilizamos apenas cookies ou identificadores de medição quando o visitante aceita o consentimento. A preferência salva localmente registra somente o aceite de cookies.',
      },
      {
        title: 'Direitos do titular',
        body:
          'Você pode solicitar acesso, correção ou exclusão dos seus dados entrando em contato pelos canais oficiais da LumixEngine.',
      },
    ],
  },
  terms: {
    label: 'Condições de uso',
    title: 'Termos de Uso',
    description:
      'Estas regras orientam o uso do site, dos conteúdos demonstrativos e dos canais comerciais da LumixEngine.',
    icon: Lock,
    sections: [
      {
        title: 'Uso do site',
        body:
          'O visitante deve usar o site de forma lícita, sem tentar comprometer a segurança, disponibilidade ou integridade dos sistemas apresentados.',
      },
      {
        title: 'Conteúdos e simulações',
        body:
          'Métricas, fluxos e exemplos visuais exibidos na landing page têm finalidade demonstrativa e podem variar conforme o nicho, integrações e processos de cada empresa.',
      },
      {
        title: 'Orçamentos e propostas',
        body:
          'O envio de dados pelo formulário ou WhatsApp não cria obrigação automática de contratação. Cada proposta é apresentada conforme escopo, prazo e complexidade do projeto.',
      },
      {
        title: 'Propriedade intelectual',
        body:
          'Textos, layout, marca, imagens e componentes do site pertencem à LumixEngine ou são utilizados sob licença adequada, sendo vedada a reprodução sem autorização.',
      },
      {
        title: 'Atualizações',
        body:
          'A LumixEngine pode atualizar estes termos para refletir melhorias nos serviços, mudanças legais ou ajustes operacionais.',
      },
    ],
  },
};

type LegalPageProps = {
  type: LegalPageType;
};

export function LegalPage({ type }: LegalPageProps) {
  const content = legalContent[type];
  const Icon = content.icon;

  return (
    <main className="min-h-screen overflow-hidden bg-night px-3 pb-20 pt-32 min-[360px]:px-5 md:px-8 md:pb-24 md:pt-36">
      <section className="relative mx-auto max-w-5xl" aria-labelledby="legal-page-title">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-panel/70 px-4 py-2 text-sm font-extrabold text-emerald-100 transition hover:border-emerald-500/30 hover:bg-emerald-400/10"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para o site
        </a>

        <div className="relative mt-8 overflow-hidden rounded-xl border border-slate-800 bg-panel p-6 shadow-soft md:p-10">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-extrabold text-emerald-100">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {content.label}
            </div>

            <h1 id="legal-page-title" className="mt-5 text-[clamp(1.875rem,7vw,3rem)] font-extrabold tracking-normal text-white md:text-5xl">
              {content.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">{content.description}</p>
            <p className="mt-4 text-sm font-bold text-slate-500">Última atualização: {updatedAt}</p>

            <div className="mt-10 grid gap-4">
              {content.sections.map((section) => (
                <article key={section.title} className="rounded-lg border border-white/5 bg-white/5 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-300" aria-hidden="true" />
                    <div>
                      <h2 className="text-lg font-extrabold text-white">{section.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300 md:text-base">{section.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
