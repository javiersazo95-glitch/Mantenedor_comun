export function Toggle({
  checked,
  onChange,
  disabled,
  etiqueta,
  title,
  ariaLabel,
}: {
  checked: boolean
  onChange: (valor: boolean) => void
  disabled?: boolean
  etiqueta?: string
  title?: string
  /** Nombre accesible cuando no hay texto visible (interruptores dentro de una fila de tabla). */
  ariaLabel?: string
}) {
  return (
    <label className="toggle" title={title}>
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? etiqueta}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-pista" aria-hidden />
      {etiqueta && <span>{etiqueta}</span>}
    </label>
  )
}
