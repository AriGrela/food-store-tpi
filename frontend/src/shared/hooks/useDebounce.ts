import { useEffect, useState } from 'react'

/** Devuelve el valor despues de que el usuario deja de escribir (no hace fetch, solo espera) */
export function useDebounce<T>(valor: T, ms = 400): T {
  const [debounced, setDebounced] = useState(valor)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(valor), ms)
    return () => clearTimeout(timer)
  }, [valor, ms])

  return debounced
}
