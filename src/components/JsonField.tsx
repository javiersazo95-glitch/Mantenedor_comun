import { useState } from 'react'

/**
 * Editor de JSON pequeño para `metadata`. Mantiene el texto mientras se escribe y solo
 * propaga cuando el JSON es válido; si no, muestra el error y deja el valor anterior.
 * El valor inicial se toma al montar: los formularios que lo usan se montan con `key` por registro.
 */
export function JsonField({
  valor,
  onCambio,
  etiqueta = 'Metadata (JSON)',
  ayuda,
}: {
  valor: Record<string, unknown> | null
  onCambio: (v: Record<string, unknown> | null, valido: boolean) => void
  etiqueta?: string
  ayuda?: string
}) {
  const [texto, setTexto] = useState(() => (valor ? JSON.stringify(valor, null, 2) : ''))
  const [error, setError] = useState<string | null>(null)

  function onTexto(t: string) {
    setTexto(t)
    if (!t.trim()) {
      setError(null)
      onCambio(null, true)
      return
    }
    try {
      const parsed = JSON.parse(t) as unknown
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setError('Debe ser un objeto JSON, por ejemplo {"clave": "valor"}.')
        onCambio(valor, false)
        return
      }
      setError(null)
      onCambio(parsed as Record<string, unknown>, true)
    } catch {
      setError('JSON inválido.')
      onCambio(valor, false)
    }
  }

  return (
    <label className="campo">
      <span>{etiqueta}</span>
      <textarea className="mono" value={texto} onChange={(e) => onTexto(e.target.value)} spellCheck={false} rows={4} />
      {ayuda && <span className="campo-ayuda">{ayuda}</span>}
      {error && <span className="campo-error">{error}</span>}
    </label>
  )
}
