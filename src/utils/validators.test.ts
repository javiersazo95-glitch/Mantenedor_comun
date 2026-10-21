import { describe, expect, it } from 'vitest'
import { CLAVE_FLAG, esColorValido, existeIconoLucide, validarArchivoIcono } from './validators'
import { slugificar } from './slug'

function archivo(tipo: string, bytes: number): File {
  return new File([new Uint8Array(bytes)], 'icono', { type: tipo })
}

describe('validarArchivoIcono', () => {
  it('acepta SVG, PNG y WebP de hasta 512 KB', () => {
    expect(validarArchivoIcono(archivo('image/svg+xml', 1024))).toBeNull()
    expect(validarArchivoIcono(archivo('image/png', 512 * 1024))).toBeNull()
    expect(validarArchivoIcono(archivo('image/webp', 10))).toBeNull()
  })

  it('rechaza otros tipos y archivos grandes', () => {
    expect(validarArchivoIcono(archivo('image/jpeg', 10))).toMatch(/SVG, PNG o WebP/)
    expect(validarArchivoIcono(archivo('image/png', 512 * 1024 + 1))).toMatch(/512 KB/)
  })
})

describe('esColorValido', () => {
  it('acepta vacío y hexadecimal de 6 dígitos', () => {
    expect(esColorValido(null)).toBe(true)
    expect(esColorValido('')).toBe(true)
    expect(esColorValido('#ef4444')).toBe(true)
  })
  it('rechaza otros formatos', () => {
    expect(esColorValido('#fff')).toBe(false)
    expect(esColorValido('rojo')).toBe(false)
  })
})

describe('existeIconoLucide', () => {
  it('reconoce nombres reales de lucide', () => {
    expect(existeIconoLucide('Disc3')).toBe(true)
    expect(existeIconoLucide('Wrench')).toBe(true)
    expect(existeIconoLucide('NoExiste')).toBe(false)
    expect(existeIconoLucide(null)).toBe(false)
  })
})

describe('CLAVE_FLAG', () => {
  it('exige cliente.zona.componente en kebab-case', () => {
    expect(CLAVE_FLAG.test('market.home.hero-patente')).toBe(true)
    expect(CLAVE_FLAG.test('global.mantenimiento')).toBe(true)
    expect(CLAVE_FLAG.test('Market.Home')).toBe(false)
    expect(CLAVE_FLAG.test('sinpunto')).toBe(false)
  })
})

describe('slugificar', () => {
  it('quita tildes, baja a minúsculas y usa guiones', () => {
    expect(slugificar('Sistema de Frenos')).toBe('sistema-de-frenos')
    expect(slugificar('Suspensión & Dirección')).toBe('suspension-direccion')
    expect(slugificar('  Kia Motors ')).toBe('kia-motors')
  })
})
