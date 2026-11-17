import { handleApiError } from '../api/handleApiError'

interface EstadoErrorProps {
  error: unknown
  onReintentar?: () => void
}

export function EstadoError({ error, onReintentar }: EstadoErrorProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
      <p className="font-semibold">No se pudieron cargar los datos</p>
      <p className="mt-1 text-sm">{handleApiError(error)}</p>
      {onReintentar && (
        <button
          onClick={onReintentar}
          className="mt-4 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm hover:bg-red-100"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
