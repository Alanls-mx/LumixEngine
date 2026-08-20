import type { LucideIcon } from 'lucide-react';
import { Github, Instagram, Linkedin } from 'lucide-react';
import wordMarkLogo from '../../WordMark.png';
import { openCookieSettings } from '../lib/cookieSettings';

type SocialLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const socialLinks = [
  {
    label: 'Instagram da LumixEngine',
    href: 'https://www.instagram.com/lumixengine',
    icon: Instagram,
  },
  {
    label: 'LinkedIn da LumixEngine',
    href: 'https://www.linkedin.com/company/lumixengine',
    icon: Linkedin,
  },
  {
    label: 'GitHub da LumixEngine',
    href: 'https://github.com/lumixengine',
    icon: Github,
  },
] satisfies readonly SocialLink[];

export function Footer() {
  return (
    <footer className="border-t border-borderline bg-night px-3 py-8 pb-safe min-[360px]:px-5 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
        <a href="/" className="opacity-80 transition-opacity hover:opacity-100" aria-label="LumixEngine início">
          <img
            src={wordMarkLogo}
            alt="LumixEngine"
            className="h-9 w-auto object-contain"
            loading="lazy"
            decoding="async"
          />
        </a>

        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          Sites, lojas virtuais, sistemas web, automações e integrações sob medida para negócios locais.
        </p>

        <div className="flex flex-col items-center gap-3 md:items-end">
          <p className="text-sm font-semibold text-slate-500">© 2026 LumixEngine.</p>
          <nav className="flex items-center gap-2" aria-label="Redes sociais">
            {socialLinks.map((socialLink) => {
              const Icon = socialLink.icon;

              return (
                <a
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-white/5 text-emerald-100/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-white/[0.07] hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-night"
                  href={socialLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={socialLink.label}
                  key={socialLink.label}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              );
            })}
          </nav>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-bold text-slate-500" aria-label="Links legais">
            <a className="transition hover:text-emerald-200" href="/termos-de-uso">
              Termos de Uso
            </a>
            <a className="transition hover:text-emerald-200" href="/politica-de-privacidade">
              Política de Privacidade
            </a>
            <button className="transition hover:text-emerald-200" type="button" onClick={openCookieSettings}>
              Configurações de Cookies
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
