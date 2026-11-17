import type { ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  ancho?: 'md' | 'lg'
}

export function Modal({ abierto, titulo, onCerrar, children, ancho = 'md' }: ModalProps) {
  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCerrar}
    >
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white shadow-xl ${ancho === 'lg' ? 'max-w-2xl' : 'max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button
            onClick={onCerrar}
            className="rounded p-1 text-2xl leading-none text-stone-400 hover:text-stone-700"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
