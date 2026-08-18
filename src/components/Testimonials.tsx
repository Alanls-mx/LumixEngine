import { motion } from 'framer-motion';

interface ComparisonRow {
  step: string;
  current: string;
  lumix: string;
}

interface ImpactMetric {
  value: string;
  label: string;
}

const comparisonRows = [
  {
    step: 'Entrada de leads',
    current: 'O cliente preenche um formulário, chama no WhatsApp ou compra pela loja, mas a informação fica espalhada.',
    lumix: 'Cada entrada vira registro com origem, interesse e canal, pronto para seguir no fluxo certo.',
  },
  {
    step: 'Gestão de dados',
    current: 'A equipe copia informações entre planilhas, conversas, agenda e sistemas que não conversam entre si.',
    lumix: 'Dados importantes ficam conectados em páginas, painéis, CRM, planilhas ou APIs conforme o projeto.',
  },
  {
    step: 'Pagamentos',
    current: 'Comprovantes, sinais e pedidos dependem de conferência manual antes de alguém atualizar o status.',
    lumix: 'Pix, checkout ou webhook podem atualizar reserva, pedido ou ficha do cliente automaticamente.',
  },
  {
    step: 'Histórico',
    current: 'Quando outro atendente assume, precisa procurar contexto em mensagens antigas e anotações soltas.',
    lumix: 'Histórico, responsável, prioridade e próxima ação ficam visíveis para a equipe continuar sem recomeçar.',
  },
] satisfies readonly ComparisonRow[];

const impactMetrics = [
  {
    value: 'Sob medida',
    label: 'Construído a partir da rotina real do negócio',
  },
  {
    value: 'Integrado',
    label: 'Sites, sistemas, dados e ferramentas trabalhando juntos',
  },
  {
    value: 'Evolutivo',
    label: 'Começa simples e cresce junto com novas demandas',
  },
] satisfies readonly ImpactMetric[];

export function Testimonials() {
  return (
    <section
      id="beneficios"
      className="bg-[#0B101B] px-3 py-12 min-[360px]:px-5 md:px-8 md:py-16"
      aria-labelledby="impact-title"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <h2 id="impact-title" className="text-[clamp(1.875rem,7vw,3rem)] font-bold tracking-normal text-white md:text-5xl">
            Onde a operação escapa hoje
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            A LumixEngine transforma processos espalhados em sistemas, páginas e integrações que a equipe consegue usar no dia a dia.
          </p>
        </div>

        <motion.div
          className="mt-12 overflow-hidden border-y border-slate-800"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="hidden grid-cols-[0.7fr_1fr_1fr] border-b border-slate-800 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500 md:grid">
            <div>Etapa</div>
            <div>Como é hoje</div>
            <div>Com a LumixEngine</div>
          </div>

          {comparisonRows.map((row, index) => (
            <motion.div
              className={[
                'grid gap-4 py-6 md:grid-cols-[0.7fr_1fr_1fr] md:items-start',
                index > 0 ? 'border-t border-slate-800' : '',
              ].join(' ')}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.05, duration: 0.38, ease: 'easeOut' }}
              key={row.step}
            >
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500 md:hidden">
                  Etapa
                </p>
                <p className="mt-1 text-base font-extrabold text-white md:mt-0">{row.step}</p>
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500 md:hidden">
                  Como é hoje
                </p>
                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400 md:mt-0">{row.current}</p>
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-300 md:hidden">
                  Com a LumixEngine
                </p>
                <p className="mt-1 max-w-xl text-sm font-semibold leading-6 text-white md:mt-0">
                  {row.lumix}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 grid gap-8 border-t border-slate-800 pt-10 md:grid-cols-3"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {impactMetrics.map((metric, index) => (
            <div
              className={[
                'min-w-0',
                index > 0 ? 'border-t border-slate-800 pt-8 md:border-l md:border-t-0 md:pl-8 md:pt-0' : '',
              ].join(' ')}
              key={metric.label}
            >
              <div>
                <p className="text-[clamp(1.875rem,7vw,2.25rem)] font-black tracking-normal text-white md:text-4xl">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-300">
                  {metric.label}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
