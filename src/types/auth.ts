export type Rol = 'SUPER_ADMIN' | 'ADMIN' | 'OPERADOR' | 'CAPTADOR' | 'OTRO'

export interface Usuario {
  id: number
  email: string
  nombre: string
  iniciales: string
  rol: Rol
}

/** Respuesta de `POST /auth/backoffice/login` y de `GET /auth/me` (ambas formas que usa el backend). */
export interface LoginResponse {
  token?: string
  accessToken?: string
  usuario?: UsuarioBackendResponse
  user?: UsuarioResumenResponse
}

export interface UsuarioBackendResponse {
  id: number
  nombre: string
  email: string
  rol: string
}

export interface UsuarioResumenResponse {
  id: number
  username: string
  fullName: string
  initials: string
  role: string
}
