import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { heroContent, whatsappLinks } from '../constants/content';
import { MockChat } from './MockChat';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section
      className="hero-glow relative overflow-hidden px-3 pb-14 pt-24 min-[360px]:px-5 min-[360px]:pb-16 md:px-8 md:pb-20 md:pt-28"
      aria-labelledby="hero-title"
    >
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 md:gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.div
            className="mb-6 inline-flex items-center gap-3 text-sm font-extrabold text-emerald-100"
            variants={fadeUp}
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Projetos digitais para operações reais
          </motion.div>

          <motion.h1
            id="hero-title"
            className="max-w-5xl break-words text-[clamp(2rem,11vw,3.75rem)] font-extrabold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl"
            variants={fadeUp}
          >
            {heroContent.title}
          </motion.h1>

          <motion.p
            className="mt-5 max-w-2xl text-base leading-7 text-slate-300 min-[360px]:mt-6 min-[360px]:text-lg min-[360px]:leading-8 md:text-xl"
            variants={fadeUp}
          >
            {heroContent.subtitle}
          </motion.p>

          <motion.div className="mt-9 flex flex-col gap-4 sm:flex-row" variants={fadeUp}>
            <a
              href={whatsappLinks.budget}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-emerald-950 shadow-[0_18px_60px_rgba(16,185,129,0.24)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-[0_22px_70px_rgba(16,185,129,0.30)] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-night min-[360px]:inline-flex"
            >
              {heroContent.primaryCta}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={whatsappLinks.budget}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-extrabold text-emerald-950 shadow-[0_18px_60px_rgba(16,185,129,0.24)] transition-all duration-300 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-night min-[360px]:hidden"
            >
              Solicitar Proposta
            </a>
          </motion.div>

          <motion.div
            className="mt-9 hidden gap-3 text-sm font-semibold text-slate-200 min-[360px]:grid sm:grid-cols-3"
            variants={fadeUp}
          >
            {heroContent.benefits.map((benefit) => (
              <div className="flex items-center gap-2" key={benefit.label}>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                {benefit.label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="hidden min-[360px]:block">
          <MockChat />
        </div>
      </div>
    </section>
  );
}
