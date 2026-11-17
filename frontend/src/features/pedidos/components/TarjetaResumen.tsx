interface TarjetaResumenProps {
  titulo: string
  valor: string | number
  icono: string
  color?: string
}

export function TarjetaResumen({ titulo, valor, icono, color = 'bg-white' }: TarjetaResumenProps) {
  return (
    <div className={`rounded-xl border border-stone-200 p-5 shadow-sm ${color}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500">{titulo}</p>
        <span className="text-2xl">{icono}</span>
      </div>
      <p className="mt-2 text-3xl font-bold">{valor}</p>
    </div>
  )
}
