import { motion } from 'framer-motion';
import { ArrowRight, Compass, Home, MessageCircle, SearchX } from 'lucide-react';
import { whatsappLinks } from '../constants/content';

const panelMotion = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

export function NotFoundPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-night px-3 pb-20 pt-32 min-[360px]:px-5 md:px-8 md:pb-24 md:pt-36">
      <div className="pointer-events-none absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <section className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center" aria-labelledby="not-found-title">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={panelMotion}
          transition={{ duration: 0.42, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-extrabold text-emerald-100">
            <SearchX className="h-4 w-4" aria-hidden="true" />
            Página não encontrada
          </div>

          <h1 id="not-found-title" className="mt-6 max-w-3xl text-[clamp(2.5rem,14vw,6rem)] font-black leading-none tracking-normal text-white">
            404
          </h1>
          <p className="mt-5 max-w-2xl text-[clamp(1.75rem,7vw,3rem)] font-extrabold leading-tight tracking-normal text-white md:text-5xl">
            Esse caminho saiu do fluxo.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            A página que você tentou acessar não existe ou foi movida. Volte para a landing page da LumixEngine ou fale com a gente sobre a solução digital que sua operação precisa.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-extrabold text-emerald-950 shadow-[0_18px_60px_rgba(16,185,129,0.24)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-night"
            >
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              Voltar para o início
            </a>
            <a
              href={whatsappLinks.budget}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-slate-800 bg-white/5 px-6 py-3 text-sm font-extrabold text-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-emerald-400/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-night"
            >
              Solicitar proposta
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </motion.div>

        <motion.div
          className="relative overflow-hidden rounded-xl border border-slate-800 bg-panel p-5 shadow-soft md:p-8"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.08, duration: 0.46, ease: 'easeOut' }}
        >
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <p className="text-sm font-extrabold text-white">LumixEngine Navigator</p>
                <p className="mt-1 text-xs font-bold text-slate-400">Rota solicitada não disponível</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-emerald-950">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-lg border border-white/5 bg-white/[0.04] p-4">
                <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Status</p>
                <p className="mt-2 text-lg font-extrabold text-white">URL fora do mapa público</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Mantemos a navegação simples para você voltar rapidamente ao conteúdo principal.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="/#solucoes"
                  className="rounded-lg border border-slate-800 bg-night/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/[0.06]"
                >
                  <p className="text-sm font-extrabold text-white">Ver soluções</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Sites, sistemas, automações e integrações.</p>
                </a>
                <a
                  href="/#contato"
                  className="rounded-lg border border-slate-800 bg-night/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/[0.06]"
                >
                  <p className="text-sm font-extrabold text-white">Enviar contato</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">E-mail e WhatsApp com DDD para retorno.</p>
                </a>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-extrabold text-emerald-100">
                <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                O canal comercial segue ativo para orientar o próximo passo.
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
