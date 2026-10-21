import type { ReactNode } from 'react'

export type TonoBadge = 'gris' | 'verde' | 'rojo' | 'ambar' | 'azul' | 'violeta' | 'teal'

export function Badge({ tono = 'gris', children, title }: { tono?: TonoBadge; children: ReactNode; title?: string }) {
  return (
    <span className={`badge badge-${tono}`} title={title}>
      {children}
    </span>
  )
}

export function BadgeActivo({ activo }: { activo: boolean }) {
  return <Badge tono={activo ? 'verde' : 'gris'}>{activo ? 'Activo' : 'Inactivo'}</Badge>
}
