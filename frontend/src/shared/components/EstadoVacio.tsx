import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  mensaje?: string
  accion?: ReactNode
}

export function EstadoVacio({ titulo, mensaje, accion }: EstadoVacioProps) {
  return (
    <div className="rounded-xl border-2 border-dashed border-stone-300 bg-white px-6 py-12 text-center">
      <div className="text-4xl">🍽️</div>
      <h3 className="mt-3 text-lg font-semibold">{titulo}</h3>
      {mensaje && <p className="mt-1 text-stone-500">{mensaje}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}
