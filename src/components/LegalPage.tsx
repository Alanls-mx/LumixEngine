import { ArrowLeft, ExternalLink, Lock, Mail, ShieldCheck } from 'lucide-react';

type LegalPageType = 'privacy' | 'terms';

type LegalSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
};

type LegalContent = {
  title: string;
  description: string;
  summary: readonly string[];
  icon: typeof ShieldCheck;
  sections: readonly LegalSection[];
};

const updatedAt = '13 de setembro de 2026';
const companyName = '68.685.237 Alan Luiz da Silva';
const companyDocument = 'CNPJ 68.685.237/0001-97';
const privacyEmail = 'contact@lumixengine.com';

const legalContent: Record<LegalPageType, LegalContent> = {
  privacy: {
    title: 'Política de Privacidade',
    description:
      'Este documento explica quais dados a LumixEngine trata quando você navega pelo site, solicita um orçamento ou inicia uma conversa pelos canais indicados.',
    summary: [
      'Coletamos dados comerciais quando você os informa ou envia um formulário.',
      'Medição de audiência e publicidade são opcionais e dependem da sua escolha.',
      'Você pode solicitar acesso, correção, informação sobre compartilhamento ou exclusão quando aplicável.',
    ],
    icon: ShieldCheck,
    sections: [
      {
        id: 'controlador-escopo',
        title: '1. Controlador e escopo',
        paragraphs: [
          `A LumixEngine é operada por ${companyName}, ${companyDocument}, responsável pelas decisões sobre o tratamento descrito nesta política.`,
          'Esta política se aplica ao site lumixengine.com, aos formulários comerciais nele disponíveis e aos dados encaminhados ao LumixEngine App para atendimento. Soluções desenvolvidas para clientes podem possuir políticas próprias e não são abrangidas automaticamente por este documento.',
        ],
      },
      {
        id: 'dados-tratados',
        title: '2. Dados que podem ser tratados',
        paragraphs: [
          'Os dados efetivamente tratados dependem de como você utiliza o site. Não solicitamos documentos pessoais, dados financeiros ou dados pessoais sensíveis nos formulários públicos.',
        ],
        bullets: [
          'Dados fornecidos por você: nome, e-mail, telefone ou WhatsApp, mensagem, solução de interesse, faixa estimada de investimento e informações incluídas voluntariamente na descrição do projeto.',
          'Contexto do acesso enviado com o formulário: página e título acessados, endereço de referência, idioma, fuso horário, tamanho da tela, navegador, data e hora do envio.',
          'Dados de campanha quando presentes na URL: parâmetros UTM, gclid e fbclid.',
          'Dados técnicos registrados pelo servidor: endereço IP, user agent, origem da requisição e informações necessárias para segurança, limitação de tentativas e diagnóstico de falhas.',
          'Dados de medição opcionais: eventos de navegação e conversão processados pelo Google Analytics ou Meta Pixel somente quando configurados e autorizados.',
        ],
      },
      {
        id: 'finalidades-bases',
        title: '3. Finalidades e bases legais',
        paragraphs: [
          'Usamos os dados para responder contatos, entender necessidades, preparar propostas, organizar o relacionamento comercial, proteger os serviços e cumprir obrigações aplicáveis.',
        ],
        bullets: [
          'Atender solicitações e realizar procedimentos preliminares relacionados a uma possível contratação.',
          'Registrar o histórico comercial e permitir que a equipe acompanhe mensagens, tarefas e próximos passos.',
          'Prevenir abuso, fraude, automação maliciosa e indisponibilidade dos serviços, observando o legítimo interesse e os direitos do titular.',
          'Cumprir obrigações legais, regulatórias ou ordens válidas de autoridades.',
          'Medir audiência, campanhas e conversões mediante consentimento para recursos opcionais.',
        ],
      },
      {
        id: 'compartilhamento',
        title: '4. Compartilhamento e operadores',
        paragraphs: [
          'Os dados podem ser processados por fornecedores necessários à hospedagem, segurança, comunicação e gestão comercial. O acesso é limitado ao necessário para cada finalidade.',
        ],
        bullets: [
          'LumixEngine App, utilizado internamente como CRM para armazenar e acompanhar solicitações comerciais.',
          'Provedores de hospedagem, banco de dados, entrega de e-mail, segurança de rede e infraestrutura.',
          'Google Analytics e Meta Pixel, somente quando estiverem configurados e você aceitar a medição opcional.',
          'WhatsApp, Instagram, LinkedIn e GitHub quando você decide abrir um link externo; a partir daí, aplicam-se também as políticas dessas plataformas.',
          'Autoridades públicas ou terceiros quando o compartilhamento for exigido por lei, ordem válida ou necessário ao exercício regular de direitos.',
        ],
      },
      {
        id: 'cookies',
        title: '5. Cookies, armazenamento local e medição',
        paragraphs: [
          'O site usa o armazenamento local do navegador para guardar sua escolha de consentimento. Essa preferência é funcional e não contém os dados enviados nos formulários.',
          'Google Analytics e Meta Pixel não são carregados antes do aceite. Você pode recusar os recursos opcionais sem perder acesso ao conteúdo, reabrir as Configurações de Cookies no rodapé e mudar sua escolha a qualquer momento. A revogação interrompe novos eventos e solicita a remoção dos identificadores acessíveis ao site.',
        ],
      },
      {
        id: 'retencao-seguranca',
        title: '6. Retenção e segurança',
        paragraphs: [
          'Mantemos dados comerciais pelo período necessário para responder à solicitação, conduzir a relação comercial, preservar registros legítimos e cumprir obrigações legais. Pedidos de eliminação são avaliados considerando essas finalidades e as hipóteses legais de conservação.',
          'Aplicamos controles compatíveis com o serviço, incluindo conexão HTTPS, validação de entradas, limitação de requisições, restrição de origens e acesso administrativo autenticado. Nenhum ambiente conectado à internet é completamente isento de risco; incidentes confirmados são tratados conforme sua natureza e as exigências aplicáveis.',
        ],
      },
      {
        id: 'transferencia',
        title: '7. Processamento em outros países',
        paragraphs: [
          'Alguns fornecedores de infraestrutura, análise ou comunicação podem processar dados fora do Brasil. Quando isso ocorrer, buscamos utilizar prestadores com medidas contratuais e técnicas adequadas ao tipo de tratamento realizado.',
        ],
      },
      {
        id: 'direitos',
        title: '8. Seus direitos',
        paragraphs: [
          'Nos termos da LGPD e conforme aplicável ao caso concreto, você pode pedir confirmação de tratamento, acesso, correção, informação sobre compartilhamento, portabilidade, anonimização, bloqueio ou eliminação, além de revogar consentimento e apresentar oposição fundamentada.',
          'Podemos solicitar informações para confirmar a identidade do requerente e proteger os dados contra acesso indevido. Alguns registros podem ser preservados quando houver obrigação legal, necessidade de defesa de direitos ou outra hipótese autorizada.',
        ],
      },
      {
        id: 'menores',
        title: '9. Crianças e dados sensíveis',
        paragraphs: [
          'O site é destinado a contatos profissionais e não foi projetado para coletar intencionalmente dados de crianças ou adolescentes. Também pedimos que não sejam inseridos dados pessoais sensíveis ou informações confidenciais desnecessárias nos campos de texto livre.',
        ],
      },
      {
        id: 'contato-atualizacoes',
        title: '10. Contato e atualizações',
        paragraphs: [
          `Solicitações relacionadas à privacidade podem ser enviadas para ${privacyEmail}. Esta política pode ser atualizada para refletir mudanças legais, técnicas ou operacionais; a data no início da página identifica a versão vigente.`,
        ],
      },
    ],
  },
  terms: {
    title: 'Termos de Uso',
    description:
      'Estes termos regulam a navegação no site institucional da LumixEngine, o acesso ao portfólio e o uso dos canais de contato comercial.',
    summary: [
      'O site apresenta serviços, cases e simulações; ele não conclui uma contratação automaticamente.',
      'Propostas só se tornam vinculantes após aceite formal das condições comerciais aplicáveis.',
      'Conteúdo, identidade visual e código não podem ser copiados ou explorados sem autorização.',
    ],
    icon: Lock,
    sections: [
      {
        id: 'identificacao-aceite',
        title: '1. Identificação e aceite',
        paragraphs: [
          `O site é mantido pela LumixEngine, operada por ${companyName}, ${companyDocument}. Ao navegar ou utilizar os canais disponibilizados, você declara ter lido estes Termos e concorda em respeitar as regras aplicáveis ao uso do site.`,
          'Se você não concordar com alguma condição, interrompa o uso das funcionalidades correspondentes. A Política de Privacidade complementa estes Termos quanto ao tratamento de dados pessoais.',
        ],
      },
      {
        id: 'finalidade',
        title: '2. Finalidade do site',
        paragraphs: [
          'O site apresenta a LumixEngine, suas capacidades, projetos e formas de contato. Formulários, diagnósticos iniciais e conversas servem para compreender uma necessidade comercial e não constituem consultoria definitiva, garantia de resultado ou contratação automática.',
          'Produtos, cronogramas, integrações, suporte, valores, propriedade sobre entregáveis e demais condições de um projeto serão definidos em proposta, contrato ou instrumento específico.',
        ],
      },
      {
        id: 'portfolio-simulacoes',
        title: '3. Portfólio, demonstrações e resultados',
        paragraphs: [
          'Cases, telas, fluxos, métricas e simulações têm finalidade demonstrativa. Alguns conteúdos podem usar dados fictícios, imagens ilustrativas ou informações anonimizadas para apresentar possibilidades técnicas sem expor operações de terceiros.',
          'Um case demonstra experiência e capacidade, mas não significa que todas as funções estarão presentes em qualquer novo projeto. Resultados dependem de escopo, integrações, dados, operação, fornecedores e decisões do contratante.',
        ],
      },
      {
        id: 'uso-permitido',
        title: '4. Uso permitido e condutas vedadas',
        paragraphs: ['Você pode acessar e compartilhar links públicos do site para fins legítimos. Não é permitido:'],
        bullets: [
          'Tentar acessar áreas restritas, explorar vulnerabilidades, contornar limites de requisição ou comprometer a disponibilidade do serviço.',
          'Enviar código malicioso, conteúdo ilícito, dados de terceiros sem autorização ou informações enganosas pelos formulários.',
          'Automatizar consultas de forma abusiva, extrair conteúdo em massa ou reutilizar dados e elementos do site em desacordo com estes Termos e a legislação.',
          'Usar a marca LumixEngine de modo que sugira parceria, endosso ou autorização inexistente.',
        ],
      },
      {
        id: 'propriedade-intelectual',
        title: '5. Propriedade intelectual',
        paragraphs: [
          'A marca LumixEngine, textos, layout, componentes, código, documentação, apresentações e demais materiais próprios são protegidos pela legislação aplicável. O acesso ao site não transfere direitos de propriedade ou licença para reprodução comercial.',
          'Marcas, imagens, fontes, bibliotecas e serviços de terceiros permanecem sujeitos aos direitos e licenças de seus respectivos titulares. Referências exibidas em cases não implicam cessão de direitos sobre marcas de clientes ou parceiros.',
        ],
      },
      {
        id: 'servicos-externos',
        title: '6. Links e serviços externos',
        paragraphs: [
          'O site pode direcionar para WhatsApp, redes sociais, repositórios e outros serviços externos. A LumixEngine não controla a disponibilidade, o conteúdo ou as práticas de privacidade dessas plataformas. O uso passa a observar também os termos do respectivo fornecedor.',
        ],
      },
      {
        id: 'disponibilidade',
        title: '7. Disponibilidade e responsabilidade',
        paragraphs: [
          'Buscamos manter o conteúdo correto, seguro e disponível, mas podemos realizar manutenções, atualizações ou alterações sem continuidade permanente de todas as funcionalidades. Informações podem conter imprecisões pontuais e serão corrigidas quando identificadas.',
          'Na extensão permitida pela legislação, a LumixEngine não responde por indisponibilidades causadas por terceiros, uso incompatível do site, decisões tomadas exclusivamente com base em demonstrações ou danos decorrentes de atividade ilícita do usuário.',
        ],
      },
      {
        id: 'privacidade',
        title: '8. Privacidade e comunicações',
        paragraphs: [
          'O tratamento de dados pessoais segue a Política de Privacidade. Ao enviar um formulário, você autoriza o retorno relacionado à solicitação pelos dados de contato informados. Comunicações promocionais independentes exigirão fundamento adequado e oferecerão mecanismo de descadastramento quando aplicável.',
        ],
      },
      {
        id: 'alteracoes',
        title: '9. Alterações e legislação aplicável',
        paragraphs: [
          'Estes Termos podem ser atualizados quando houver mudanças no site, nos serviços ou na legislação. A versão vigente será identificada pela data exibida no início da página.',
          'Aplicam-se as leis da República Federativa do Brasil. Eventuais controvérsias serão tratadas no foro competente definido pela legislação, preservados os direitos do consumidor quando aplicáveis.',
        ],
      },
      {
        id: 'contato',
        title: '10. Contato',
        paragraphs: [`Dúvidas sobre estes Termos podem ser enviadas para ${privacyEmail} ou pelos canais oficiais indicados no site.`],
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
    <main className="min-h-screen bg-night pb-20 pt-28 text-slate-300 md:pb-28 md:pt-32">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <a
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-extrabold text-emerald-200 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-4 focus:ring-offset-night"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para o site
        </a>

        <header className="mt-10 max-w-4xl border-b border-slate-800 pb-12 md:mt-14 md:pb-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 id="legal-page-title" className="mt-6 text-balance text-[clamp(2.35rem,8vw,4.75rem)] font-extrabold leading-[1.05] text-white">
            {content.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{content.description}</p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-slate-400">
            <span>Atualizada em {updatedAt}</span>
            <span>{companyDocument}</span>
          </div>
        </header>

        <section className="grid border-b border-slate-800 py-10 sm:grid-cols-3 sm:gap-8 md:py-12" aria-label="Resumo do documento">
          {content.summary.map((item) => (
            <p
              className="border-t border-slate-800 py-5 text-sm font-semibold leading-6 text-slate-200 first:border-t-0 sm:border-l sm:border-t-0 sm:py-0 sm:pl-6 sm:first:border-l-0 sm:first:pl-0"
              key={item}
            >
              {item}
            </p>
          ))}
        </section>

        <div className="grid gap-12 pt-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20 lg:pt-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-extrabold text-white">Neste documento</p>
            <nav className="mt-4 grid gap-1" aria-label={`Seções de ${content.title}`}>
              {content.sections.map((section) => (
                <a
                  href={`#${section.id}`}
                  className="rounded-lg px-3 py-2 text-sm font-semibold leading-5 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  key={section.id}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="min-w-0 max-w-3xl" aria-labelledby="legal-page-title">
            {content.sections.map((section) => (
              <section
                id={section.id}
                className="scroll-mt-32 border-t border-slate-800 py-9 first:border-t-0 first:pt-0 md:py-11"
                key={section.id}
              >
                <h2 className="text-balance text-2xl font-extrabold leading-tight text-white sm:text-3xl">{section.title}</h2>
                <div className="mt-5 grid gap-4 text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets ? (
                  <ul className="mt-6 grid gap-3 pl-5 text-sm leading-7 text-slate-300 marker:text-emerald-300 sm:text-base sm:leading-8">
                    {section.bullets.map((item) => (
                      <li className="pl-2" key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <section className="mt-4 border-t border-slate-700 pt-10" aria-labelledby="legal-contact-title">
              <h2 id="legal-contact-title" className="text-2xl font-extrabold text-white sm:text-3xl">Fale com a LumixEngine</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                Para exercer direitos, esclarecer este documento ou comunicar uma preocupação, identifique o assunto e forneça apenas os dados necessários para localizarmos sua solicitação.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href={`mailto:${privacyEmail}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-extrabold text-emerald-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-night"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {privacyEmail}
                </a>
                <a
                  href="/#contato"
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-slate-700 px-5 py-3 text-sm font-extrabold text-white transition hover:border-emerald-300 hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  Formulário de contato
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
              <p className="mt-7 text-sm leading-6 text-slate-400">
                {type === 'privacy' ? (
                  <a
                    href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-bold text-slate-300 underline decoration-slate-600 underline-offset-4 transition hover:text-white"
                  >
                    Consulte também os direitos explicados pela ANPD
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : (
                  <a
                    href="/politica-de-privacidade"
                    className="font-bold text-slate-300 underline decoration-slate-600 underline-offset-4 transition hover:text-white"
                  >
                    Leia também a Política de Privacidade
                  </a>
                )}
              </p>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
