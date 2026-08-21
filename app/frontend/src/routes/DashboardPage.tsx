import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, CheckCircle2, CircleDollarSign, Inbox } from 'lucide-react'

import { NewLeadDialog } from '@/components/kanban/NewLeadDialog'
import { Badge } from '@/components/ui/badge'
import { useLeadRealtime } from '@/hooks/useLeadRealtime'
import { leadsApi } from '@/lib/api'
import { formatLeadValue } from '@/lib/leadMeta'
import { queryKeys } from '@/lib/queryClient'

export function DashboardPage() {
  useLeadRealtime()

  const leadsQuery = useQuery({
    queryKey: queryKeys.leads,
    queryFn: leadsApi.list,
  })

  const leads = leadsQuery.data ?? []
  const wonLeads = leads.filter((lead) => lead.status === 'GANHO')
  const totalValue = leads.reduce(
    (sum, lead) => sum + Number(lead.valor_estimado ?? 0),
    0,
  )
  const messagesCount = leads.reduce(
    (sum, lead) => sum + lead.messages.length,
    0,
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="success">Dashboard</Badge>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">
            Operação em tempo real
          </h1>
        </div>
        <NewLeadDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Leads no pipeline"
          value={String(leads.length)}
          icon={ArrowUpRight}
        />
        <MetricCard
          label="Receita estimada"
          value={formatLeadValue(String(totalValue))}
          icon={CircleDollarSign}
        />
        <MetricCard
          label="Conversas recebidas"
          value={String(messagesCount)}
          icon={Inbox}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-950">
            Últimos ganhos
          </h2>
          <Badge variant="outline">{wonLeads.length}</Badge>
        </div>

        <div className="space-y-3">
          {wonLeads.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum lead ganho ainda.</p>
          ) : (
            wonLeads.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between gap-4 rounded-md border border-slate-200 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {lead.nome}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {lead.email ?? lead.telefone ?? 'Contato pendente'}
                  </p>
                </div>
                <CheckCircle2
                  className="size-5 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof ArrowUpRight
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="grid size-9 place-items-center rounded-md bg-emerald-50 text-emerald-700">
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}
