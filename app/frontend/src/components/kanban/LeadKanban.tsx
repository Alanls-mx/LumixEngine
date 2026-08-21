import { useMemo, useState } from 'react'

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarClock,
  CircleAlert,
  Mail,
  Phone,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NewLeadDialog } from '@/components/kanban/NewLeadDialog'
import { useLeadRealtime } from '@/hooks/useLeadRealtime'
import { leadsApi } from '@/lib/api'
import { formatLeadValue, leadColumnById, leadColumns } from '@/lib/leadMeta'
import { cn } from '@/lib/utils'
import { queryKeys } from '@/lib/queryClient'
import type { Lead, LeadStatus } from '@/types/lead'

type LeadsByStatus = Record<LeadStatus, Lead[]>

function groupLeadsByStatus(leads: Lead[] = []) {
  return leadColumns.reduce<LeadsByStatus>(
    (groups, column) => {
      groups[column.id] = leads.filter((lead) => lead.status === column.id)
      return groups
    },
    {
      NOVO_LEAD: [],
      NEGOCIACAO: [],
      PROPOSTA: [],
      GANHO: [],
      PERDIDO: [],
    },
  )
}

export function LeadKanban() {
  useLeadRealtime()

  const queryClient = useQueryClient()
  const [activeLead, setActiveLead] = useState<Lead | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const leadsQuery = useQuery({
    queryKey: queryKeys.leads,
    queryFn: leadsApi.list,
  })

  const groupedLeads = useMemo(
    () => groupLeadsByStatus(leadsQuery.data),
    [leadsQuery.data],
  )

  const updateLeadStatus = useMutation({
    mutationFn: ({
      leadId,
      status,
    }: {
      leadId: string
      status: LeadStatus
    }) => leadsApi.update(leadId, { status }),

    onMutate: async ({ leadId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.leads })

      const previousLeads = queryClient.getQueryData<Lead[]>(queryKeys.leads)

      queryClient.setQueryData<Lead[]>(queryKeys.leads, (currentLeads = []) =>
        currentLeads.map((lead) =>
          lead.id === leadId ? { ...lead, status } : lead,
        ),
      )

      return { previousLeads }
    },

    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKeys.leads, context?.previousLeads)
    },

    onSuccess: (updatedLead) => {
      queryClient.setQueryData<Lead[]>(queryKeys.leads, (currentLeads = []) =>
        currentLeads.map((lead) =>
          lead.id === updatedLead.id ? updatedLead : lead,
        ),
      )
    },
  })

  const handleDragStart = (event: DragStartEvent) => {
    const lead = event.active.data.current?.lead as Lead | undefined
    setActiveLead(lead ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const lead = event.active.data.current?.lead as Lead | undefined
    const targetStatus = event.over?.id as LeadStatus | undefined

    setActiveLead(null)

    if (!lead || !targetStatus || lead.status === targetStatus) {
      return
    }

    updateLeadStatus.mutate({
      leadId: lead.id,
      status: targetStatus,
    })
  }

  const totalLeads = leadsQuery.data?.length ?? 0

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="success">CRM</Badge>
            <Badge variant="outline">{totalLeads} leads</Badge>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
              Pipeline comercial
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Leads ativos por etapa, sincronizados em tempo real.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void leadsQuery.refetch()}
            disabled={leadsQuery.isFetching}
          >
            <RefreshCw
              className={cn(leadsQuery.isFetching && 'animate-spin')}
              aria-hidden="true"
            />
            Atualizar
          </Button>
          <NewLeadDialog />
        </div>
      </div>

      {leadsQuery.isLoading && <KanbanLoading />}

      {leadsQuery.isError && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <CircleAlert className="size-5 shrink-0" aria-hidden="true" />
          <span>Não foi possível carregar os leads.</span>
        </div>
      )}

      {leadsQuery.isSuccess && (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveLead(null)}
        >
          <div className="grid min-h-[620px] grid-cols-[repeat(5,minmax(240px,1fr))] gap-4 overflow-x-auto pb-3">
            {leadColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                status={column.id}
                leads={groupedLeads[column.id]}
                isUpdating={updateLeadStatus.isPending}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeLead ? (
              <LeadCard lead={activeLead} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </section>
  )
}

function KanbanColumn({
  status,
  leads,
  isUpdating,
}: {
  status: LeadStatus
  leads: Lead[]
  isUpdating: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })
  const column = leadColumnById[status]

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[620px] min-w-60 flex-col rounded-lg border bg-slate-100/70 p-3 transition',
        isOver
          ? 'border-emerald-300 bg-emerald-50'
          : 'border-slate-200',
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div
            className={cn(
              'inline-flex rounded-md border px-2 py-1 text-xs font-semibold',
              column.tone,
            )}
          >
            {column.title}
          </div>
        </div>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-500 shadow-sm">
          {leads.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {leads.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70 p-4 text-center text-sm text-slate-400">
            Solte leads aqui
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} disabled={isUpdating} />
          ))
        )}
      </div>
    </div>
  )
}

function LeadCard({
  lead,
  disabled = false,
  isOverlay = false,
}: {
  lead: Lead
  disabled?: boolean
  isOverlay?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: lead.id,
      data: {
        lead,
      },
      disabled,
    })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const latestMessage = lead.messages[0]

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition',
        !disabled && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-30',
        isOverlay && 'w-64 rotate-1 shadow-xl',
      )}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-950">
            {lead.nome}
          </h3>
          <p className="mt-1 text-xs font-medium text-emerald-700">
            {formatLeadValue(lead.valor_estimado)}
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {leadColumnById[lead.status].shortTitle}
        </Badge>
      </div>

      <div className="mt-4 space-y-2 text-xs text-slate-500">
        {lead.email && (
          <div className="flex items-center gap-2">
            <Mail className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.telefone && (
          <div className="flex items-center gap-2">
            <Phone className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{lead.telefone}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{new Date(lead.data_criacao).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {latestMessage && (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {latestMessage.origem}
          </div>
          <p className="line-clamp-2 text-xs leading-5 text-slate-500">
            {latestMessage.conteudo}
          </p>
        </div>
      )}
    </article>
  )
}

function KanbanLoading() {
  return (
    <div className="grid min-h-[620px] grid-cols-[repeat(5,minmax(240px,1fr))] gap-4 overflow-hidden">
      {leadColumns.map((column) => (
        <div
          key={column.id}
          className="rounded-lg border border-slate-200 bg-slate-100/70 p-3"
        >
          <div className="mb-3 h-7 w-28 animate-pulse rounded-md bg-slate-200" />
          <div className="space-y-3">
            <div className="h-32 animate-pulse rounded-lg bg-white" />
            <div className="h-28 animate-pulse rounded-lg bg-white" />
          </div>
        </div>
      ))}
    </div>
  )
}
