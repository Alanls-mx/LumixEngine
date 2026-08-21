import { createBrowserRouter, Navigate } from 'react-router-dom'

import { ProtectedRoute } from '@/app/ProtectedRoute'
import { RootRoute } from '@/app/RootRoute'
import { CrmPage } from '@/routes/CrmPage'
import { DashboardPage } from '@/routes/DashboardPage'
import { InboxPage } from '@/routes/InboxPage'
import { LoginPage } from '@/routes/LoginPage'
import { SettingsPage } from '@/routes/SettingsPage'
import { TeamsPage } from '@/routes/TeamsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RootRoute />
      </ProtectedRoute>
    ),
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
        path: 'teams',
        element: <TeamsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
