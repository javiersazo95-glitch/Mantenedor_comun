import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { registrarManejadorDeSesionCaducada, aplicarAuthHeader } from '@/api/client'
import * as authApi from '@/api/auth'
import type { Usuario } from '@/types/auth'

const TOKEN_KEY = 'repuestop.mantenedor.access-token'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
}

interface AuthContextValue extends AuthState {
  autenticado: boolean
  esSuperAdmin: boolean
  login: (email: string, password: string) => Promise<Usuario>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function leerToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function guardarToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // sessionStorage puede no estar disponible (modo privado): la sesión dura lo que dure la pestaña.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  // Solo hay algo que cargar si quedó un token de una sesión anterior en la pestaña.
  const [state, setState] = useState<AuthState>(() => ({ usuario: null, cargando: leerToken() !== null }))

  const cerrarLocal = useCallback(() => {
    guardarToken(null)
    aplicarAuthHeader(null)
    queryClient.clear()
    setState({ usuario: null, cargando: false })
  }, [queryClient])

  useEffect(() => {
    registrarManejadorDeSesionCaducada(cerrarLocal)
    return () => registrarManejadorDeSesionCaducada(null)
  }, [cerrarLocal])

  useEffect(() => {
    const token = leerToken()
    if (!token) return
    aplicarAuthHeader(token)
    authApi
      .me()
      .then((usuario) => setState({ usuario, cargando: false }))
      .catch(() => cerrarLocal())
  }, [cerrarLocal])

  const login = useCallback(async (email: string, password: string) => {
    const { token } = await authApi.login(email, password)
    guardarToken(token)
    aplicarAuthHeader(token)
    // /auth/me es la fuente de verdad del rol: el login puede responder con un resumen parcial.
    const usuario = await authApi.me()
    setState({ usuario, cargando: false })
    return usuario
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    cerrarLocal()
  }, [cerrarLocal])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      autenticado: state.usuario !== null,
      esSuperAdmin: state.usuario?.rol === 'SUPER_ADMIN',
      login,
      logout,
    }),
    [state, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
