import { dynamicIconImports } from 'lucide-react/dynamic'

/**
 * El Market y la app guardan el ícono de categoría como nombre de componente lucide en
 * PascalCase ("Disc3", "CircleDot"). `DynamicIcon` lo carga por su nombre en kebab-case
 * ("disc-3", "circle-dot") sin meter los 1.500 íconos en el bundle.
 */
export function aNombreLucide(nombre: string): string {
  return nombre
    .trim()
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .replace(/([0-9])([A-Za-z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase()
}

export function existeIconoLucide(nombre: string | null | undefined): boolean {
  if (!nombre) return false
  return aNombreLucide(nombre) in dynamicIconImports
}
