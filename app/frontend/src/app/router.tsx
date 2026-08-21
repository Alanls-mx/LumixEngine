import { createBrowserRouter, Navigate } from 'react-router-dom'

import { RootRoute } from '@/app/RootRoute'
import { CrmPage } from '@/routes/CrmPage'
import { DashboardPage } from '@/routes/DashboardPage'
import { InboxPage } from '@/routes/InboxPage'
import { SettingsPage } from '@/routes/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRoute />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'crm',
        element: <CrmPage />,
      },
      {
        path: 'inbox',
        element: <InboxPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
