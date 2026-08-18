import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, ClipboardList, MessageSquareText, PanelsTopLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { servicesContent, type ServiceCard } from '../constants/content';

const icons: Record<ServiceCard['icon'], LucideIcon> = {
  site: PanelsTopLeft,
  automation: MessageSquareText,
  crm: ClipboardList,
};

const iconToneClasses: Record<ServiceCard['icon'], string> = {
  site: 'text-sky-300',
  automation: 'text-emerald-200',
  crm: 'text-emerald-300',
};

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.08, duration: 0.45, ease: 'easeOut' },
  }),
};

export function Solucoes() {
  return (
    <section
      id="solucoes"
      className="bg-[#0B101B] px-3 py-12 min-[360px]:px-5 md:px-8 md:py-16"
      aria-labelledby="solucoes-title"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="solucoes-title"
            className="text-[clamp(1.875rem,7vw,3rem)] font-bold tracking-normal text-white md:text-5xl"
          >
            {servicesContent.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">{servicesContent.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {servicesContent.items.map((service, index) => (
            <ServiceItem service={service} index={index} key={service.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

type ServiceItemProps = {
  service: ServiceCard;
  index: number;
};

function ServiceItem({ service, index }: ServiceItemProps) {
  const Icon = icons[service.icon];
  const isFeatured = Boolean(service.featured);
  const borderClasses = [
    index > 0 ? 'border-t border-slate-800 pt-10' : '',
    index % 2 === 1 ? 'md:border-l md:border-t-0 md:pl-10 md:pt-0' : '',
    index > 1 && index % 2 === 0 ? 'md:border-t md:border-l-0 md:pt-10 md:pl-0' : '',
    index > 0 ? 'lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.article
      className={[
        'relative min-w-0 transition-all duration-300 hover:-translate-y-1',
        borderClasses,
      ].join(' ')}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={cardVariants}
    >
      {service.badge ? (
        <div className="mb-4 text-xs font-extrabold uppercase tracking-wide text-emerald-300">
          {service.badge}
        </div>
      ) : null}

      <div className={`mb-6 inline-flex ${iconToneClasses[service.icon]}`}>
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>

      <h3 className={isFeatured ? 'max-w-[14rem] text-2xl font-extrabold text-white' : 'text-2xl font-extrabold text-white'}>
        {service.title}
      </h3>
      <p className={isFeatured ? 'mt-4 leading-7 text-slate-200' : 'mt-4 leading-7 text-slate-400'}>
        {service.description}
      </p>

      <ul className={isFeatured ? 'mt-6 space-y-3 text-sm font-semibold text-slate-100' : 'mt-6 space-y-3 text-sm font-semibold text-slate-300'}>
        {service.bullets.map((bullet) => (
          <li className="flex gap-2" key={bullet}>
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </motion.article>
  );
}
