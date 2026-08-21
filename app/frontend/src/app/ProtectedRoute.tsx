import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/lib/AuthProvider'

import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.isLoading) {
    return (
      <div className="grid min-h-svh place-items-center bg-[#090d16] text-sm font-semibold text-white">
        Carregando sessão...
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
