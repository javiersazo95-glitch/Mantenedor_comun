export function Toggle({
  checked,
  onChange,
  disabled,
  etiqueta,
  title,
}: {
  checked: boolean
  onChange: (valor: boolean) => void
  disabled?: boolean
  etiqueta?: string
  title?: string
}) {
  return (
    <label className="toggle" title={title}>
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        aria-label={etiqueta}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-pista" aria-hidden />
      {etiqueta && <span>{etiqueta}</span>}
    </label>
  )
}
