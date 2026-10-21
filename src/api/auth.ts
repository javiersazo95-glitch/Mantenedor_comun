import apiClient from './client'
import type { LoginResponse, Rol, Usuario, UsuarioBackendResponse, UsuarioResumenResponse } from '@/types/auth'

function mapRol(rol: string | undefined): Rol {
  const r = (rol ?? '').toUpperCase()
  if (r === 'SUPER_ADMIN') return 'SUPER_ADMIN'
  if (r === 'ADMIN') return 'ADMIN'
  if (r === 'OPERADOR' || r === 'OPERATOR') return 'OPERADOR'
  if (r === 'CAPTADOR') return 'CAPTADOR'
  return 'OTRO'
}

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '??'
}

/** El backend responde a veces en castellano (`usuario`) y a veces con el resumen en inglés (`user`). */
export function mapUsuario(data: UsuarioBackendResponse | UsuarioResumenResponse): Usuario {
  if ('fullName' in data) {
    return {
      id: data.id,
      email: data.username,
      nombre: data.fullName,
      iniciales: data.initials || iniciales(data.fullName),
      rol: mapRol(data.role),
    }
  }
  return {
    id: data.id,
    email: data.email,
    nombre: data.nombre,
    iniciales: iniciales(data.nombre),
    rol: mapRol(data.rol),
  }
}

export async function login(email: string, password: string): Promise<{ token: string; usuario: Usuario }> {
  const { data } = await apiClient.post<LoginResponse>('/auth/backoffice/login', {
    email: email.trim(),
    password,
    authProvider: 'EMAIL_PASSWORD',
  })
  const token = data.token ?? data.accessToken
  const crudo = data.user ?? data.usuario
  if (!token || !crudo) throw new Error('Respuesta de autenticación inválida')
  return { token, usuario: mapUsuario(crudo) }
}

export async function me(): Promise<Usuario> {
  const { data } = await apiClient.get<UsuarioBackendResponse | UsuarioResumenResponse>('/auth/me')
  return mapUsuario(data)
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout')
  } catch {
    // Si el token ya caducó el backend responde 401; igual se limpia la sesión local.
  }
}
