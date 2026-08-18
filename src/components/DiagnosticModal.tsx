import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, MessageCircle, Send, X } from 'lucide-react';
import { resolveApiUrl } from '../lib/apiBaseUrl';
import { trackEvent } from '../lib/tracking';

type DiagnosticModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Segment = 'Clínica' | 'Restaurante' | 'Marmoraria' | 'Imobiliária' | 'Outro';
type MessageVolume = 'Até 20' | '20 a 50' | 'Mais de 50';

type DiagnosticFormState = {
  fullName: string;
  companyName: string;
  segment: Segment;
  messageVolume: MessageVolume;
  whatsapp: string;
};

const segments: readonly Segment[] = ['Clínica', 'Restaurante', 'Marmoraria', 'Imobiliária', 'Outro'];
const messageVolumes: readonly MessageVolume[] = ['Até 20', '20 a 50', 'Mais de 50'];

const initialFormState: DiagnosticFormState = {
  fullName: '',
  companyName: '',
  segment: 'Clínica',
  messageVolume: 'Até 20',
  whatsapp: '',
};

export function DiagnosticModal({ isOpen, onClose }: DiagnosticModalProps) {
  const [formState, setFormState] = useState<DiagnosticFormState>(initialFormState);

  const whatsappUrl = useMemo(() => {
    const message = [
      'Olá, LumixEngine! Quero solicitar uma proposta para uma solução digital sob medida.',
      '',
      `Nome: ${formState.fullName}`,
      `Empresa: ${formState.companyName}`,
      `Segmento: ${formState.segment}`,
      `Volume aproximado de contatos por dia: ${formState.messageVolume}`,
      `WhatsApp para contato: ${formState.whatsapp}`,
      '',
      'Quero entender qual estrutura faz sentido para minha operação: site, loja, sistema, automação ou integração.',
    ].join('\n');

    return resolveApiUrl(`/api/whatsapp/diagnostic?text=${encodeURIComponent(message)}`);
  }, [formState]);

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

  const updateField = <Key extends keyof DiagnosticFormState>(field: Key, value: DiagnosticFormState[Key]) => {
    setFormState((currentFormState) => ({
      ...currentFormState,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    trackEvent('diagnostic_submit_whatsapp', {
      segment: formState.segment,
      message_volume: formState.messageVolume,
    });

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto overflow-touch bg-black/70 px-3 py-6 pb-safe backdrop-blur-md min-[360px]:px-4"
          aria-labelledby="diagnostic-modal-title"
          aria-modal="true"
          role="dialog"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <motion.div
            className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-slate-800 bg-panel/95 shadow-[0_26px_90px_rgba(0,0,0,0.48)]"
            initial={{ opacity: 0, scale: 0.96, y: 18, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, y: 16, filter: 'blur(8px)' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />

            <button
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              type="button"
              aria-label="Fechar diagnóstico"
              onClick={onClose}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="p-4 min-[360px]:p-6 sm:p-8">
              <div className="flex items-start gap-4 pr-12">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-emerald-950 shadow-violet">
                  <MessageCircle className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="diagnostic-modal-title" className="text-[clamp(1.5rem,7vw,1.875rem)] font-extrabold tracking-normal text-white sm:text-3xl">
                    Proposta prática para a sua operação
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                    Conte como sua empresa funciona hoje. Abrimos o WhatsApp com um resumo pronto para análise do projeto.
                  </p>
                </div>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-200">Nome completo</span>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-800 bg-night/70 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25"
                      type="text"
                      value={formState.fullName}
                      onChange={(event) => updateField('fullName', event.target.value)}
                      placeholder="Seu nome"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold text-slate-200">Nome da empresa</span>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-800 bg-night/70 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25"
                      type="text"
                      value={formState.companyName}
                      onChange={(event) => updateField('companyName', event.target.value)}
                      placeholder="Ex: Clínica Ana"
                      required
                    />
                  </label>
                </div>

                <fieldset>
                  <legend className="text-sm font-bold text-slate-200">Qual o seu segmento/nicho?</legend>
                  <div className="mt-3 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:grid-cols-5">
                    {segments.map((segment) => (
                      <button
                        className={[
                          'rounded-lg border px-3 py-2 text-xs font-extrabold transition focus:outline-none focus:ring-2 focus:ring-emerald-400/60',
                          formState.segment === segment
                            ? 'border-emerald-500 bg-emerald-500 text-emerald-950 shadow-violet'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10',
                        ].join(' ')}
                        type="button"
                        onClick={() => updateField('segment', segment)}
                        key={segment}
                      >
                        {segment}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-bold text-slate-200">
                    Volume aproximado de contatos ou solicitações por dia
                  </legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {messageVolumes.map((volume) => (
                      <button
                        className={[
                          'inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-extrabold transition focus:outline-none focus:ring-2 focus:ring-emerald-400/60',
                          formState.messageVolume === volume
                            ? 'border-emerald-300/50 bg-emerald-400/10 text-emerald-200'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10',
                        ].join(' ')}
                        type="button"
                        onClick={() => updateField('messageVolume', volume)}
                        key={volume}
                      >
                        {formState.messageVolume === volume ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : null}
                        {volume}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="block">
                  <span className="text-sm font-bold text-slate-200">WhatsApp para contato com DDD</span>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-800 bg-night/70 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25"
                    type="tel"
                    inputMode="tel"
                    value={formState.whatsapp}
                    onChange={(event) => updateField('whatsapp', event.target.value)}
                    placeholder="Ex: (11) 99999-9999"
                    required
                  />
                </label>

                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-4 text-sm font-extrabold text-emerald-950 shadow-violet transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-[0_22px_70px_rgba(16,185,129,0.30)] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-panel"
                  type="submit"
                >
                  Solicitar Proposta
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
