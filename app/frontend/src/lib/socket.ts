import { io, type Socket } from 'socket.io-client'

import { SOCKET_URL } from '@/lib/config'
import type { Lead, Message, Notification } from '@/types/lead'

export type ServerToClientEvents = {
  new_lead: (lead: Lead) => void
  lead_updated: (lead: Lead) => void
  lead_assigned: (lead: Lead) => void
  new_message: (message: Message & { lead?: Lead }) => void
  message_sent: (message: Message & { lead?: Lead }) => void
  message_updated: (message: Message & { lead?: Lead }) => void
  notification_created: (notification: Notification) => void
}

export type ClientToServerEvents = Record<string, never>

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SOCKET_URL,
  {
    autoConnect: false,
    transports: ['websocket', 'polling'],
  },
)
