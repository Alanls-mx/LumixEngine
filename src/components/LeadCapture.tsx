import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { whatsappLinks } from '../constants/content';
import { formatPhone, isTextFilled, isValidEmail, isValidPhone, toBrazilianE164 } from '../lib/leadForm';
import { getLeadWebhookErrorMessage, submitLeadWebhook } from '../services/leadWebhook';

type QuickContactForm = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

const initialForm: QuickContactForm = {
  fullName: '',
  email: '',
  phone: '',
  message: '',
};

export function LeadCapture() {
  const [formState, setFormState] = useState<QuickContactForm>(initialForm);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = <Key extends keyof QuickContactForm>(field: Key, value: QuickContactForm[Key]) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = formState.fullName.trim();
    const email = formState.email.trim().toLowerCase();
    const message = formState.message.trim();

    if (!isTextFilled(fullName, 3)) {
      setErrorMessage('Informe seu nome completo para continuarmos.');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }

    if (!isValidPhone(formState.phone)) {
      setErrorMessage('Informe um WhatsApp com DDD. Exemplo: (11) 99999-9999.');
      return;
    }

    if (!isTextFilled(message, 10)) {
      setErrorMessage('Escreva uma mensagem com um pouco mais de contexto.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitLeadWebhook({
        nome: fullName,
        email,
        telefone: toBrazilianE164(formState.phone),
        conteudo: `[Contato Rápido] ${message}`,
        origem: 'SITE',
      });

      setIsSubmitted(true);
      setFormState(initialForm);
    } catch (error) {
      setErrorMessage(getLeadWebhookErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contato"
      className="bg-[#0B101B] px-3 py-12 min-[360px]:px-5 md:px-8 md:py-16"
      aria-labelledby="lead-capture-title"
    >
      <motion.div
        className="relative mx-auto max-w-6xl overflow-hidden rounded-xl border border-slate-800 bg-panel p-6 shadow-soft md:p-8"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <h2 id="lead-capture-title" className="text-[clamp(1.5rem,6vw,2.25rem)] font-extrabold tracking-normal text-white md:text-4xl">
              Contato rápido com a LumixEngine
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
              Envie seus dados e uma mensagem objetiva. Um especialista retorna para entender se sua empresa precisa de site, loja, sistema, automação ou integração.
            </p>
            <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-300 sm:grid-cols-2 lg:grid-cols-1">
              <p className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">Resposta comercial pelo WhatsApp informado.</p>
              <p className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">Dados enviados direto ao LumixEngine App.</p>
            </div>
            <a
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-extrabold text-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-night"
              href={whatsappLinks.budget}
              target="_blank"
              rel="noopener noreferrer"
            >
              Conversar direto no WhatsApp
              <MessageCircle className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            </a>
          </div>

          <div>
            <form className="grid gap-4" onSubmit={handleSubmit} autoComplete="off" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-extrabold uppercase text-slate-300">Nome completo</span>
                  <input
                    className="min-h-12 w-full rounded-lg border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-400 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/30 disabled:opacity-70"
                    type="text"
                    value={formState.fullName}
                    onChange={(event) => updateField('fullName', event.target.value)}
                    placeholder="Seu nome"
                    autoComplete="off"
                    disabled={isSubmitting}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-extrabold uppercase text-slate-300">E-mail</span>
                  <input
                    className="min-h-12 w-full rounded-lg border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-400 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/30 disabled:opacity-70"
                    type="email"
                    value={formState.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="off"
                    disabled={isSubmitting}
                    required
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-extrabold uppercase text-slate-300">Telefone / WhatsApp</span>
                <input
                  className="min-h-12 w-full rounded-lg border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-400 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/30 disabled:opacity-70"
                  type="tel"
                  value={formState.phone}
                  onChange={(event) => updateField('phone', formatPhone(event.target.value))}
                  onKeyDown={(event) => {
                    if (event.key.length === 1 && !/\d/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  placeholder="(11) 99999-9999"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={15}
                  disabled={isSubmitting}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-extrabold uppercase text-slate-300">Sua mensagem</span>
                <textarea
                  className="min-h-32 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-slate-400 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/30 disabled:opacity-70"
                  value={formState.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  placeholder="Conte rapidamente o que você precisa melhorar ou construir."
                  autoComplete="off"
                  disabled={isSubmitting}
                  required
                />
              </label>

              <button
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-emerald-500 px-6 text-sm font-extrabold text-emerald-950 shadow-[0_18px_60px_rgba(16,185,129,0.22)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-[0_22px_70px_rgba(16,185,129,0.30)] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-night disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Contato Rápido'}
                <Send className="ml-2 h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            {errorMessage ? (
              <motion.p
                className="mt-4 text-sm font-bold text-rose-300"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                role="alert"
              >
                {errorMessage}
              </motion.p>
            ) : null}

            {isSubmitted ? (
              <motion.p
                className="mt-4 flex items-center gap-2 text-sm font-extrabold text-emerald-300"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                role="status"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                Solicitação recebida! Em breve entraremos em contato.
              </motion.p>
            ) : null}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
