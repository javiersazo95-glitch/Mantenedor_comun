import { describe, expect, it } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { estadoHttpDe, mensajeDeError, normalizarBaseUrl } from './client'

function errorHttp(status: number, data?: unknown): AxiosError {
  const headers = new AxiosHeaders()
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', { headers }, null, {
    status,
    statusText: '',
    headers: {},
    config: { headers },
    data,
  })
}

describe('normalizarBaseUrl', () => {
  it('siempre termina en /api/v1', () => {
    expect(normalizarBaseUrl(undefined)).toBe('/api/v1')
    expect(normalizarBaseUrl('http://localhost:8080')).toBe('http://localhost:8080/api/v1')
    expect(normalizarBaseUrl('https://api.repuestop.cl/')).toBe('https://api.repuestop.cl/api/v1')
    expect(normalizarBaseUrl('https://api.repuestop.cl/api')).toBe('https://api.repuestop.cl/api/v1')
    expect(normalizarBaseUrl('https://api.repuestop.cl/api/v1')).toBe('https://api.repuestop.cl/api/v1')
  })
})

describe('mensajeDeError', () => {
  it('prefiere el message del ApiErrorDTO del backend', () => {
    expect(mensajeDeError(errorHttp(400, { message: 'La marca ya existe' }))).toBe('La marca ya existe')
  })
  it('traduce 403 y 404 a texto en castellano', () => {
    expect(mensajeDeError(errorHttp(403))).toMatch(/permiso/)
    expect(mensajeDeError(errorHttp(404))).toMatch(/ya no existe/)
  })
  it('usa el fallback para errores desconocidos', () => {
    expect(mensajeDeError('x', 'Falló')).toBe('Falló')
    expect(mensajeDeError(new Error('boom'))).toBe('boom')
  })
})

describe('estadoHttpDe', () => {
  it('devuelve el código o null', () => {
    expect(estadoHttpDe(errorHttp(500))).toBe(500)
    expect(estadoHttpDe(new Error('x'))).toBeNull()
  })
})
