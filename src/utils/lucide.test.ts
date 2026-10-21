import { describe, expect, it } from 'vitest'
import { aNombreLucide, existeIconoLucide } from './lucide'

describe('aNombreLucide', () => {
  it('convierte el PascalCase que usan Market y app al kebab-case de DynamicIcon', () => {
    expect(aNombreLucide('Disc3')).toBe('disc-3')
    expect(aNombreLucide('CircleDot')).toBe('circle-dot')
    expect(aNombreLucide('Settings2')).toBe('settings-2')
    expect(aNombreLucide('Wrench')).toBe('wrench')
    expect(aNombreLucide('zoom-in')).toBe('zoom-in')
  })
})

describe('existeIconoLucide', () => {
  it('reconoce nombres reales en cualquiera de los dos formatos', () => {
    expect(existeIconoLucide('Disc3')).toBe(true)
    expect(existeIconoLucide('disc-3')).toBe(true)
    expect(existeIconoLucide('Wrench')).toBe(true)
    expect(existeIconoLucide('NoExiste')).toBe(false)
    expect(existeIconoLucide(null)).toBe(false)
  })
})
