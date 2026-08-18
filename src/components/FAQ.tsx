interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems = [
  {
    id: 'tech-knowledge',
    question: 'Que tipos de soluções a LumixEngine desenvolve?',
    answer:
      'A LumixEngine desenvolve soluções digitais de acordo com a necessidade de cada operação, incluindo sites, landing pages, lojas virtuais, sistemas web, dashboards, CRMs, agendamentos, automações e integrações com ferramentas e serviços já utilizados pela empresa.',
  },
  {
    id: 'integrations',
    question: 'Vocês desenvolvem sistemas sob medida?',
    answer:
      'Sim. Antes de escrever código, entendemos como sua operação funciona: quais dados entram, quem usa, quais etapas precisam de controle e onde existe retrabalho. A partir disso, desenhamos a solução adequada.',
  },
  {
    id: 'delivery-time',
    question: 'Posso contratar apenas um site, landing page ou loja virtual?',
    answer:
      'Pode. O projeto não precisa começar grande. Podemos construir uma página de captação, um site institucional ou uma loja virtual e, quando fizer sentido, conectar formulários, pagamentos, CRM, planilhas ou atendimento.',
  },
  {
    id: 'reliability',
    question: 'Minha empresa já usa planilhas, ERP, agenda ou CRM. Dá para integrar?',
    answer:
      'Sim. Integramos ferramentas existentes como Google Sheets, Excel, Google Calendar, CRMs, ERPs, gateways de pagamento, APIs e webhooks para reduzir digitação manual e manter as informações atualizadas.',
  },
  {
    id: 'custom-process',
    question: 'Qual é o prazo de entrega?',
    answer:
      'Depende do escopo. Uma landing page ou site simples costuma andar mais rápido; sistemas, dashboards e integrações exigem mapeamento mais cuidadoso. Depois da análise inicial, apresentamos prazo e etapas com clareza.',
  },
] satisfies readonly FAQItem[];

export function FAQ() {
  return (
    <section
      className="bg-night px-3 py-12 min-[360px]:px-5 md:px-8 md:py-16"
      aria-labelledby="faq-title"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <h2
            id="faq-title"
            className="text-[clamp(1.875rem,7vw,3rem)] font-bold tracking-normal text-white md:text-5xl"
          >
            Perguntas antes de tirar o processo do improviso
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            Respostas diretas sobre escopo, integração, prazos e como uma solução sob medida entra na rotina da empresa.
          </p>
        </div>

        <div className="divide-y divide-slate-800 border-y border-slate-800">
          {faqItems.map((item) => (
            <article className="py-6" key={item.id}>
              <h3 className="text-lg font-extrabold text-white">{item.question}</h3>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
