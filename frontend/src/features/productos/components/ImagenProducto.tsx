import { useState } from 'react'

interface ImagenProductoProps {
  url: string | null
  alt: string
  className?: string
}

/** Muestra la imagen del producto o un placeholder si no hay o si falla la URL */
export function ImagenProducto({ url, alt, className = '' }: ImagenProductoProps) {
  const [fallo, setFallo] = useState(false)

  if (!url || fallo) {
    return (
      <div className={`flex items-center justify-center bg-marca-50 text-4xl ${className}`}>🍽️</div>
    )
  }

  return <img src={url} alt={alt} className={`object-cover ${className}`} onError={() => setFallo(true)} />
}
