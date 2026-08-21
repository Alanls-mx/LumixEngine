import { useState, type FormEvent } from 'react'

import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { leadsApi } from '@/lib/api'

type NewLeadFormState = {
  nome: string
  email: string
  telefone: string
  valorEstimado: string
}

const initialFormState: NewLeadFormState = {
  nome: '',
  email: '',
  telefone: '',
  valorEstimado: '',
}

function parseCurrencyValue(value: string) {
  const normalizedValue = value
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')

  if (!normalizedValue) {
    return undefined
  }

  const parsedValue = Number(normalizedValue)

  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

export function NewLeadDialog() {
  const [open, setOpen] = useState(false)
  const [formState, setFormState] = useState<NewLeadFormState>(initialFormState)

  const createLead = useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => {
      setOpen(false)
      setFormState(initialFormState)
      toast.success('Lead adicionado com sucesso', {
        description: 'O card aparecerá no CRM em instantes.',
      })
    },
    onError: () => {
      toast.error('Não foi possível adicionar o lead', {
        description: 'Confira os dados do formulário e tente novamente.',
      })
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const valorEstimado = parseCurrencyValue(formState.valorEstimado)

    createLead.mutate({
      nome: formState.nome.trim(),
      ...(formState.email.trim() ? { email: formState.email.trim() } : {}),
      ...(formState.telefone.trim()
        ? { telefone: formState.telefone.trim() }
        : {}),
      ...(valorEstimado !== undefined ? { valor_estimado: valorEstimado } : {}),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Adicionar Lead
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo lead</DialogTitle>
          <DialogDescription>
            Cadastre uma oportunidade manualmente no pipeline comercial.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="lead-name"
            >
              Nome
            </label>
            <input
              id="lead-name"
              required
              value={formState.nome}
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  nome: event.target.value,
                }))
              }
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Ex: Ana Pereira"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="lead-email"
              >
                Email
              </label>
              <input
                id="lead-email"
                type="email"
                value={formState.email}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    email: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="ana@email.com"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="lead-phone"
              >
                Telefone
              </label>
              <input
                id="lead-phone"
                value={formState.telefone}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    telefone: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="+55 11 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="lead-value"
            >
              Valor Estimado (R$)
            </label>
            <input
              id="lead-value"
              inputMode="decimal"
              value={formState.valorEstimado}
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  valorEstimado: event.target.value,
                }))
              }
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Ex: 7500"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createLead.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createLead.isPending}>
              {createLead.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
