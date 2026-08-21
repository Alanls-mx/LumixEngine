import { useEffect, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { notificationsApi } from '@/lib/api'
import { socket } from '@/lib/socket'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/lead'

const notificationsKey = ['notifications'] as const

export function NotificationsPanel() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: notificationsKey,
    queryFn: notificationsApi.list,
  })

  useEffect(() => {
    const handleNotification = (notification: Notification) => {
      queryClient.setQueryData<Notification[]>(
        notificationsKey,
        (currentNotifications = []) => [notification, ...currentNotifications],
      )
    }

    socket.connect()
    socket.on('notification_created', handleNotification)

    return () => {
      socket.off('notification_created', handleNotification)
    }
  }, [queryClient])

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(
        notificationsKey,
        (currentNotifications = []) =>
          currentNotifications.map((notification) => ({
            ...notification,
            lida: true,
          })),
      )
    },
  })

  const notifications = notificationsQuery.data ?? []
  const unreadCount = notifications.filter((notification) => !notification.lida).length

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        aria-label="Notificações"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <Bell aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Notificações</p>
              <p className="text-xs text-slate-500">{unreadCount} não lidas</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending || unreadCount === 0}
            >
              <CheckCheck aria-hidden="true" />
              Marcar lidas
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificationsQuery.isLoading && (
              <div className="space-y-2 p-4">
                <div className="h-14 animate-pulse rounded-md bg-slate-100" />
                <div className="h-14 animate-pulse rounded-md bg-slate-100" />
              </div>
            )}

            {notifications.length === 0 && !notificationsQuery.isLoading && (
              <div className="p-6 text-center text-sm text-slate-500">
                Nenhuma notificação por enquanto.
              </div>
            )}

            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={cn(
                  'border-b border-slate-100 px-4 py-3',
                  !notification.lida && 'bg-emerald-50/60',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-1 size-2 shrink-0 rounded-full',
                      notification.lida ? 'bg-slate-300' : 'bg-emerald-500',
                    )}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {notification.titulo}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {notification.conteudo}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-400">
                      {new Date(notification.data_criacao).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
