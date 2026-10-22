import { describe, expect, it } from 'vitest'
import { entradaDesdeValor, formatearFecha, formatearValorParametro, normalizarEntradaParametro } from './format'

describe('normalizarEntradaParametro', () => {
  it('convierte porcentajes escritos por humanos a fracción para el backend', () => {
    expect(normalizarEntradaParametro('7', 'PERCENT', null, null)).toBe('0.07')
    expect(normalizarEntradaParametro('2,89', 'PERCENT', null, null)).toBe('0.0289')
    expect(normalizarEntradaParametro('10 %', 'PERCENT', null, null)).toBe('0.1')
  })

  it('respeta mínimo y máximo con mensajes legibles', () => {
    expect(() => normalizarEntradaParametro('60', 'PERCENT', 0, 0.5)).toThrow(/máximo/)
    expect(() => normalizarEntradaParametro('-1', 'NUMBER', 0, null)).toThrow(/mínimo/)
  })

  it('acepta números con separador chileno', () => {
    expect(normalizarEntradaParametro('100.000', 'MONEY', null, null)).toBe('100000')
    expect(normalizarEntradaParametro('30', 'NUMBER', null, null)).toBe('30')
  })

  it('valida booleanos y JSON', () => {
    expect(normalizarEntradaParametro('true', 'BOOLEAN', null, null)).toBe('true')
    expect(() => normalizarEntradaParametro('sí', 'BOOLEAN', null, null)).toThrow()
    expect(normalizarEntradaParametro('{ "a": 1 }', 'JSON', null, null)).toBe('{"a":1}')
    expect(() => normalizarEntradaParametro('{a:1}', 'JSON', null, null)).toThrow(/JSON/)
  })
})

describe('formatearValorParametro / entradaDesdeValor', () => {
  it('muestra la fracción como porcentaje y la recupera como entrada', () => {
    expect(formatearValorParametro('0.07', 'PERCENT')).toMatch(/7\s?%/)
    expect(entradaDesdeValor('0.0289', 'PERCENT')).toBe('2.89')
  })
  it('muestra dinero en pesos y booleanos en castellano', () => {
    expect(formatearValorParametro('100000', 'MONEY')).toMatch(/100\.000/)
    expect(formatearValorParametro('false', 'BOOLEAN')).toBe('No')
  })
})

describe('formatearFecha', () => {
  it('usa dd-mm-aaaa hh:mm con año de 4 dígitos (el corto de es-CL se lee como 2022)', () => {
    expect(formatearFecha('2026-10-22T03:21:00')).toBe('22-10-2026 03:21')
    expect(formatearFecha('2026-10-22T03:21:00', false)).toBe('22-10-2026')
  })
  it('tolera vacío y valores inválidos', () => {
    expect(formatearFecha(null)).toBe('—')
    expect(formatearFecha('no es fecha')).toBe('no es fecha')
  })
})
