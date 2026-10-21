import { ImageOff } from 'lucide-react'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { aNombreLucide, existeIconoLucide } from '@/utils/lucide'

/**
 * Vista en miniatura del ícono de una fila: primero el archivo subido, si no el nombre lucide
 * (que es lo que usan hoy el Market y la app como fallback), si no un marcador vacío.
 */
export function IconoCatalogo({ iconoUrl, iconoNombre, color, alt = '' }: { iconoUrl: string | null; iconoNombre?: string | null; color?: string | null; alt?: string }) {
  if (iconoUrl) return <img className="icono-tabla" src={iconoUrl} alt={alt} loading="lazy" />
  if (existeIconoLucide(iconoNombre)) {
    return (
      <span className="icono-vacio" style={{ color: color ?? undefined, borderStyle: 'solid' }} title={`lucide: ${iconoNombre}`}>
        <DynamicIcon name={aNombreLucide(iconoNombre as string) as IconName} size={18} />
      </span>
    )
  }
  return (
    <span className="icono-vacio" title="Sin ícono">
      <ImageOff size={14} />
    </span>
  )
}
