interface AlertaProps {
  tipo?: 'error' | 'exito'
  mensaje: string | null
}

export function Alerta({ tipo = 'error', mensaje }: AlertaProps) {
  if (!mensaje) return null
  const estilos =
    tipo === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-green-200 bg-green-50 text-green-700'
  return <div className={`rounded-lg border px-3 py-2 text-sm ${estilos}`}>{mensaje}</div>
}
