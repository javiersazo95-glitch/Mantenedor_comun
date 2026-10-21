import { esColorHex, esColorValido } from '@/utils/validators'

export function ColorField({ valor, onCambio, etiqueta = 'Color' }: { valor: string | null; onCambio: (v: string | null) => void; etiqueta?: string }) {
  return (
    <label className="campo">
      <span>{etiqueta}</span>
      <div className="campo-inline">
        <input type="color" value={esColorHex(valor) ? (valor as string) : '#94a3b8'} onChange={(e) => onCambio(e.target.value)} aria-label={`${etiqueta} (selector)`} />
        <input
          type="text"
          value={valor ?? ''}
          placeholder="#rrggbb"
          onChange={(e) => onCambio(e.target.value.trim() || null)}
          aria-label={`${etiqueta} (hexadecimal)`}
          className="mono"
          style={{ width: 110 }}
        />
        {valor && (
          <button type="button" className="boton boton-fantasma boton-pequeno" onClick={() => onCambio(null)}>
            Sin color
          </button>
        )}
      </div>
      {!esColorValido(valor) && <span className="campo-error">Usa formato #rrggbb.</span>}
    </label>
  )
}
