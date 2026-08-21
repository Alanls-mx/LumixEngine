import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { authApi } from '@/lib/api'
import { clearAuthToken, getAuthToken, setAuthToken } from '@/lib/authToken'
import type { User } from '@/types/lead'

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: { email: string; password: string }) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  bootstrap: (payload: { nome: string; email: string; password: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(getAuthToken()))

  useEffect(() => {
    const token = getAuthToken()

    if (!token) {
      setIsLoading(false)
      return
    }

    authApi
      .me()
      .then((response) => setUser(response.user))
      .catch(() => {
        clearAuthToken()
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const persistSession = useCallback((token: string, nextUser: User) => {
    setAuthToken(token)
    setUser(nextUser)
  }, [])

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const response = await authApi.login(payload)
      persistSession(response.token, response.user)
    },
    [persistSession],
  )

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      const response = await authApi.google(credential)
      persistSession(response.token, response.user)
    },
    [persistSession],
  )

  const bootstrap = useCallback(
    async (payload: { nome: string; email: string; password: string }) => {
      const response = await authApi.bootstrap(payload)
      persistSession(response.token, response.user)
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    clearAuthToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      loginWithGoogle,
      bootstrap,
      logout,
    }),
    [bootstrap, isLoading, login, loginWithGoogle, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return value
}
