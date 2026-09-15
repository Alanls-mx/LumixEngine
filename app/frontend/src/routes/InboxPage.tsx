import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Check,
  CheckCheck,
  ChevronDown,
  Copy,
  FileText,
  MessageCircle,
  MessageSquare,
  Mic,
  Paperclip,
  Reply,
  Search,
  Send,
  Smile,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLeadRealtime } from '@/hooks/useLeadRealtime'
import { leadsApi, messageTemplatesApi, messagesApi, usersApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { queryKeys } from '@/lib/queryClient'
import type { Lead, Message, MessageSuggestion } from '@/types/lead'

const emojiList = ['👍', '❤️', '😂', '😮', '😢', '🙏', '👏', '🚀', '✅', '🔥', '👋', '🤝']

type ReplyingMessage = {
  id: string
  senderName: string
  content: string
}

function parseQuotedMessage(text: string) {
  const match = text.match(/^>\s*([^:]+):\s*"([^"]+)"\n\n([\s\S]*)$/)
  if (match) {
    return {
      isQuoted: true,
      sender: match[1],
      quotedText: match[2],
      body: match[3],
    }
  }
  return {
    isQuoted: false,
    sender: '',
    quotedText: '',
    body: text,
  }
}

export function InboxPage() {
  useLeadRealtime()

  const queryClient = useQueryClient()
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [replyingTo, setReplyingTo] = useState<ReplyingMessage | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [suggestions, setSuggestions] = useState<MessageSuggestion[]>([])
  const [suggestionIntent, setSuggestionIntent] = useState<
    'boas_vindas' | 'qualificacao' | 'follow_up' | 'proposta' | 'recuperacao'
  >('follow_up')
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const leadsQuery = useQuery({
    queryKey: queryKeys.leads,
    queryFn: leadsApi.list,
  })

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  })

  const templatesQuery = useQuery({
    queryKey: ['message-templates'],
    queryFn: messageTemplatesApi.list,
  })

  const conversations = useMemo(() => {
    let list = (leadsQuery.data ?? []).filter(
      (lead) => lead.telefone || lead.messages.length > 0,
    )

    if (unreadOnly) {
      list = list.filter((lead) =>
        lead.messages.some(
          (m) => m.direcao === 'INBOUND' && m.status_envio !== 'LIDO',
        ),
      )
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase()
      list = list.filter(
        (lead) =>
          lead.nome.toLowerCase().includes(q) ||
          (lead.telefone && lead.telefone.includes(q)) ||
          lead.messages.some((m) => m.conteudo.toLowerCase().includes(q)),
      )
    }

    return list.sort(
      (a, b) =>
        new Date(b.last_interaction_at ?? b.data_criacao).getTime() -
        new Date(a.last_interaction_at ?? a.data_criacao).getTime(),
    )
  }, [leadsQuery.data, searchFilter, unreadOnly])

  useEffect(() => {
    if (!selectedLeadId && conversations[0]) {
      setSelectedLeadId(conversations[0].id)
    }
  }, [conversations, selectedLeadId])

  const selectedLead =
    conversations.find((lead) => lead.id === selectedLeadId) ??
    (searchFilter || unreadOnly ? null : conversations[0]) ??
    null

  const selectedMessages = useMemo(() => {
    return [...(selectedLead?.messages ?? [])].sort(
      (a, b) =>
        new Date(a.data_envio).getTime() - new Date(b.data_envio).getTime(),
    )
  }, [selectedLead])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedMessages.length, selectedLeadId])

  // Auto focus input when replying
  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus()
    }
  }, [replyingTo])

  const sendMessage = useMutation({
    mutationFn: messagesApi.send,
    onSuccess: (response) => {
      setMessageText('')
      setReplyingTo(null)
      setSuggestions([])
      queryClient.setQueryData<Lead[]>(queryKeys.leads, (currentLeads = []) =>
        currentLeads.map((lead) =>
          lead.id === response.message.lead_id
            ? {
                ...lead,
                last_interaction_at: response.message.data_envio,
                messages: upsertLocalMessage(lead.messages, response.message),
              }
            : lead,
        ),
      )

      if (response.deliveries?.whatsapp) {
        const wa = response.deliveries.whatsapp
        if (wa.skipped) {
          toast.warning('Atenção: Gateway WhatsApp não configurado', {
            description:
              'Acesse Configurações > WhatsApp Gateway para cadastrar a URL e Token da Evolution API.',
          })
          return
        }
        if (!wa.ok) {
          toast.error('Falha no envio da mensagem pelo WhatsApp', {
            description: wa.reason || 'Verifique a conexão com a Evolution API.',
          })
          return
        }
      }

      toast.success('Mensagem enviada com sucesso!')
    },
    onError: () => {
      toast.error('Não foi possível enviar a mensagem')
    },
  })

  const generateSuggestions = useMutation({
    mutationFn: messagesApi.suggest,
    onSuccess: (response) => {
      setSuggestions(response.suggestions)
      setShowAiModal(true)
      toast.success('Sugestões da IA geradas')
    },
    onError: () => {
      toast.error('Não foi possível gerar sugestões')
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
      toast.success('Atendente atribuído com sucesso')
    },
    onError: () => {
      toast.error('Não foi possível atribuir o atendimento')
    },
  })

  const handleSendMessage = (e?: FormEvent) => {
    if (e) e.preventDefault()

    if (!selectedLead || !messageText.trim()) {
      return
    }

    if (sendMessage.isPending) {
      return
    }

    let finalContent = messageText.trim()
    if (replyingTo) {
      const cleanSnippet = replyingTo.content.replace(/[\r\n]+/g, ' ').slice(0, 100)
      finalContent = `> ${replyingTo.senderName}: "${cleanSnippet}"\n\n${finalContent}`
    }

    sendMessage.mutate({
      lead_id: selectedLead.id,
      conteudo: finalContent,
      client_request_id: crypto.randomUUID(),
      reply_to_message_id: replyingTo?.id,
      ...(selectedLead.assigned_to_id
        ? {
            user_id: selectedLead.assigned_to_id,
          }
        : {}),
      channels: ['WHATSAPP'],
    })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleReplyToMessage = (message: Message) => {
    const isOutbound = message.direcao === 'OUTBOUND'
    const senderName = isOutbound
      ? message.user?.nome ?? 'Você'
      : selectedLead?.nome ?? 'Contato'

    const parsed = parseQuotedMessage(message.conteudo)
    setReplyingTo({
      id: message.id,
      senderName,
      content: parsed.body,
    })
    setActiveMenuMessageId(null)
  }

  const handleCopyMessage = (content: string) => {
    const parsed = parseQuotedMessage(content)
    navigator.clipboard.writeText(parsed.body)
    toast.success('Mensagem copiada!')
    setActiveMenuMessageId(null)
  }

  return (
    <div className="flex h-[calc(100vh-6.5rem)] min-h-[640px] flex-col overflow-hidden rounded-xl border border-slate-300 bg-[#efeae2] shadow-xl">
      {/* WhatsApp Web Main Grid */}
      <div className="grid h-full min-h-0 w-full grid-cols-1 overflow-hidden lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* LEFT COLUMN: WhatsApp Web Conversations Sidebar */}
        <aside className="flex h-full min-h-0 flex-col border-r border-[#d1d7db] bg-white">
          {/* WhatsApp Web Left Top Header */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#e9edef] bg-[#f0f2f5] px-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[#00a884] text-sm font-semibold text-white shadow-sm">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#111b21]">WhatsApp Web</span>
                <p className="text-[11px] text-[#667781]">Inbox em tempo real</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[#54656f]">
              <button
                type="button"
                onClick={() => setUnreadOnly(!unreadOnly)}
                title={unreadOnly ? 'Mostrar todas' : 'Filtrar não lidas'}
                className={cn(
                  'grid size-9 place-items-center rounded-full transition hover:bg-[#e9edef]',
                  unreadOnly && 'bg-[#00a884]/15 text-[#00a884]',
                )}
              >
                <Badge
                  variant={unreadOnly ? 'success' : 'outline'}
                  className="px-2 text-[10px]"
                >
                  {unreadOnly ? 'Não lidas' : 'Todas'}
                </Badge>
              </button>
            </div>
          </div>

          {/* WhatsApp Web Search & Filter Bar */}
          <div className="border-b border-[#f0f2f5] bg-[#ffffff] p-2">
            <div className="flex items-center rounded-lg bg-[#f0f2f5] px-3 py-1.5 focus-within:bg-white focus-within:shadow-sm focus-within:ring-1 focus-within:ring-[#00a884]">
              <Search className="mr-3 size-4 shrink-0 text-[#54656f]" />
              <input
                type="text"
                placeholder="Pesquisar ou começar uma nova conversa"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-transparent text-xs text-[#111b21] outline-none placeholder:text-[#8696a0]"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="text-[#8696a0] hover:text-[#111b21]"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto">
            {leadsQuery.isLoading && (
              <div className="space-y-2 p-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex h-16 animate-pulse items-center gap-3 rounded-lg px-3">
                    <div className="size-12 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 rounded bg-slate-200" />
                      <div className="h-2 w-2/3 rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {leadsQuery.isSuccess && conversations.length === 0 && (
              <div className="p-8 text-center text-xs text-[#667781]">
                Nenhuma conversa encontrada.
              </div>
            )}

            {conversations.map((lead) => {
              const isSelected = lead.id === selectedLead?.id
              const lastMsg = lead.messages[lead.messages.length - 1]
              const parsedLastMsg = lastMsg ? parseQuotedMessage(lastMsg.conteudo) : null
              const unreadCount = lead.messages.filter(
                (m) => m.direcao === 'INBOUND' && m.status_envio !== 'LIDO',
              ).length

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={cn(
                    'group relative flex cursor-pointer items-center gap-3 px-3 py-3 transition hover:bg-[#f5f6f6]',
                    isSelected && 'bg-[#f0f2f5]',
                  )}
                >
                  {/* WhatsApp Contact Avatar */}
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#dfe5e7] text-base font-semibold text-[#54656f]">
                    {getInitials(lead.nome)}
                  </div>

                  {/* Contact Info and Message Snippet */}
                  <div className="min-w-0 flex-1 border-b border-[#f0f2f5] pb-3 group-hover:border-transparent">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate text-sm font-medium text-[#111b21]">
                        {lead.nome}
                      </h3>
                      <span
                        className={cn(
                          'shrink-0 text-[11px] text-[#667781]',
                          unreadCount > 0 && 'font-semibold text-[#25d366]',
                        )}
                      >
                        {formatWhatsAppTime(lead.last_interaction_at ?? lead.data_criacao)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-1">
                      <div className="flex min-w-0 items-center gap-1 text-xs text-[#667781]">
                        {lastMsg?.direcao === 'OUTBOUND' && (
                          <CheckCheck
                            className={cn(
                              'size-3.5 shrink-0',
                              lastMsg.status_envio === 'LIDO'
                                ? 'text-[#53bdeb]'
                                : 'text-[#8696a0]',
                            )}
                          />
                        )}
                        <p className="truncate">
                          {parsedLastMsg?.body ?? 'Sem mensagens'}
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#25d366] text-[10px] font-bold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* RIGHT COLUMN: WhatsApp Web Chat Window */}
        <main className="flex h-full min-h-0 flex-col bg-[#efeae2]">
          {selectedLead ? (
            <>
              {/* WhatsApp Web Chat Header */}
              <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#d1d7db] bg-[#f0f2f5] px-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#dfe5e7] text-sm font-semibold text-[#54656f]">
                    {getInitials(selectedLead.nome)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-[15px] font-medium text-[#111b21]">
                      {selectedLead.nome}
                    </h2>
                    <p className="truncate text-xs text-[#667781]">
                      {selectedLead.telefone
                        ? formatPhoneDisplay(selectedLead.telefone)
                        : 'WhatsApp'}
                      {' · '}
                      <span className="text-[#00a884] font-medium">online</span>
                    </p>
                  </div>
                </div>

                {/* Header Actions (Assignee & Tools) */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg border border-[#d1d7db] bg-white px-2.5 py-1 text-xs text-[#54656f] shadow-sm">
                    <UserRound className="size-3.5 text-[#00a884]" />
                    <select
                      value={selectedLead.assigned_to_id ?? ''}
                      onChange={(e) =>
                        assignLead.mutate({
                          leadId: selectedLead.id,
                          userId: e.target.value || null,
                        })
                      }
                      disabled={usersQuery.isLoading || assignLead.isPending}
                      className="bg-transparent text-xs font-medium text-[#111b21] outline-none"
                    >
                      <option value="">Sem atendente</option>
                      {(usersQuery.data ?? []).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAiModal(true)}
                    className="grid size-9 place-items-center rounded-full text-[#54656f] transition hover:bg-[#e9edef] hover:text-[#00a884]"
                    title="Assistente de IA"
                  >
                    <Sparkles className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTemplatesModal(true)}
                    className="grid size-9 place-items-center rounded-full text-[#54656f] transition hover:bg-[#e9edef] hover:text-[#00a884]"
                    title="Templates Rápidos"
                  >
                    <FileText className="size-4" />
                  </button>
                </div>
              </header>

              {/* WhatsApp Web Chat Messages Area with Authentic Background */}
              <div
                className="relative flex-1 overflow-y-auto px-4 py-4 sm:px-12"
                style={{
                  backgroundColor: '#efeae2',
                  backgroundImage: `radial-gradient(#d3cbbe 0.75px, transparent 0.75px), radial-gradient(#d3cbbe 0.75px, #efeae2 0.75px)`,
                  backgroundSize: '28px 28px',
                  backgroundPosition: '0 0, 14px 14px',
                }}
                onClick={() => setActiveMenuMessageId(null)}
              >
                {/* Date separator */}
                <div className="my-3 flex justify-center">
                  <span className="rounded-md bg-white px-3 py-1 text-[11px] font-medium text-[#54656f] shadow-sm uppercase tracking-wide">
                    Hoje
                  </span>
                </div>

                {selectedMessages.length === 0 ? (
                  <div className="grid h-64 place-items-center text-center text-xs text-[#54656f]">
                    <div className="rounded-xl bg-white/90 p-6 shadow-sm">
                      <MessageCircle className="mx-auto mb-2 size-8 text-[#00a884]" />
                      <p className="font-semibold text-[#111b21]">Início da conversa</p>
                      <p className="mt-1 text-[#667781]">
                        Envie uma mensagem para iniciar o atendimento via WhatsApp.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedMessages.map((message) => {
                      const isOutbound = message.direcao === 'OUTBOUND'
                      const parsed = parseQuotedMessage(message.conteudo)
                      const isMenuOpen = activeMenuMessageId === message.id

                      return (
                        <div
                          key={message.id}
                          className={cn(
                            'group relative flex w-full',
                            isOutbound ? 'justify-end' : 'justify-start',
                          )}
                        >
                          {/* WhatsApp Chat Bubble */}
                          <div
                            className={cn(
                              'relative max-w-[80%] rounded-lg px-3 py-1.5 text-[#111b21] shadow-[0_1px_0.5px_rgba(11,20,26,.13)] sm:max-w-[65%]',
                              isOutbound
                                ? 'rounded-tr-none bg-[#d9fdd3]'
                                : 'rounded-tl-none bg-white',
                            )}
                          >
                            {/* Hover Dropdown Button for Message Actions */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMenuMessageId(isMenuOpen ? null : message.id)
                              }}
                              className={cn(
                                'absolute right-1 top-1 z-10 grid size-5 place-items-center rounded-full bg-white/80 text-[#54656f] opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100',
                                isMenuOpen && 'opacity-100',
                              )}
                              title="Opções"
                            >
                              <ChevronDown className="size-3.5" />
                            </button>

                            {/* Dropdown Menu (Responder / Copiar) */}
                            {isMenuOpen && (
                              <div
                                className="absolute right-0 top-7 z-30 min-w-[130px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleReplyToMessage(message)}
                                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-[#111b21] hover:bg-[#f0f2f5]"
                                >
                                  <Reply className="size-3.5 text-[#00a884]" />
                                  <span>Responder</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyMessage(message.conteudo)}
                                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-[#111b21] hover:bg-[#f0f2f5]"
                                >
                                  <Copy className="size-3.5 text-[#54656f]" />
                                  <span>Copiar</span>
                                </button>
                              </div>
                            )}

                            {/* Operator Name for Outbound if present */}
                            {isOutbound && message.user && (
                              <p className="mb-0.5 text-[11px] font-semibold text-[#00a884]">
                                {message.user.nome}
                              </p>
                            )}

                            {/* Quoted Message Card (Inside Bubble) */}
                            {parsed.isQuoted && (
                              <div
                                className={cn(
                                  'mb-1.5 rounded-md border-l-4 px-2 py-1 text-xs',
                                  isOutbound
                                    ? 'border-[#00a884] bg-[#c9f1c3]/70'
                                    : 'border-[#027eb5] bg-[#f0f2f5]',
                                )}
                              >
                                <p
                                  className={cn(
                                    'font-semibold',
                                    isOutbound ? 'text-[#00a884]' : 'text-[#027eb5]',
                                  )}
                                >
                                  {parsed.sender}
                                </p>
                                <p className="line-clamp-2 text-[#54656f]">
                                  {parsed.quotedText}
                                </p>
                              </div>
                            )}

                            {/* Message Text Content */}
                            <p className="whitespace-pre-wrap text-[14px] leading-[19px] break-words">
                              {parsed.body}
                            </p>

                            {/* Timestamp & Delivery Status */}
                            <div className="float-right ml-3 mt-1 flex items-center gap-1 text-[11px] text-[#667781]">
                              <span>{formatWhatsAppTime(message.data_envio)}</span>
                              {isOutbound && (
                                <>
                                  {message.status_envio === 'ERRO' ? (
                                    <span title="Falha no envio">
                                      <AlertCircle className="size-3.5 text-rose-500" />
                                    </span>
                                  ) : message.status_envio === 'LIDO' ? (
                                    <span title="Lido">
                                      <CheckCheck className="size-3.5 text-[#53bdeb]" />
                                    </span>
                                  ) : message.status_envio === 'ENTREGUE' ? (
                                    <span title="Entregue">
                                      <CheckCheck className="size-3.5 text-[#8696a0]" />
                                    </span>
                                  ) : (
                                    <span title="Enviado">
                                      <Check className="size-3.5 text-[#8696a0]" />
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* WhatsApp Web Reply Banner (Docked above input bar) */}
              {replyingTo && (
                <div className="border-t border-[#d1d7db] bg-[#f0f2f5] px-4 pt-2">
                  <div className="flex items-center justify-between rounded-t-lg border-l-4 border-[#00a884] bg-[#e9edef] px-3 py-2">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-semibold text-[#00a884]">
                        Respondendo a {replyingTo.senderName}
                      </p>
                      <p className="truncate text-xs text-[#54656f]">
                        {replyingTo.content}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="grid size-6 place-items-center rounded-full text-[#54656f] hover:bg-[#d1d7db] hover:text-[#111b21]"
                      title="Cancelar resposta"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Emoji Tray */}
              {showEmojiPicker && (
                <div className="flex flex-wrap items-center gap-1 border-t border-[#d1d7db] bg-[#f0f2f5] px-4 py-2">
                  {emojiList.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setMessageText((prev) => prev + emoji)}
                      className="grid size-8 place-items-center rounded-lg text-lg hover:bg-[#e9edef]"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="ml-auto text-xs text-[#54656f] hover:underline"
                  >
                    Fechar
                  </button>
                </div>
              )}

              {/* WhatsApp Web Bottom Input Bar */}
              <footer className="border-t border-[#d1d7db] bg-[#f0f2f5] px-4 py-2.5">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-2"
                >
                  {/* Emoji Button */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="grid size-10 shrink-0 place-items-center rounded-full text-[#54656f] transition hover:bg-[#e9edef] hover:text-[#111b21]"
                    title="Emojis"
                  >
                    <Smile className="size-6" />
                  </button>

                  {/* Attachment Button (Templates / AI) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowActionsMenu(!showActionsMenu)}
                      className="grid size-10 shrink-0 place-items-center rounded-full text-[#54656f] transition hover:bg-[#e9edef] hover:text-[#111b21]"
                      title="Anexar ou Ações Rápidas"
                    >
                      <Paperclip className="size-5" />
                    </button>

                    {showActionsMenu && (
                      <div
                        className="absolute bottom-12 left-0 z-30 min-w-[190px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowTemplatesModal(true)
                            setShowActionsMenu(false)
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#111b21] hover:bg-[#f0f2f5]"
                        >
                          <FileText className="size-4 text-[#00a884]" />
                          <span>Templates de resposta</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAiModal(true)
                            setShowActionsMenu(false)
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#111b21] hover:bg-[#f0f2f5]"
                        >
                          <Sparkles className="size-4 text-[#027eb5]" />
                          <span>Sugestão de resposta IA</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Textarea Input (Auto-sized, WhatsApp Web style) */}
                  <div className="flex-1 rounded-lg bg-white px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-[#00a884]">
                    <textarea
                      ref={textareaRef}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        replyingTo
                          ? `Responda para ${replyingTo.senderName}...`
                          : 'Mensagem'
                      }
                      rows={1}
                      className="max-h-28 min-h-[24px] w-full resize-none bg-transparent text-[14px] leading-5 text-[#111b21] outline-none placeholder:text-[#8696a0]"
                    />
                  </div>

                  {/* Send or Mic Button */}
                  {messageText.trim() ? (
                    <button
                      type="submit"
                      disabled={sendMessage.isPending}
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-[#00a884] text-white shadow-sm transition hover:bg-[#008f6f] active:scale-95 disabled:opacity-50"
                      title="Enviar mensagem"
                    >
                      <Send className="size-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toast.info('Digite uma mensagem para enviar.')}
                      className="grid size-10 shrink-0 place-items-center rounded-full text-[#54656f] transition hover:bg-[#e9edef]"
                      title="Gravar áudio"
                    >
                      <Mic className="size-6" />
                    </button>
                  )}
                </form>
              </footer>
            </>
          ) : (
            <div className="grid h-full place-items-center p-8 text-center text-[#54656f]">
              <div className="max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#00a884]/10 text-[#00a884]">
                  <MessageSquare className="size-8" />
                </div>
                <h2 className="text-lg font-semibold text-[#111b21]">
                  WhatsApp Web para LumixEngine
                </h2>
                <p className="mt-2 text-xs leading-5 text-[#667781]">
                  Envie e receba mensagens do WhatsApp em tempo real. Selecione uma conversa
                  na lista à esquerda para iniciar o atendimento.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* AI Suggestions Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-[#00a884]" />
                <h3 className="text-base font-semibold text-slate-900">
                  Sugestões da IA Lumix
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <select
                value={suggestionIntent}
                onChange={(e) =>
                  setSuggestionIntent(
                    e.target.value as typeof suggestionIntent,
                  )
                }
                className="h-9 flex-1 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#00a884]"
              >
                <option value="follow_up">Follow-up comercial</option>
                <option value="boas_vindas">Boas-vindas calorosas</option>
                <option value="qualificacao">Qualificação de interesse</option>
                <option value="proposta">Apresentação de proposta</option>
                <option value="recuperacao">Recuperação de lead inativo</option>
              </select>

              <Button
                type="button"
                size="sm"
                disabled={generateSuggestions.isPending || !selectedLead}
                onClick={() =>
                  selectedLead &&
                  generateSuggestions.mutate({
                    lead_id: selectedLead.id,
                    intent: suggestionIntent,
                  })
                }
                className="bg-[#00a884] hover:bg-[#008f6f]"
              >
                <Sparkles className="size-3.5" />
                {generateSuggestions.isPending ? 'Gerando...' : 'Gerar'}
              </Button>
            </div>

            <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
              {suggestions.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  Clique em "Gerar" para obter sugestões automáticas baseadas no contexto do lead.
                </p>
              ) : (
                suggestions.map((item) => (
                  <button
                    key={`${item.origem}-${item.id}`}
                    type="button"
                    onClick={() => {
                      setMessageText(item.conteudo_texto)
                      setShowAiModal(false)
                    }}
                    className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-[#00a884] hover:bg-[#f0f2f5]"
                  >
                    <p className="text-xs font-semibold text-slate-900">{item.titulo}</p>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-3">
                      {item.conteudo_texto}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-[#00a884]" />
                <h3 className="text-base font-semibold text-slate-900">
                  Templates Rápidos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
              {(templatesQuery.data ?? []).filter((t) => t.ativo).length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  Nenhum template cadastrado em Configurações.
                </p>
              ) : (
                (templatesQuery.data ?? [])
                  .filter((t) => t.ativo)
                  .map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        setMessageText(template.conteudo_texto)
                        setShowTemplatesModal(false)
                      }}
                      className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-[#00a884] hover:bg-[#f0f2f5]"
                    >
                      <p className="text-xs font-semibold text-slate-900">
                        {template.titulo}
                      </p>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                        {template.conteudo_texto}
                      </p>
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function upsertLocalMessage(messages: Message[], incomingMessage: Message) {
  const exists = messages.some((message) => message.id === incomingMessage.id)
  const nextMessages = exists
    ? messages.map((message) =>
        message.id === incomingMessage.id ? incomingMessage : message,
      )
    : [...messages, incomingMessage]

  return nextMessages
    .filter(
      (message, index, allMessages) =>
        allMessages.findIndex((item) => item.id === message.id) === index,
    )
    .sort(
      (a, b) =>
        new Date(a.data_envio).getTime() - new Date(b.data_envio).getTime(),
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

function formatWhatsAppTime(value: string) {
  const date = new Date(value)
  const now = new Date()

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isToday) {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 13 && digits.startsWith('55')) {
    const ddd = digits.slice(2, 4)
    const part1 = digits.slice(4, 9)
    const part2 = digits.slice(9)
    return `+55 (${ddd}) ${part1}-${part2}`
  }
  if (digits.length === 11) {
    const ddd = digits.slice(0, 2)
    const part1 = digits.slice(2, 7)
    const part2 = digits.slice(7)
    return `(${ddd}) ${part1}-${part2}`
  }
  return phone
}
