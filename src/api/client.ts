import axios, { type AxiosInstance } from 'axios'

/**
 * Base de la API. `VITE_API_URL` viene sin `/api/v1` (igual que en vendedor_panel); si falta,
 * se usa la ruta relativa y el proxy de Vite la manda a localhost:8080.
 */
export function normalizarBaseUrl(base?: string): string {
  const limpia = base?.trim().replace(/\/+$/, '') ?? ''
  if (!limpia) return '/api/v1'
  if (limpia.endsWith('/api/v1')) return limpia
  if (limpia.endsWith('/api')) return `${limpia}/v1`
  return `${limpia}/api/v1`
}

export const API_BASE_URL = normalizarBaseUrl(import.meta.env.VITE_API_URL)

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    // El backend distingue el origen de cada llamada por esta cabecera (ClientOriginFilter).
    'X-Client': 'mantenedor',
  },
})

const RUTAS_DE_SESION = ['/auth/backoffice/login', '/auth/login', '/auth/logout', '/auth/refresh']

let alCaducarSesion: (() => void) | null = null

/**
 * AuthContext registra aquí cómo cerrar la sesión. Se hace por registro y no por import
 * porque AuthContext ya importa este módulo y una llamada directa crearía un ciclo.
 */
export function registrarManejadorDeSesionCaducada(handler: (() => void) | null) {
  alCaducarSesion = handler
}

export function aplicarAuthHeader(token: string | null) {
  if (token) apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete apiClient.defaults.headers.common['Authorization']
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = typeof error?.config?.url === 'string' ? error.config.url : ''
    if (status === 401 && !RUTAS_DE_SESION.some((ruta) => url.startsWith(ruta))) {
      alCaducarSesion?.()
    }
    return Promise.reject(error)
  },
)

/**
 * Mensaje legible de un error de red: primero el `message` del ApiErrorDTO del backend (es el
 * que explica el motivo real), luego el del error, luego el texto de respaldo.
 */
export function mensajeDeError(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown; error?: unknown } | undefined
    if (typeof data?.message === 'string' && data.message.trim()) return data.message
    if (typeof data?.error === 'string' && data.error.trim()) return data.error
    if (error.response?.status === 403) return 'No tienes permiso para realizar esta acción.'
    if (error.response?.status === 404) return 'El registro ya no existe.'
    if (!error.response) return 'No se pudo conectar con el servidor.'
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function estadoHttpDe(error: unknown): number | null {
  return axios.isAxiosError(error) && typeof error.response?.status === 'number' ? error.response.status : null
}

export default apiClient
