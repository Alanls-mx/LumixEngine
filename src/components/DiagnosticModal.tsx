import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ClipboardList, MessageCircle, Send, X } from 'lucide-react';
import { whatsappLinks } from '../constants/content';
import { formatPhone, isTextFilled, isValidEmail, isValidPhone, toBrazilianE164 } from '../lib/leadForm';
import { getLeadWebhookErrorMessage, submitLeadWebhook } from '../services/leadWebhook';
import { trackEvent } from '../lib/tracking';

type DiagnosticModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SolutionOption =
  | 'Automação Comercial'
  | 'Sistemas Sob Medida'
  | 'Integração de APIs'
  | 'Painel/Dashboard Interno'
  | 'Outro'
  | '';

type InvestmentOption = '' | '5000' | '10000' | '20000' | '35000';

type BudgetFormState = {
  fullName: string;
  email: string;
  phone: string;
  solution: SolutionOption;
  investment: InvestmentOption;
  projectDescription: string;
};

const initialFormState: BudgetFormState = {
  fullName: '',
  email: '',
  phone: '',
  solution: '',
  investment: '',
  projectDescription: '',
};

const solutionOptions: readonly Exclude<SolutionOption, ''>[] = [
  'Automação Comercial',
  'Sistemas Sob Medida',
  'Integração de APIs',
  'Painel/Dashboard Interno',
  'Outro',
];

const investmentOptions = [
  { label: 'Até R$ 5.000', value: '5000' },
  { label: 'R$ 5.000 a R$ 15.000', value: '10000' },
  { label: 'R$ 15.000 a R$ 30.000', value: '20000' },
  { label: 'Acima de R$ 30.000', value: '35000' },
] satisfies readonly { label: string; value: Exclude<InvestmentOption, ''> }[];

export function DiagnosticModal({ isOpen, onClose }: DiagnosticModalProps) {
  const [formState, setFormState] = useState<BudgetFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const updateField = <Key extends keyof BudgetFormState>(field: Key, value: BudgetFormState[Key]) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  const resetForm = () => {
    setFormState(initialFormState);
    setErrorMessage(null);
    setIsSubmitted(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = formState.fullName.trim();
    const email = formState.email.trim().toLowerCase();
    const projectDescription = formState.projectDescription.trim();

    if (!isTextFilled(fullName, 3)) {
      setErrorMessage('Informe seu nome completo para solicitarmos o orçamento.');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }

    if (!isValidPhone(formState.phone)) {
      setErrorMessage('Informe um telefone/WhatsApp com DDD. Exemplo: (11) 99999-9999.');
      return;
    }

    if (!isTextFilled(projectDescription, 20)) {
      setErrorMessage('Descreva a necessidade do projeto com um pouco mais de detalhe.');
      return;
    }

    const selectedSolution = formState.solution || 'Solução não definida';
    const estimatedValue = formState.investment ? Number(formState.investment) : undefined;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitLeadWebhook({
        nome: fullName,
        email,
        telefone: toBrazilianE164(formState.phone),
        valor_estimado: estimatedValue,
        conteudo: `[${selectedSolution}] ${projectDescription}`,
        origem: 'SITE',
      });

      trackEvent('budget_form_submit', {
        solution: selectedSolution,
        estimated_value: estimatedValue ?? 0,
      });

      setIsSubmitted(true);
      setFormState(initialFormState);
    } catch (error) {
      setErrorMessage(getLeadWebhookErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto overflow-touch bg-black/70 px-3 py-6 pb-safe backdrop-blur-md min-[360px]:px-4"
          aria-labelledby="budget-modal-title"
          aria-modal="true"
          role="dialog"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClose();
            }
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <motion.div
            className="relative w-full max-w-3xl overflow-hidden rounded-xl border border-slate-800 bg-panel/95 shadow-[0_26px_90px_rgba(0,0,0,0.48)]"
            initial={{ opacity: 0, scale: 0.96, y: 18, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, y: 16, filter: 'blur(8px)' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />

            <button
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              aria-label="Fechar formulário de orçamento"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="p-4 min-[360px]:p-6 sm:p-8">
              <div className="flex items-start gap-4 pr-12">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-emerald-950 shadow-[0_18px_60px_rgba(16,185,129,0.22)]">
                  <ClipboardList className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="budget-modal-title" className="text-[clamp(1.5rem,7vw,1.875rem)] font-extrabold tracking-normal text-white sm:text-3xl">
                    Solicitar orçamento
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                    Conte o que precisa construir ou melhorar. Enviamos os dados direto para o LumixEngine App e retornamos com um próximo passo claro.
                  </p>
                  <a
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-100 transition hover:border-emerald-400/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    href={whatsappLinks.budget}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Conversar direto no WhatsApp
                    <MessageCircle className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <form className="mt-8 grid gap-5" onSubmit={handleSubmit} autoComplete="off" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-200">Nome completo</span>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-800 bg-night/70 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25 disabled:opacity-70"
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
                    <span className="text-sm font-bold text-slate-200">E-mail</span>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-800 bg-night/70 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25 disabled:opacity-70"
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
                  <span className="text-sm font-bold text-slate-200">Telefone / WhatsApp</span>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-800 bg-night/70 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25 disabled:opacity-70"
                    type="tel"
                    inputMode="numeric"
                    maxLength={15}
                    value={formState.phone}
                    onChange={(event) => updateField('phone', formatPhone(event.target.value))}
                    onKeyDown={(event) => {
                      if (event.key.length === 1 && !/\d/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    placeholder="(11) 99999-9999"
                    autoComplete="off"
                    disabled={isSubmitting}
                    required
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-200">Qual solução você precisa?</span>
                    <select
                      className="mt-2 w-full rounded-lg border border-slate-800 bg-night/70 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25 disabled:opacity-70"
                      value={formState.solution}
                      onChange={(event) => updateField('solution', event.target.value as SolutionOption)}
                      autoComplete="off"
                      disabled={isSubmitting}
                    >
                      <option value="">Selecione se souber</option>
                      {solutionOptions.map((solution) => (
                        <option value={solution} key={solution}>
                          {solution}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold text-slate-200">Faixa de investimento estimada</span>
                    <select
                      className="mt-2 w-full rounded-lg border border-slate-800 bg-night/70 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25 disabled:opacity-70"
                      value={formState.investment}
                      onChange={(event) => updateField('investment', event.target.value as InvestmentOption)}
                      autoComplete="off"
                      disabled={isSubmitting}
                    >
                      <option value="">Prefiro conversar</option>
                      {investmentOptions.map((option) => (
                        <option value={option.value} key={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-bold text-slate-200">Fale sobre seu projeto / necessidade</span>
                  <textarea
                    className="mt-2 min-h-32 w-full resize-none rounded-lg border border-slate-800 bg-night/70 px-4 py-3 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25 disabled:opacity-70"
                    value={formState.projectDescription}
                    onChange={(event) => updateField('projectDescription', event.target.value)}
                    placeholder="Ex: preciso de uma loja virtual integrada ao estoque e com pagamento Pix."
                    autoComplete="off"
                    disabled={isSubmitting}
                    required
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <button
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-4 text-sm font-extrabold text-emerald-950 shadow-[0_18px_60px_rgba(16,185,129,0.22)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-[0_22px_70px_rgba(16,185,129,0.30)] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-panel disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando orçamento...' : 'Enviar Solicitação'}
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </button>

                  {isSubmitted ? (
                    <button
                      className="rounded-lg border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                      type="button"
                      onClick={resetForm}
                    >
                      Enviar outro
                    </button>
                  ) : null}
                </div>
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
                  Solicitação enviada! Vamos analisar o projeto e retornar em breve.
                </motion.p>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
