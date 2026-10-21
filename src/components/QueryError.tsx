import { mensajeDeError } from '@/api/client'

/** Error de carga con reintento. Nunca se muestra un 0 o una tabla vacía como si fuera un dato real. */
export function QueryError({ error, onReintentar }: { error: unknown; onReintentar?: () => void }) {
  return (
    <div className="mensaje-error" role="alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span>{mensajeDeError(error, 'No se pudo cargar la información.')}</span>
      {onReintentar && (
        <button type="button" className="boton boton-secundario boton-pequeno" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  )
}
