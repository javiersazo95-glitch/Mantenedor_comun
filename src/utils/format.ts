import type { TipoParametro } from '@/types/parametros'

const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
const numero = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 6 })

/** dd-mm-aaaa hh:mm. El formato corto de es-CL ("22-10-26") se lee como año 2022, así que se arma a mano. */
export function formatearFecha(iso: string | null | undefined, conHora = true): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const p = (n: number) => String(n).padStart(2, '0')
  const fecha = `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`
  return conHora ? `${fecha} ${p(d.getHours())}:${p(d.getMinutes())}` : fecha
}

/** Muestra el valor de un parámetro según su tipo (el backend lo guarda siempre como texto). */
export function formatearValorParametro(valor: string, tipo: TipoParametro, unidad?: string | null): string {
  switch (tipo) {
    case 'PERCENT': {
      const n = Number(valor)
      return Number.isFinite(n) ? `${numero.format(n * 100)} %` : valor
    }
    case 'MONEY': {
      const n = Number(valor)
      return Number.isFinite(n) ? clp.format(n) : valor
    }
    case 'NUMBER': {
      const n = Number(valor)
      return Number.isFinite(n) ? `${numero.format(n)}${unidad ? ` ${unidad}` : ''}` : valor
    }
    case 'BOOLEAN':
      return valor === 'true' ? 'Sí' : 'No'
    case 'JSON':
      return valor.length > 60 ? `${valor.slice(0, 57)}…` : valor
    default:
      return valor
  }
}

/** Convierte lo que escribe el usuario al texto que espera el backend. Lanza con mensaje claro si no calza. */
export function normalizarEntradaParametro(entrada: string, tipo: TipoParametro, minimo: number | null, maximo: number | null): string {
  const texto = entrada.trim()
  switch (tipo) {
    case 'PERCENT': {
      // Se escribe en porcentaje (7 = 7 %) y se guarda como fracción (0.07), que es como lo lee el backend.
      const n = Number(texto.replace(',', '.').replace('%', ''))
      if (!Number.isFinite(n)) throw new Error('Escribe un porcentaje, por ejemplo 7 o 2,89.')
      const fraccion = n / 100
      validarRango(fraccion, minimo, maximo, (v) => `${numero.format(v * 100)} %`)
      return String(Number(fraccion.toFixed(6)))
    }
    case 'MONEY':
    case 'NUMBER': {
      const n = Number(texto.replace(/\./g, '').replace(',', '.'))
      if (!Number.isFinite(n)) throw new Error('Escribe un número.')
      validarRango(n, minimo, maximo, (v) => numero.format(v))
      return String(n)
    }
    case 'BOOLEAN':
      if (texto !== 'true' && texto !== 'false') throw new Error('Elige Sí o No.')
      return texto
    case 'JSON':
      try {
        return JSON.stringify(JSON.parse(texto))
      } catch {
        throw new Error('JSON inválido.')
      }
    default:
      return texto
  }
}

function validarRango(n: number, minimo: number | null, maximo: number | null, fmt: (v: number) => string) {
  if (minimo !== null && n < minimo) throw new Error(`El mínimo permitido es ${fmt(minimo)}.`)
  if (maximo !== null && n > maximo) throw new Error(`El máximo permitido es ${fmt(maximo)}.`)
}

/** Valor del parámetro como lo escribe el usuario en el input (inverso de normalizarEntradaParametro). */
export function entradaDesdeValor(valor: string, tipo: TipoParametro): string {
  if (tipo === 'PERCENT') {
    const n = Number(valor)
    return Number.isFinite(n) ? String(Number((n * 100).toFixed(4))) : valor
  }
  return valor
}
