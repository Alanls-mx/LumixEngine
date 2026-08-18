import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Send } from 'lucide-react';
import { captureLead } from '../services/api';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const maxPhoneDigits = 11;

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function formatPhone(value: string) {
  const digits = normalizePhone(value).slice(0, maxPhoneDigits);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidEmail(value: string) {
  const email = value.trim().toLowerCase();

  return email.length <= 160 && emailPattern.test(email) && !email.includes('..');
}

function isValidPhone(value: string) {
  const digits = normalizePhone(value);

  return digits.length >= 10 && digits.length <= maxPhoneDigits && !/^(\d)\1+$/.test(digits);
}

export function LeadCapture() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(email) || !isValidPhone(phone)) {
      setErrorMessage('Informe um e-mail válido e um telefone/WhatsApp com DDD.');
      return;
    }

    setIsSubmitting(true);
    setIsSubmitted(false);
    setErrorMessage(null);

    try {
      await captureLead({
        email,
        phone: normalizePhone(phone),
        source: 'lead_capture_section',
        companyWebsite,
      });

      setIsSubmitted(true);
      setEmail('');
      setPhone('');
      setCompanyWebsite('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar sua solicitação agora. Tente novamente em instantes.',
      );
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
        className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-slate-800 bg-panel p-6 shadow-soft md:p-8"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <h2 id="lead-capture-title" className="text-[clamp(1.5rem,6vw,2.25rem)] font-extrabold tracking-normal text-white md:text-4xl">
              Tem um processo que poderia funcionar melhor?
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
              Envie e-mail e WhatsApp com DDD. Analisamos o cenário e retornamos com uma proposta de site, sistema, automação ou integração adequada para a sua empresa.
            </p>
          </div>

          <div>
            <form className="grid gap-3" onSubmit={handleSubmit} autoComplete="off" noValidate>
              <div className="hidden" aria-hidden="true">
                <label htmlFor="lead-company-website">Site da empresa</label>
                <input
                  id="lead-company-website"
                  name="companyWebsite"
                  type="text"
                  tabIndex={-1}
                  value={companyWebsite}
                  onChange={(event) => setCompanyWebsite(event.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase text-slate-300" htmlFor="lead-email">
                    E-mail
                  </label>
                  <input
                    id="lead-email"
                    className="min-h-12 w-full rounded-lg border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/30 disabled:opacity-70"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setIsSubmitted(false);
                      setErrorMessage(null);
                    }}
                    placeholder="Seu melhor e-mail"
                    autoComplete="off"
                    aria-invalid={Boolean(errorMessage && !isValidEmail(email))}
                    aria-describedby={errorMessage ? 'lead-capture-error' : undefined}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase text-slate-300" htmlFor="lead-phone">
                    WhatsApp com DDD
                  </label>
                  <input
                    id="lead-phone"
                    className="min-h-12 w-full rounded-lg border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/30 disabled:opacity-70"
                    type="tel"
                    value={phone}
                    onChange={(event) => {
                      setPhone(formatPhone(event.target.value));
                      setIsSubmitted(false);
                      setErrorMessage(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key.length === 1 && !/\d/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    placeholder="WhatsApp com DDD"
                    autoComplete="off"
                    inputMode="numeric"
                    maxLength={15}
                    aria-invalid={Boolean(errorMessage && !isValidPhone(phone))}
                    aria-describedby={errorMessage ? 'lead-capture-error' : undefined}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <button
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-emerald-500 px-6 text-sm font-extrabold text-emerald-950 shadow-[0_18px_60px_rgba(16,185,129,0.22)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-[0_22px_70px_rgba(16,185,129,0.30)] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-night disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Solicitar Proposta'}
                <Send className="ml-2 h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            {errorMessage ? (
              <motion.p
                id="lead-capture-error"
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
