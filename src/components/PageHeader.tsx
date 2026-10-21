import type { ReactNode } from 'react'

export function PageHeader({ titulo, descripcion, acciones }: { titulo: ReactNode; descripcion?: ReactNode; acciones?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {acciones && <div className="page-header-acciones">{acciones}</div>}
    </header>
  )
}
