export { existeIconoLucide } from './lucide'

const HEX = /^#[0-9a-fA-F]{6}$/

export function esColorValido(valor: string | null | undefined): boolean {
  return !valor || HEX.test(valor)
}

export function esColorHex(valor: string | null | undefined): boolean {
  return !!valor && HEX.test(valor)
}

export const TIPOS_ICONO = ['image/svg+xml', 'image/png', 'image/webp']
export const TAMANO_MAXIMO_ICONO = 512 * 1024

/** Misma regla que el backend (MantenedorIconoService): tipo y tamaño. El sanitizado del SVG lo hace el servidor. */
export function validarArchivoIcono(archivo: File): string | null {
  if (!TIPOS_ICONO.includes(archivo.type)) return 'Solo se aceptan SVG, PNG o WebP.'
  if (archivo.size > TAMANO_MAXIMO_ICONO) return 'El archivo supera los 512 KB.'
  return null
}

/** Clave de flag: cliente.zona.componente en kebab-case. */
export const CLAVE_FLAG = /^[a-z0-9]+(\.[a-z0-9-]+)+$/
