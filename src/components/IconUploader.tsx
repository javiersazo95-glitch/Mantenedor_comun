import { useEffect, useRef, useState } from 'react'
import { ImageOff, Trash2, Upload } from 'lucide-react'
import { TIPOS_ICONO, validarArchivoIcono } from '@/utils/validators'

export function IconUploader({
  urlActual,
  onSubir,
  onQuitar,
  etiqueta = 'Ícono',
  ocupado,
}: {
  urlActual: string | null
  onSubir: (archivo: File) => Promise<void>
  onQuitar?: () => Promise<void>
  etiqueta?: string
  ocupado?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  async function onArchivo(archivo: File | undefined) {
    if (!archivo) return
    const invalido = validarArchivoIcono(archivo)
    setError(invalido)
    if (invalido) return
    setPreview(URL.createObjectURL(archivo))
    try {
      await onSubir(archivo)
    } catch (err) {
      setPreview(null)
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo.')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const src = preview ?? urlActual

  return (
    <div className="campo">
      <span>{etiqueta}</span>
      <div className="icon-uploader">
        <div className="icon-uploader-preview" aria-label={src ? `${etiqueta} actual` : `Sin ${etiqueta.toLowerCase()}`}>
          {src ? <img src={src} alt="" /> : <ImageOff size={20} className="texto-suave" />}
        </div>
        <div className="icon-uploader-acciones">
          <input
            ref={inputRef}
            type="file"
            accept={TIPOS_ICONO.join(',')}
            className="oculto-visual"
            aria-label={`Archivo de ${etiqueta.toLowerCase()}`}
            onChange={(e) => void onArchivo(e.target.files?.[0])}
            disabled={ocupado}
          />
          <button type="button" className="boton boton-secundario boton-pequeno" onClick={() => inputRef.current?.click()} disabled={ocupado}>
            <Upload size={14} /> {src ? 'Reemplazar' : 'Subir'}
          </button>
          {src && onQuitar && (
            <button
              type="button"
              className="boton boton-fantasma boton-pequeno"
              onClick={() => {
                setPreview(null)
                void onQuitar()
              }}
              disabled={ocupado}
            >
              <Trash2 size={14} /> Quitar
            </button>
          )}
          <span className="campo-ayuda">SVG, PNG o WebP, máximo 512 KB.</span>
          {error && <span className="campo-error">{error}</span>}
        </div>
      </div>
    </div>
  )
}
