import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Mail, MessageCircle, Save, Send, ShieldCheck, Zap } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApiError, settingsApi } from '@/lib/api'
import type { SettingsPayload } from '@/types/lead'

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
            description="Evolution API 2.1.1 auto-hospedada. Informe o endpoint sendText da instância e a API Key global."
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
            </div>
          </SettingsCard>
        </div>

        <aside className="space-y-6">
          <SettingsCard
            icon={Zap}
            title="Ações"
            description="Salve, verifique SMTP e envie uma mensagem de teste."
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
    </section>
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
