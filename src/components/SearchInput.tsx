import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

/** Buscador con retardo: evita una petición por tecla. El valor inicial se toma al montar. */
export function SearchInput({
  valorInicial = '',
  onCambio,
  placeholder = 'Buscar…',
  retardoMs = 300,
}: {
  valorInicial?: string
  onCambio: (valor: string) => void
  placeholder?: string
  retardoMs?: number
}) {
  const [local, setLocal] = useState(valorInicial)
  const [emitido, setEmitido] = useState(valorInicial)

  useEffect(() => {
    if (local === emitido) return
    const t = window.setTimeout(() => {
      setEmitido(local)
      onCambio(local)
    }, retardoMs)
    return () => window.clearTimeout(t)
  }, [local, emitido, onCambio, retardoMs])

  return (
    <div className="buscador">
      <Search size={15} aria-hidden />
      <input type="search" value={local} onChange={(e) => setLocal(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </div>
  )
}
