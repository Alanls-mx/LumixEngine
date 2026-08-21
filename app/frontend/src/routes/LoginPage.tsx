import { useEffect, useRef, useState, type FormEvent } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Bot, Globe, LockKeyhole, Mail, UserPlus } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Toaster, toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthProvider'
import { ApiError, authApi } from '@/lib/api'

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
          }) => void
          renderButton: (
            element: HTMLElement,
            options: {
              theme: 'outline' | 'filled_blue'
              size: 'large'
              width?: number
              text?: 'signin_with' | 'continue_with'
            },
          ) => void
        }
      }
    }
  }
}

function getErrorMessage(error: unknown, fallback: string) {
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

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const [mode, setMode] = useState<'login' | 'bootstrap'>('login')
  const [formState, setFormState] = useState({
    nome: '',
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const configQuery = useQuery({
    queryKey: ['auth-config'],
    queryFn: authApi.config,
  })

  useEffect(() => {
    const googleClientId = configQuery.data?.googleClientId

    if (!googleClientId || !googleButtonRef.current) {
      return
    }

    const scriptId = 'google-identity-services'
    const render = () => {
      window.google?.accounts?.id?.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response.credential) {
            toast.error('Login Google sem credencial.')
            return
          }

          try {
            await auth.loginWithGoogle(response.credential)
            navigate('/', { replace: true })
          } catch (error) {
            toast.error(getErrorMessage(error, 'Não foi possível entrar com Google'))
          }
        },
      })
      googleButtonRef.current!.innerHTML = ''
      window.google?.accounts?.id?.renderButton(googleButtonRef.current!, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
      })
    }

    if (document.getElementById(scriptId)) {
      render()
      return
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = render
    document.head.appendChild(script)
  }, [auth, configQuery.data?.googleClientId, navigate])

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      if (mode === 'bootstrap') {
        await auth.bootstrap(formState)
      } else {
        await auth.login({
          email: formState.email,
          password: formState.password,
        })
      }

      navigate('/', { replace: true })
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          mode === 'bootstrap'
            ? 'Não foi possível criar o administrador'
            : 'Não foi possível entrar',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-svh bg-[#090d16] px-4 py-8 text-white">
      <Toaster richColors position="top-right" />
      <section className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div className="hidden lg:block">
          <img
            src="/assets/lumix-logo-header-cropped.webp"
            alt="LumixEngine"
            className="h-16 w-auto object-contain"
          />
          <h1 className="mt-10 max-w-xl text-4xl font-semibold leading-tight">
            Operação comercial, atendimento e automações em tempo real.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
            Acesse o CRM interno, organize equipes e responda leads com templates
            e sugestões inteligentes.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-white/10 bg-white p-6 text-slate-950 shadow-2xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <img
              src="/assets/lumix-icon-96.webp"
              alt=""
              className="size-10 rounded-lg object-contain"
            />
            <div>
              <p className="text-sm font-semibold">LumixEngine App</p>
              <p className="text-xs text-slate-500">Acesso interno</p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={
                mode === 'login'
                  ? 'rounded-md bg-white px-3 py-2 shadow-sm'
                  : 'rounded-md px-3 py-2 text-slate-500'
              }
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode('bootstrap')}
              className={
                mode === 'bootstrap'
                  ? 'rounded-md bg-white px-3 py-2 shadow-sm'
                  : 'rounded-md px-3 py-2 text-slate-500'
              }
            >
              Primeiro admin
            </button>
          </div>

          {mode === 'bootstrap' && (
            <Field
              icon={UserPlus}
              label="Nome"
              value={formState.nome}
              onChange={(value) => setFormState((state) => ({ ...state, nome: value }))}
              placeholder="Seu nome"
            />
          )}

          <Field
            icon={Mail}
            label="E-mail"
            type="email"
            value={formState.email}
            onChange={(value) => setFormState((state) => ({ ...state, email: value }))}
            placeholder="voce@lumixengine.com"
          />

          <Field
            icon={LockKeyhole}
            label="Senha"
            type="password"
            value={formState.password}
            onChange={(value) =>
              setFormState((state) => ({ ...state, password: value }))
            }
            placeholder={mode === 'bootstrap' ? 'Mínimo 8 caracteres' : 'Sua senha'}
          />

          <Button className="mt-2 w-full" disabled={isSubmitting}>
            <Bot aria-hidden="true" />
            {isSubmitting
              ? 'Validando...'
              : mode === 'bootstrap'
                ? 'Criar administrador'
                : 'Entrar no painel'}
          </Button>

          {configQuery.data?.googleClientId && (
            <div className="mt-5 border-t border-slate-200 pt-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Globe className="size-4" aria-hidden="true" />
                Google Workspace
              </div>
              <div ref={googleButtonRef} />
            </div>
          )}

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Contas seed antigas aceitam temporariamente a senha
            <span className="font-semibold"> Lumix@2026</span> e são recriptadas no
            primeiro acesso.
          </p>
        </form>
      </section>
    </main>
  )
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  icon: typeof Mail
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <label className="mb-4 block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
        <Icon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </span>
    </label>
  )
}
