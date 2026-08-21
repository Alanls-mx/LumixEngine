import { useMemo, useState, type FormEvent } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { teamsApi, usersApi } from '@/lib/api'
import { useAuth } from '@/lib/AuthProvider'
import type { Team, UserRole } from '@/types/lead'

const teamsKey = ['teams'] as const
const usersKey = ['users'] as const

export function TeamsPage() {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const [teamName, setTeamName] = useState('')
  const [userForm, setUserForm] = useState({
    nome: '',
    email: '',
    password: '',
    role: 'ATENDENTE' as UserRole,
    team_id: '',
  })

  const teamsQuery = useQuery({
    queryKey: teamsKey,
    queryFn: teamsApi.list,
  })
  const usersQuery = useQuery({
    queryKey: usersKey,
    queryFn: usersApi.list,
  })

  const usersByTeam = useMemo(() => {
    const map = new Map<string, number>()

    for (const user of usersQuery.data ?? []) {
      if (user.team_id) {
        map.set(user.team_id, (map.get(user.team_id) ?? 0) + 1)
      }
    }

    return map
  }, [usersQuery.data])

  const createTeam = useMutation({
    mutationFn: teamsApi.create,
    onSuccess: () => {
      setTeamName('')
      queryClient.invalidateQueries({ queryKey: teamsKey })
      toast.success('Equipe criada')
    },
    onError: () => toast.error('Não foi possível criar a equipe'),
  })

  const createUser = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      setUserForm({
        nome: '',
        email: '',
        password: '',
        role: 'ATENDENTE',
        team_id: '',
      })
      queryClient.invalidateQueries({ queryKey: usersKey })
      queryClient.invalidateQueries({ queryKey: teamsKey })
      toast.success('Atendente criado')
    },
    onError: () => toast.error('Não foi possível criar o atendente'),
  })

  const updateUser = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { team_id?: string | null; role?: UserRole; ativo?: boolean }
    }) => usersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey })
      queryClient.invalidateQueries({ queryKey: teamsKey })
      toast.success('Atendente atualizado')
    },
    onError: () => toast.error('Não foi possível atualizar o atendente'),
  })

  const isAdmin = auth.user?.role === 'ADMIN'

  const handleCreateTeam = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!teamName.trim()) {
      return
    }

    createTeam.mutate({
      nome: teamName.trim(),
    })
  }

  const handleCreateUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!userForm.nome.trim() || !userForm.email.trim()) {
      return
    }

    createUser.mutate({
      nome: userForm.nome.trim(),
      email: userForm.email.trim(),
      password: userForm.password || undefined,
      role: userForm.role,
      team_id: userForm.team_id || null,
    })
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="success">Equipes</Badge>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">
            Atendentes e times
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie responsáveis do Inbox, permissões e distribuição de atendimento.
          </p>
        </div>
        <Badge variant="outline">{usersQuery.data?.length ?? 0} atendentes</Badge>
      </div>

      {!isAdmin && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Sua conta pode visualizar equipes. Alterações ficam restritas a administradores.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <form
            onSubmit={handleCreateTeam}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <Users className="size-5 text-emerald-600" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-slate-950">Nova equipe</h2>
            </div>
            <input
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="Ex: Comercial"
              disabled={!isAdmin}
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <Button className="mt-3 w-full" disabled={!isAdmin || createTeam.isPending}>
              Criar equipe
            </Button>
          </form>

          <form
            onSubmit={handleCreateUser}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <UserPlus className="size-5 text-emerald-600" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-slate-950">Novo atendente</h2>
            </div>
            <div className="space-y-3">
              <Field
                value={userForm.nome}
                onChange={(value) => setUserForm((state) => ({ ...state, nome: value }))}
                placeholder="Nome"
                disabled={!isAdmin}
              />
              <Field
                value={userForm.email}
                onChange={(value) => setUserForm((state) => ({ ...state, email: value }))}
                placeholder="E-mail"
                type="email"
                disabled={!isAdmin}
              />
              <Field
                value={userForm.password}
                onChange={(value) =>
                  setUserForm((state) => ({ ...state, password: value }))
                }
                placeholder="Senha inicial ou vazio para Google"
                type="password"
                disabled={!isAdmin}
              />
              <select
                value={userForm.role}
                onChange={(event) =>
                  setUserForm((state) => ({
                    ...state,
                    role: event.target.value as UserRole,
                  }))
                }
                disabled={!isAdmin}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none"
              >
                <option value="ATENDENTE">Atendente</option>
                <option value="ADMIN">Admin</option>
              </select>
              <TeamSelect
                value={userForm.team_id}
                teams={teamsQuery.data ?? []}
                disabled={!isAdmin}
                onChange={(value) => setUserForm((state) => ({ ...state, team_id: value }))}
              />
              <Button className="w-full" disabled={!isAdmin || createUser.isPending}>
                Criar atendente
              </Button>
            </div>
          </form>
        </aside>

        <div className="space-y-4">
          {(teamsQuery.data ?? []).map((team) => (
            <section
              key={team.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">{team.nome}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {usersByTeam.get(team.id) ?? 0} atendentes vinculados
                  </p>
                </div>
                <Badge variant={team.ativo ? 'success' : 'warning'}>
                  {team.ativo ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
              <UsersTable
                users={(usersQuery.data ?? []).filter((user) => user.team_id === team.id)}
                teams={teamsQuery.data ?? []}
                canEdit={isAdmin}
                onAssign={(userId, teamId) =>
                  updateUser.mutate({ id: userId, payload: { team_id: teamId } })
                }
                onRoleChange={(userId, role) =>
                  updateUser.mutate({ id: userId, payload: { role } })
                }
                onStatusChange={(userId, ativo) =>
                  updateUser.mutate({ id: userId, payload: { ativo } })
                }
              />
            </section>
          ))}

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="size-5 text-slate-500" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-slate-950">Sem equipe</h2>
            </div>
            <UsersTable
              users={(usersQuery.data ?? []).filter((user) => !user.team_id)}
              teams={teamsQuery.data ?? []}
              canEdit={isAdmin}
              onAssign={(userId, teamId) =>
                updateUser.mutate({ id: userId, payload: { team_id: teamId } })
              }
              onRoleChange={(userId, role) =>
                updateUser.mutate({ id: userId, payload: { role } })
              }
              onStatusChange={(userId, ativo) =>
                updateUser.mutate({ id: userId, payload: { ativo } })
              }
            />
          </section>
        </div>
      </div>
    </section>
  )
}

function UsersTable({
  users,
  teams,
  canEdit,
  onAssign,
  onRoleChange,
  onStatusChange,
}: {
  users: Awaited<ReturnType<typeof usersApi.list>>
  teams: Team[]
  canEdit: boolean
  onAssign: (userId: string, teamId: string | null) => void
  onRoleChange: (userId: string, role: UserRole) => void
  onStatusChange: (userId: string, ativo: boolean) => void
}) {
  if (users.length === 0) {
    return <p className="text-sm text-slate-500">Nenhum atendente nesta lista.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="text-xs uppercase text-slate-400">
          <tr>
            <th className="py-2">Nome</th>
            <th className="py-2">Função</th>
            <th className="py-2">Equipe</th>
            <th className="py-2">Status</th>
            <th className="py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-3">
                <p className="font-semibold text-slate-950">{user.nome}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </td>
              <td className="py-3">
                <select
                  value={user.role}
                  disabled={!canEdit}
                  onChange={(event) =>
                    onRoleChange(user.id, event.target.value as UserRole)
                  }
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="ATENDENTE">Atendente</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td className="py-3">
                <TeamSelect
                  value={user.team_id ?? ''}
                  teams={teams}
                  disabled={!canEdit}
                  onChange={(value) => onAssign(user.id, value || null)}
                />
              </td>
              <td className="py-3">
                <Badge variant={user.ativo ? 'success' : 'warning'}>
                  {user.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </td>
              <td className="py-3 text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canEdit}
                  onClick={() => onStatusChange(user.id, !user.ativo)}
                >
                  {user.ativo ? 'Desativar' : 'Ativar'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TeamSelect({
  value,
  teams,
  disabled,
  onChange,
}: {
  value: string
  teams: Team[]
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
    >
      <option value="">Sem equipe</option>
      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.nome}
        </option>
      ))}
    </select>
  )
}

function Field({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  disabled: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
    />
  )
}
