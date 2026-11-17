import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamanio?: 'sm' | 'md'
  cargando?: boolean
}

const estilosVariante: Record<Variante, string> = {
  primario: 'bg-marca-600 text-white hover:bg-marca-700',
  secundario: 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
  fantasma: 'text-stone-600 hover:bg-stone-100',
}

export function Button({
  variante = 'primario',
  tamanio = 'md',
  cargando = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const tam = tamanio === 'sm' ? 'px-2.5 py-1 text-sm' : 'px-4 py-2'
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tam} ${estilosVariante[variante]} ${className}`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
