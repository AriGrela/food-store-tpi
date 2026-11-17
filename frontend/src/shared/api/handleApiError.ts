import { isAxiosError } from 'axios'

interface ErrorValidacion {
  loc: (string | number)[]
  msg: string
}

/** Convierte el error de la API (campo detail) en un mensaje para mostrar en pantalla */
export function handleApiError(error: unknown): string {
  if (isAxiosError<{ detail?: string | ErrorValidacion[] }>(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. ¿Está corriendo el backend?'
    }
    const detail = error.response.data?.detail
    if (typeof detail === 'string') {
      return detail
    }
    // errores 422 de FastAPI vienen como lista
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((d) => `${String(d.loc[d.loc.length - 1])}: ${d.msg}`)
        .join(' | ')
    }
    return `Error ${error.response.status}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Ocurrió un error inesperado'
}
