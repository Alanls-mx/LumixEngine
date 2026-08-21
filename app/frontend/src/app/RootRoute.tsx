import { Link, NavLink, Outlet } from 'react-router-dom'

import { Toaster } from 'sonner'
import {
  Columns3,
  Inbox,
  LayoutDashboard,
  Search,
  Settings,
} from 'lucide-react'

import { NotificationsPanel } from '@/components/notifications/NotificationsPanel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'CRM', to: '/crm', icon: Columns3 },
  { label: 'Inbox', to: '/inbox', icon: Inbox },
  { label: 'Configurações', to: '/settings', icon: Settings },
]

export function RootRoute() {
  return (
    <div className="min-h-svh bg-[#f4f7f5] text-slate-950">
      <Toaster richColors position="top-right" />
      <div className="grid min-h-svh lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/10 bg-[#121821] text-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
            <div className="grid size-10 place-items-center rounded-lg bg-emerald-400 text-sm font-black text-slate-950">
              LX
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">LumixEngine</p>
              <p className="truncate text-xs text-slate-400">Operations App</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3 py-5" aria-label="Principal">
            {navItems.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Status
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-slate-200">Realtime ativo</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="grid size-9 place-items-center rounded-lg bg-slate-950 text-xs font-black text-white">
                  LX
                </div>
                <span className="text-sm font-semibold">LumixEngine</span>
              </div>

              <div className="hidden h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 lg:flex">
                <Search className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Buscar leads, conversas e tarefas</span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <NotificationsPanel />
                <Button variant="outline" size="icon" aria-label="Configurações" asChild>
                  <Link to="/settings">
                    <Settings aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>

            <nav
              className="flex gap-2 overflow-x-auto border-t border-slate-200 px-4 py-2 lg:hidden"
              aria-label="Principal mobile"
            >
              {navItems.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600',
                        isActive && 'bg-slate-950 text-white',
                      )
                    }
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>
          </header>

          <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

function SidebarLink({
  label,
  to,
  icon: Icon,
}: {
  label: string
  to: string
  icon: typeof LayoutDashboard
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white',
          isActive && 'bg-white text-slate-950 hover:bg-white hover:text-slate-950',
        )
      }
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  )
}
