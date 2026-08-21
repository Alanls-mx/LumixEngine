import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bot,
  CheckCheck,
  CircleAlert,
  Clock3,
  MessageCircle,
  Send,
  Smile,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLeadRealtime } from '@/hooks/useLeadRealtime'
import { leadsApi, messagesApi, usersApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { queryKeys } from '@/lib/queryClient'
import type { Lead, Message, User } from '@/types/lead'

const quickReplies = [
  'Olá! Aqui é a equipe LumixEngine. Como podemos ajudar?',
  'Recebemos sua mensagem e já estamos analisando sua solicitação.',
  'Podemos agendar uma conversa rápida para entender melhor sua necessidade?',
  'Vou te enviar mais detalhes sobre a proposta em instantes.',
]

const emojiOptions = ['🙂', '👍', '✅', '🚀', '🙏']

export function InboxPage() {
  useLeadRealtime()

  const queryClient = useQueryClient()
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')

  const leadsQuery = useQuery({
    queryKey: queryKeys.leads,
    queryFn: leadsApi.list,
  })

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  })

  const conversations = useMemo(() => {
    return (leadsQuery.data ?? [])
      .filter((lead) => lead.telefone || lead.messages.length > 0)
      .sort(
        (a, b) =>
          new Date(b.last_interaction_at ?? b.data_criacao).getTime() -
          new Date(a.last_interaction_at ?? a.data_criacao).getTime(),
      )
  }, [leadsQuery.data])

  useEffect(() => {
    if (!selectedLeadId && conversations[0]) {
      setSelectedLeadId(conversations[0].id)
    }
  }, [conversations, selectedLeadId])

  const selectedLead =
    conversations.find((lead) => lead.id === selectedLeadId) ??
    conversations[0] ??
    null

  const selectedMessages = useMemo(() => {
    return [...(selectedLead?.messages ?? [])].sort(
      (a, b) =>
        new Date(a.data_envio).getTime() - new Date(b.data_envio).getTime(),
    )
  }, [selectedLead])

  const sendMessage = useMutation({
    mutationFn: messagesApi.send,
    onSuccess: (response) => {
      setMessageText('')
      queryClient.setQueryData<Lead[]>(queryKeys.leads, (currentLeads = []) =>
        currentLeads.map((lead) =>
          lead.id === response.message.lead_id
            ? {
                ...lead,
                last_interaction_at: response.message.data_envio,
                messages: [response.message, ...lead.messages].sort(
                  (a, b) =>
                    new Date(b.data_envio).getTime() -
                    new Date(a.data_envio).getTime(),
                ),
              }
            : lead,
        ),
      )
      toast.success('Mensagem registrada', {
        description: response.delivery.skipped
          ? 'Gateway WhatsApp não configurado; envio externo ignorado.'
          : 'Mensagem enviada para o cliente.',
      })
    },
    onError: () => {
      toast.error('Não foi possível enviar a mensagem')
    },
  })

  const assignLead = useMutation({
    mutationFn: ({
      leadId,
      userId,
    }: {
      leadId: string
      userId: string | null
    }) =>
      leadsApi.assign(leadId, {
        assigned_to_id: userId,
      }),
    onSuccess: (updatedLead) => {
      queryClient.setQueryData<Lead[]>(queryKeys.leads, (currentLeads = []) =>
        currentLeads.map((lead) =>
          lead.id === updatedLead.id ? updatedLead : lead,
        ),
      )
      toast.success('Atendente atualizado')
    },
    onError: () => {
      toast.error('Não foi possível atribuir o atendimento')
    },
  })

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedLead || !messageText.trim()) {
      return
    }

    sendMessage.mutate({
      lead_id: selectedLead.id,
      conteudo: messageText.trim(),
      ...(selectedLead.assigned_to_id
        ? {
            user_id: selectedLead.assigned_to_id,
          }
        : {}),
    })
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="success">Inbox</Badge>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">
            Central de atendimento
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Conversas WhatsApp, atribuição de equipe e respostas rápidas.
          </p>
        </div>
        <Badge variant="outline">{conversations.length} conversas</Badge>
      </div>

      <div className="grid min-h-[720px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-slate-50/80 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">
                  Conversas ativas
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Ordenadas pela última interação
                </p>
              </div>
              <MessageCircle className="size-5 text-emerald-600" aria-hidden="true" />
            </div>
          </div>

          <div className="max-h-[660px] overflow-y-auto">
            {leadsQuery.isLoading && <ConversationSkeleton />}

            {leadsQuery.isError && (
              <div className="flex items-center gap-2 p-4 text-sm text-rose-700">
                <CircleAlert className="size-4" aria-hidden="true" />
                Não foi possível carregar conversas.
              </div>
            )}

            {leadsQuery.isSuccess && conversations.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">
                Nenhuma conversa ativa.
              </div>
            )}

            {conversations.map((lead) => (
              <ConversationItem
                key={lead.id}
                lead={lead}
                isActive={lead.id === selectedLead?.id}
                onClick={() => setSelectedLeadId(lead.id)}
              />
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col bg-[#eef4f0]">
          {selectedLead ? (
            <>
              <ChatHeader
                lead={selectedLead}
                users={usersQuery.data ?? []}
                isLoadingUsers={usersQuery.isLoading}
                onAssign={(userId) =>
                  assignLead.mutate({
                    leadId: selectedLead.id,
                    userId,
                  })
                }
                isAssigning={assignLead.isPending}
              />

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6">
                {selectedMessages.length === 0 ? (
                  <div className="grid h-full min-h-80 place-items-center text-center text-sm text-slate-500">
                    <div>
                      <Bot className="mx-auto mb-3 size-8 text-slate-400" aria-hidden="true" />
                      Nenhuma mensagem neste atendimento.
                    </div>
                  </div>
                ) : (
                  selectedMessages.map((message) => (
                    <ChatBubble key={message.id} message={message} />
                  ))
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="border-t border-slate-200 bg-white p-3 sm:p-4"
              >
                <div className="mb-3 flex flex-wrap gap-2">
                  <select
                    className="h-9 max-w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    defaultValue=""
                    aria-label="Inserir resposta rápida"
                    onChange={(event) => {
                      if (event.target.value) {
                        setMessageText(event.target.value)
                        event.target.value = ''
                      }
                    }}
                  >
                    <option value="">Respostas rápidas</option>
                    {quickReplies.map((reply) => (
                      <option key={reply} value={reply}>
                        {reply}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1">
                    <Smile className="size-4 text-slate-400" aria-hidden="true" />
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="grid size-8 place-items-center rounded-md text-sm transition hover:bg-slate-100"
                        onClick={() =>
                          setMessageText((currentText) => `${currentText}${emoji}`)
                        }
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    className="min-h-11 flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    placeholder="Digite uma resposta..."
                    rows={1}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={sendMessage.isPending || !messageText.trim()}
                    aria-label="Enviar mensagem"
                  >
                    <Send aria-hidden="true" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center text-sm text-slate-500">
              Selecione uma conversa para iniciar o atendimento.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ConversationItem({
  lead,
  isActive,
  onClick,
}: {
  lead: Lead
  isActive: boolean
  onClick: () => void
}) {
  const latestMessage = lead.messages[0]
  const pendingCount = lead.messages.filter(
    (message) => message.direcao === 'INBOUND',
  ).length

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'grid w-full grid-cols-[44px_minmax(0,1fr)] gap-3 border-b border-slate-200 p-4 text-left transition hover:bg-white',
        isActive && 'bg-white shadow-[inset_3px_0_0_#10b981]',
      )}
    >
      <div className="grid size-11 place-items-center rounded-full bg-slate-900 text-sm font-semibold text-white">
        {getInitials(lead.nome)}
      </div>

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-950">
            {lead.nome}
          </p>
          {pendingCount > 0 && (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">
              {pendingCount}
            </span>
          )}
        </div>

        <p className="mt-1 truncate text-xs text-slate-500">
          {latestMessage?.conteudo ?? 'Sem mensagens'}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="inline-flex min-w-0 items-center gap-1 text-xs text-slate-500">
            <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {lead.assigned_to?.nome ?? 'Sem atendente'}
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-400">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {formatTime(lead.last_interaction_at)}
          </span>
        </div>
      </div>
    </button>
  )
}

function ChatHeader({
  lead,
  users,
  isLoadingUsers,
  onAssign,
  isAssigning,
}: {
  lead: Lead
  users: User[]
  isLoadingUsers: boolean
  onAssign: (userId: string | null) => void
  isAssigning: boolean
}) {
  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
            {getInitials(lead.nome)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-slate-950">
              {lead.nome}
            </h2>
            <p className="truncate text-xs text-slate-500">
              {lead.telefone ?? lead.email ?? 'Contato sem identificação'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500" htmlFor="assignee">
            Atendente
          </label>
          <select
            id="assignee"
            value={lead.assigned_to_id ?? ''}
            disabled={isLoadingUsers || isAssigning}
            onChange={(event) => onAssign(event.target.value || null)}
            className="h-9 min-w-48 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">Sem atendente</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}

function ChatBubble({ message }: { message: Message }) {
  const isOutbound = message.direcao === 'OUTBOUND'

  return (
    <div className={cn('flex', isOutbound ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[78%] rounded-lg px-4 py-2 shadow-sm',
          isOutbound
            ? 'bg-[#d9fdd3] text-slate-900'
            : 'bg-white text-slate-900',
        )}
      >
        {message.user && (
          <p className="mb-1 text-[11px] font-semibold text-emerald-700">
            {message.user.nome}
          </p>
        )}
        <p className="whitespace-pre-wrap text-sm leading-6">{message.conteudo}</p>
        <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-slate-500">
          <span>{formatTime(message.data_envio)}</span>
          {isOutbound && (
            <CheckCheck
              className={cn(
                'size-3.5',
                message.status_envio === 'ERRO'
                  ? 'text-rose-500'
                  : message.status_envio === 'LIDO'
                    ? 'text-sky-500'
                    : 'text-slate-400',
              )}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </div>
  )
}

function ConversationSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <div className="h-20 animate-pulse rounded-lg bg-white" />
      <div className="h-20 animate-pulse rounded-lg bg-white" />
      <div className="h-20 animate-pulse rounded-lg bg-white" />
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
