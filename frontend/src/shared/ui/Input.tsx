import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const claseCampo =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-100'

interface CampoProps {
  label: string
  error?: string
  children: ReactNode
}

/** Envuelve un campo con su label y el mensaje de error */
export function Campo({ label, error, children }: CampoProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <Campo label={label} error={error}>
      <input className={`${claseCampo} ${className}`} {...props} />
    </Campo>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <Campo label={label} error={error}>
      <textarea className={`${claseCampo} ${className}`} rows={3} {...props} />
    </Campo>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  children: ReactNode
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <Campo label={label} error={error}>
      <select className={`${claseCampo} ${className}`} {...props}>
        {children}
      </select>
    </Campo>
  )
}

/** Junta los errores de TanStack Form en un string (solo si el campo fue tocado) */
export function mostrarErrores(errores: unknown[], tocado: boolean): string | undefined {
  if (!tocado) return undefined
  const mensajes = errores.filter((e): e is string => typeof e === 'string' && e.length > 0)
  return mensajes.length > 0 ? mensajes.join(', ') : undefined
}
