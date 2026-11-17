import { useEffect } from 'react'
import { AppRouter } from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // unica llamada en un useEffect: verificar la sesion al montar la app
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}

export default App
