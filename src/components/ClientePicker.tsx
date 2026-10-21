import { CLIENTES, CLIENTE_LABEL, type Cliente } from '@/types/comun'
import { parsearClientes, serializarClientes } from '@/utils/clientes'

/** Selector de un único cliente (flags). */
export function ClientePicker({ valor, onCambio, etiqueta = 'Cliente' }: { valor: Cliente; onCambio: (c: Cliente) => void; etiqueta?: string }) {
  return (
    <label className="campo">
      <span>{etiqueta}</span>
      <select value={valor} onChange={(e) => onCambio(e.target.value as Cliente)}>
        {CLIENTES.map((c) => (
          <option key={c} value={c}>
            {CLIENTE_LABEL[c]}
          </option>
        ))}
      </select>
    </label>
  )
}

/** Selector de varios clientes como CSV (listas y opciones: `APP,MARKET` o `TODOS`). */
export function ClientesMultiPicker({ valor, onCambio, etiqueta = 'Clientes donde aplica' }: { valor: string; onCambio: (csv: string) => void; etiqueta?: string }) {
  const seleccion = parsearClientes(valor)
  const todos = seleccion.includes('TODOS')

  function alternar(c: Cliente) {
    if (c === 'TODOS') {
      onCambio('TODOS')
      return
    }
    const sin = seleccion.filter((x) => x !== 'TODOS')
    const nuevo = sin.includes(c) ? sin.filter((x) => x !== c) : [...sin, c]
    onCambio(serializarClientes(nuevo))
  }

  return (
    <div className="campo">
      <span>{etiqueta}</span>
      <div className="campo-inline" style={{ flexWrap: 'wrap' }}>
        {CLIENTES.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip-filtro${(c === 'TODOS' ? todos : !todos && seleccion.includes(c)) ? ' activo' : ''}`}
            onClick={() => alternar(c)}
          >
            {CLIENTE_LABEL[c]}
          </button>
        ))}
      </div>
    </div>
  )
}
