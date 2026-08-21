import type { LeadStatus } from '@/types/lead'

export const leadColumns: Array<{
  id: LeadStatus
  title: string
  shortTitle: string
  tone: string
}> = [
  {
    id: 'NOVO_LEAD',
    title: 'Novo Lead',
    shortTitle: 'Novo',
    tone: 'border-cyan-200 bg-cyan-50 text-cyan-800',
  },
  {
    id: 'NEGOCIACAO',
    title: 'Negociação',
    shortTitle: 'Negociação',
    tone: 'border-blue-200 bg-blue-50 text-blue-800',
  },
  {
    id: 'PROPOSTA',
    title: 'Proposta',
    shortTitle: 'Proposta',
    tone: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  {
    id: 'GANHO',
    title: 'Ganho',
    shortTitle: 'Ganho',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  {
    id: 'PERDIDO',
    title: 'Perdido',
    shortTitle: 'Perdido',
    tone: 'border-rose-200 bg-rose-50 text-rose-800',
  },
]

export const leadColumnById = Object.fromEntries(
  leadColumns.map((column) => [column.id, column]),
) as Record<LeadStatus, (typeof leadColumns)[number]>

export function formatLeadValue(value: string | null) {
  if (!value) {
    return 'Sem valor'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(Number(value))
}
