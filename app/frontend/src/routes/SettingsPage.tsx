import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  Copy,
  FileText,
  Mail,
  MessageCircle,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApiError, messageTemplatesApi, settingsApi } from '@/lib/api'
import { useAuth } from '@/lib/AuthProvider'
import type { MessageTemplate, SettingsPayload } from '@/types/lead'

const settingsKey = ['settings'] as const

const defaultFormState = {
  SMTP_HOST: '',
  SMTP_PORT: '587',
  SMTP_USER: '',
  SMTP_PASS: '',
  SMTP_FROM: '',
  INTERNAL_LEAD_NOTIFICATION_EMAIL: '',
  WHATSAPP_API_URL: '',
  WHATSAPP_API_TOKEN: '',
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (
    error instanceof ApiError &&
    error.details &&
    typeof error.details === 'object' &&
    'message' in error.details &&
    typeof error.details.message === 'string'
  ) {
    return error.details.message
  }

  return fallback
}

export function SettingsPage() {
  const queryClient = useQueryClient()
  const [formState, setFormState] = useState<SettingsPayload>(defaultFormState)
  const [testEmail, setTestEmail] = useState('')
  const [qrModalData, setQrModalData] = useState<{
    base64?: string | null
    pairingCode?: string | null
  } | null>(null)

  const settingsQuery = useQuery({
    queryKey: settingsKey,
    queryFn: settingsApi.get,
  })

  const settingMap = useMemo(() => {
    return Object.fromEntries(
      (settingsQuery.data?.settings ?? []).map((setting) => [
        setting.chave,
        setting.valor === '********' ? '' : (setting.valor ?? ''),
      ]),
    ) as SettingsPayload
  }, [settingsQuery.data])

  useEffect(() => {
    if (settingsQuery.data) {
      setFormState({
        ...defaultFormState,
        ...settingMap,
      })
    }
  }, [settingMap, settingsQuery.data])

  const updateSettings = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKey, data)
      toast.success('Configurações salvas')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Não foi possível salvar as configurações'))
    },
  })

  const verifyEmail = useMutation({
    mutationFn: settingsApi.verifyEmail,
    onSuccess: (response) => {
      toast.success(response.message)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Falha ao verificar SMTP'))
    },
  })

  const connectWhatsApp = useMutation({
    mutationFn: settingsApi.connectWhatsApp,
    onSuccess: (response) => {
      if (response.base64 || response.pairingCode) {
        setQrModalData({
          base64: response.base64,
          pairingCode: response.pairingCode,
        })
        toast.info('QR Code gerado! Aponte o WhatsApp para conectar.')
      } else {
        toast.info(response.message)
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Não foi possível gerar QR Code'))
    },
  })

  const verifyWhatsApp = useMutation({
    mutationFn: settingsApi.verifyWhatsApp,
    onSuccess: (response) => {
      if (response.ok) {
        toast.success(response.message)
      } else {
        toast.warning(response.message)
        if (response.state === 'close' || response.state === 'connecting') {
          connectWhatsApp.mutate()
        }
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Falha ao verificar Evolution API'))
    },
  })

  const configureWebhook = useMutation({
    mutationFn: settingsApi.configureWhatsAppWebhook,
    onSuccess: (response) => {
      toast.success(response.message)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Falha ao registrar webhook na Evolution API'))
    },
  })

  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const webhookEndpointUrl = `${window.location.origin}/api/webhooks/whatsapp`

  const sendTestEmail = useMutation({
    mutationFn: settingsApi.sendTestEmail,
    onSuccess: (response) => {
      toast.success(response.message)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Falha ao enviar e-mail de teste'))
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateSettings.mutate(formState)
  }

  const emailConfigured = settingsQuery.data?.status.email.configured ?? false
  const whatsappConfigured =
    settingsQuery.data?.status.whatsapp.configured ?? false

  return (
    <section className="space-y-6">
      <div>
        <Badge variant="success">Configurações</Badge>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">
          Integrações e notificações
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure SMTP, gateway WhatsApp e preferências operacionais.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatusCard
          title="SMTP"
          description={
            emailConfigured
              ? 'E-mails transacionais configurados.'
              : 'Configure SMTP para enviar e-mails.'
          }
          configured={emailConfigured}
          icon={Mail}
        />
        <StatusCard
          title="WhatsApp"
          description={
            whatsappConfigured
              ? 'Gateway pronto para envios outbound.'
              : 'Configure a URL da Evolution API/Z-API.'
          }
          configured={whatsappConfigured}
          icon={MessageCircle}
        />
      </div>

      <form className="grid gap-6 xl:grid-cols-[1fr_420px]" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <SettingsCard
            icon={Mail}
            title="SMTP / E-mails"
            description="Usado para confirmação ao lead e notificação interna."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="SMTP Host"
                value={formState.SMTP_HOST ?? ''}
                onChange={(value) => setFormState((state) => ({ ...state, SMTP_HOST: value }))}
                placeholder="smtp.seudominio.com"
              />
              <Field
                label="SMTP Port"
                value={formState.SMTP_PORT ?? ''}
                onChange={(value) => setFormState((state) => ({ ...state, SMTP_PORT: value }))}
                placeholder="587"
              />
              <Field
                label="SMTP User"
                value={formState.SMTP_USER ?? ''}
                onChange={(value) => setFormState((state) => ({ ...state, SMTP_USER: value }))}
                placeholder="usuario@dominio.com"
              />
              <Field
                label="SMTP Pass"
                type="password"
                value={formState.SMTP_PASS ?? ''}
                onChange={(value) => setFormState((state) => ({ ...state, SMTP_PASS: value }))}
                placeholder="Senha ou app password"
              />
              <Field
                label="Remetente"
                value={formState.SMTP_FROM ?? ''}
                onChange={(value) => setFormState((state) => ({ ...state, SMTP_FROM: value }))}
                placeholder="LumixEngine <contato@dominio.com>"
              />
              <Field
                label="Notificação interna"
                value={formState.INTERNAL_LEAD_NOTIFICATION_EMAIL ?? ''}
                onChange={(value) =>
                  setFormState((state) => ({
                    ...state,
                    INTERNAL_LEAD_NOTIFICATION_EMAIL: value,
                  }))
                }
                placeholder="comercial@dominio.com"
              />
            </div>
          </SettingsCard>

          <SettingsCard
            icon={MessageCircle}
            title="WhatsApp Gateway"
            description="Evolution API auto-hospedada. Informe o endpoint sendText da instância e a API Key global."
          >
            <div className="grid gap-4">
              <Field
                label="URL de envio"
                value={formState.WHATSAPP_API_URL ?? ''}
                onChange={(value) =>
                  setFormState((state) => ({ ...state, WHATSAPP_API_URL: value }))
                }
                placeholder="http://IP_DA_VPS:8080/message/sendText/{instance_name}"
              />
              <Field
                label="Token / API Key"
                type="password"
                value={formState.WHATSAPP_API_TOKEN ?? ''}
                onChange={(value) =>
                  setFormState((state) => ({ ...state, WHATSAPP_API_TOKEN: value }))
                }
                placeholder="Chave global da Evolution API"
              />

              {/* Webhook & Read Receipt Integration Info */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Webhook de Entrada e Confirmação de Leitura
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(webhookEndpointUrl)
                      setCopiedWebhook(true)
                      toast.success('URL do Webhook copiada!')
                      setTimeout(() => setCopiedWebhook(false), 2000)
                    }}
                    className="flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    {copiedWebhook ? (
                      <>
                        <Check className="size-3.5" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" /> Copiar URL
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 break-all select-all">
                  {webhookEndpointUrl}
                </p>
                <p className="leading-relaxed text-slate-500 text-[11px]">
                  Necessário para que as mensagens respondidas pelos clientes cheguem ao Inbox e para atualizar as confirmações de leitura (dois tracinhos azuis).
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-300 text-slate-700 hover:bg-white text-xs"
                  onClick={() => configureWebhook.mutate()}
                  disabled={configureWebhook.isPending}
                >
                  <RefreshCw className={`size-3.5 mr-1.5 ${configureWebhook.isPending ? 'animate-spin' : ''}`} />
                  {configureWebhook.isPending ? 'Sincronizando Webhook...' : 'Sincronizar Webhook na Evolution API'}
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                onClick={() => connectWhatsApp.mutate()}
                disabled={connectWhatsApp.isPending}
              >
                <QrCode className="size-4 mr-2" aria-hidden="true" />
                {connectWhatsApp.isPending ? 'Carregando QR Code...' : 'Escanear QR Code para conectar'}
              </Button>
            </div>
          </SettingsCard>
        </div>

        <aside className="space-y-6">
          <SettingsCard
            icon={Zap}
            title="Ações"
            description="Salve, verifique conexões e escaneie o QR Code."
          >
            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={updateSettings.isPending}>
                <Save aria-hidden="true" />
                {updateSettings.isPending ? 'Salvando...' : 'Salvar configurações'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => verifyEmail.mutate()}
                disabled={verifyEmail.isPending}
              >
                <ShieldCheck aria-hidden="true" />
                Verificar SMTP
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => verifyWhatsApp.mutate()}
                disabled={verifyWhatsApp.isPending}
              >
                <MessageCircle aria-hidden="true" />
                {verifyWhatsApp.isPending ? 'Verificando WhatsApp...' : 'Verificar WhatsApp'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => configureWebhook.mutate()}
                disabled={configureWebhook.isPending}
              >
                <RefreshCw className={`size-4 mr-2 ${configureWebhook.isPending ? 'animate-spin' : ''}`} />
                {configureWebhook.isPending ? 'Sincronizando...' : 'Sincronizar Webhook'}
              </Button>
              <Button
                type="button"
                className="w-full bg-[#00a884] text-white hover:bg-[#008f6f]"
                onClick={() => connectWhatsApp.mutate()}
                disabled={connectWhatsApp.isPending}
              >
                <QrCode aria-hidden="true" />
                {connectWhatsApp.isPending ? 'Carregando QR Code...' : 'Escanear QR Code WhatsApp'}
              </Button>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Send}
            title="E-mail de teste"
            description="Envia um e-mail simples usando as configurações salvas."
          >
            <div className="space-y-3">
              <Field
                label="Enviar para"
                value={testEmail}
                onChange={setTestEmail}
                placeholder="voce@dominio.com"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!testEmail || sendTestEmail.isPending}
                onClick={() => sendTestEmail.mutate(testEmail)}
              >
                <Send aria-hidden="true" />
                Enviar teste
              </Button>
            </div>
          </SettingsCard>
        </aside>
      </form>

      <MessageTemplatesPanel />

      {qrModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <MessageCircle className="size-5 text-[#00a884]" />
                Conectar WhatsApp
              </h3>
              <button
                type="button"
                onClick={() => setQrModalData(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            {qrModalData.base64 ? (
              <div className="mx-auto mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 inline-block shadow-inner">
                <img
                  src={qrModalData.base64}
                  alt="QR Code do WhatsApp"
                  className="size-64 object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="p-8 text-sm text-slate-500">
                Aguardando QR Code da Evolution API...
              </div>
            )}

            {qrModalData.pairingCode && (
              <div className="mb-4 rounded-lg bg-emerald-50 p-2 text-xs font-mono text-emerald-800">
                Código de pareamento: <span className="font-bold">{qrModalData.pairingCode}</span>
              </div>
            )}

            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              1. Abra o WhatsApp no seu celular<br />
              2. Toque em <strong>Menu (ou Configurações) &gt; Aparelhos conectados</strong><br />
              3. Toque em <strong>Conectar um aparelho</strong> e aponte a câmera
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => connectWhatsApp.mutate()}
                disabled={connectWhatsApp.isPending}
              >
                {connectWhatsApp.isPending ? 'Atualizando...' : 'Atualizar QR Code'}
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-[#00a884] text-white hover:bg-[#008f6f]"
                onClick={() => {
                  verifyWhatsApp.mutate(undefined, {
                    onSuccess: (res) => {
                      if (res.ok && res.state === 'open') {
                        setQrModalData(null)
                      }
                    },
                  })
                }}
                disabled={verifyWhatsApp.isPending}
              >
                {verifyWhatsApp.isPending ? 'Verificando...' : 'Já escaneei'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

const emptyTemplateForm = {
  titulo: '',
  categoria: 'geral',
  conteudo_texto: '',
  ativo: true,
  uso_ia: false,
}

function MessageTemplatesPanel() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [form, setForm] = useState(emptyTemplateForm)
  const templatesKey = ['message-templates'] as const

  const templatesQuery = useQuery({
    queryKey: templatesKey,
    queryFn: messageTemplatesApi.list,
  })

  const createTemplate = useMutation({
    mutationFn: messageTemplatesApi.create,
    onSuccess: () => {
      setForm(emptyTemplateForm)
      queryClient.invalidateQueries({ queryKey: templatesKey })
      toast.success('Template criado')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Não foi possível criar o template'))
    },
  })

  const toggleTemplate = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      messageTemplatesApi.update(id, { ativo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templatesKey })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Não foi possível atualizar o template'))
    },
  })

  const deleteTemplate = useMutation({
    mutationFn: (template: MessageTemplate) =>
      messageTemplatesApi.update(template.id, { ativo: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templatesKey })
      toast.success('Template desativado')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Não foi possível desativar o template'))
    },
  })

  const canManageTemplates = user?.role === 'ADMIN'

  return (
    <SettingsCard
      icon={FileText}
      title="Templates e respostas automáticas"
      description="Mensagens reutilizáveis para o Inbox e base para sugestões assistidas por IA."
    >
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form
          className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4"
          onSubmit={(event) => {
            event.preventDefault()

            if (!form.titulo.trim() || !form.conteudo_texto.trim()) {
              toast.error('Informe título e conteúdo')
              return
            }

            createTemplate.mutate({
              titulo: form.titulo.trim(),
              categoria: form.categoria.trim() || 'geral',
              conteudo_texto: form.conteudo_texto.trim(),
              ativo: form.ativo,
              uso_ia: form.uso_ia,
            })
          }}
        >
          <Field
            label="Título"
            value={form.titulo}
            onChange={(value) => setForm((state) => ({ ...state, titulo: value }))}
            placeholder="Follow-up comercial"
          />
          <Field
            label="Categoria"
            value={form.categoria}
            onChange={(value) => setForm((state) => ({ ...state, categoria: value }))}
            placeholder="follow_up"
          />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Conteúdo</span>
            <textarea
              value={form.conteudo_texto}
              onChange={(event) =>
                setForm((state) => ({ ...state, conteudo_texto: event.target.value }))
              }
              placeholder="Olá, {nome}! Podemos avançar com sua proposta?"
              className="min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.uso_ia}
              onChange={(event) =>
                setForm((state) => ({ ...state, uso_ia: event.target.checked }))
              }
              className="size-4 rounded border-slate-300 text-emerald-600"
            />
            Usar como base para IA
          </label>
          <Button
            type="submit"
            className="w-full"
            disabled={!canManageTemplates || createTemplate.isPending}
          >
            <Plus aria-hidden="true" />
            Criar template
          </Button>
          {!canManageTemplates ? (
            <p className="text-xs leading-5 text-slate-500">
              Apenas administradores podem alterar templates.
            </p>
          ) : null}
        </form>

        <div className="space-y-3">
          {(templatesQuery.data ?? []).map((template) => (
            <div
              key={template.id}
              className="rounded-md border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-950">
                      {template.titulo}
                    </h3>
                    <Badge variant={template.ativo ? 'success' : 'warning'}>
                      {template.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {template.uso_ia ? <Badge>IA</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                    {template.categoria}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canManageTemplates || toggleTemplate.isPending}
                    onClick={() =>
                      toggleTemplate.mutate({
                        id: template.id,
                        ativo: !template.ativo,
                      })
                    }
                  >
                    {template.ativo ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canManageTemplates || deleteTemplate.isPending}
                    onClick={() => deleteTemplate.mutate(template)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {template.conteudo_texto}
              </p>
            </div>
          ))}
          {templatesQuery.isLoading ? (
            <p className="text-sm text-slate-500">Carregando templates...</p>
          ) : null}
          {!templatesQuery.isLoading && (templatesQuery.data ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum template cadastrado.</p>
          ) : null}
        </div>
      </div>
    </SettingsCard>
  )
}

function StatusCard({
  title,
  description,
  configured,
  icon: Icon,
}: {
  title: string
  description: string
  configured: boolean
  icon: typeof Mail
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="grid size-10 place-items-center rounded-md bg-emerald-50 text-emerald-700">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
      <Badge variant={configured ? 'success' : 'warning'} className="mt-4">
        {configured ? 'Configurado' : 'Pendente'}
      </Badge>
    </div>
  )
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Mail
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-700">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  )
}
