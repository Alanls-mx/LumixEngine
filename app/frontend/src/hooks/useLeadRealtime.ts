import { useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/queryClient'
import { socket } from '@/lib/socket'
import type { Lead, Message } from '@/types/lead'

function upsertLead(leads: Lead[] | undefined, incomingLead: Lead) {
  if (!leads) {
    return [incomingLead]
  }

  const exists = leads.some((lead) => lead.id === incomingLead.id)

  if (!exists) {
    return [incomingLead, ...leads]
  }

  return leads.map((lead) => (lead.id === incomingLead.id ? incomingLead : lead))
}

function upsertMessage(
  leads: Lead[] | undefined,
  incomingMessage: Message & { lead?: Lead },
) {
  if (!leads) {
    return leads
  }

  return leads.map((lead) => {
    if (lead.id !== incomingMessage.lead_id) {
      return lead
    }

    const isSameMessage = (message: Message) =>
      message.id === incomingMessage.id ||
      (Boolean(message.client_request_id) &&
        message.client_request_id === incomingMessage.client_request_id) ||
      (Boolean(message.provider_message_id) &&
        message.provider_message_id === incomingMessage.provider_message_id)
    const messageExists = lead.messages.some(isSameMessage)
    const nextMessages = messageExists
      ? lead.messages.map((message) =>
          isSameMessage(message) ? { ...message, ...incomingMessage } : message,
        )
      : [incomingMessage, ...lead.messages]

    return {
      ...lead,
      last_interaction_at: incomingMessage.data_envio,
      messages: nextMessages
        .filter(
          (message, index, messages) =>
            messages.findIndex(
              (item) =>
                item.id === message.id ||
                (Boolean(item.client_request_id) &&
                  item.client_request_id === message.client_request_id) ||
                (Boolean(item.provider_message_id) &&
                  item.provider_message_id === message.provider_message_id),
            ) === index,
        )
        .sort(
          (a, b) =>
            new Date(b.data_envio).getTime() - new Date(a.data_envio).getTime(),
        ),
    }
  })
}

export function useLeadRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleNewLead = (lead: Lead) => {
      queryClient.setQueryData<Lead[]>(queryKeys.leads, (currentLeads) =>
        upsertLead(currentLeads, lead),
      )
    }

    const handleLeadUpdated = (lead: Lead) => {
      queryClient.setQueryData<Lead[]>(queryKeys.leads, (currentLeads) =>
        upsertLead(currentLeads, lead),
      )
    }

    const handleMessage = (message: Message & { lead?: Lead }) => {
      queryClient.setQueryData<Lead[]>(queryKeys.leads, (currentLeads) =>
        upsertMessage(currentLeads, message),
      )
    }

    socket.connect()
    socket.on('new_lead', handleNewLead)
    socket.on('lead_updated', handleLeadUpdated)
    socket.on('lead_assigned', handleLeadUpdated)
    socket.on('new_message', handleMessage)
    socket.on('message_sent', handleMessage)
    socket.on('message_updated', handleMessage)

    return () => {
      socket.off('new_lead', handleNewLead)
      socket.off('lead_updated', handleLeadUpdated)
      socket.off('lead_assigned', handleLeadUpdated)
      socket.off('new_message', handleMessage)
      socket.off('message_sent', handleMessage)
      socket.off('message_updated', handleMessage)
      socket.disconnect()
    }
  }, [queryClient])
}
