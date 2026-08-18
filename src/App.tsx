import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Spinner } from '@/components/Spinner'

// Lazy-load tool pages so the initial bundle stays small and the home screen opens fast.
const Home = lazy(() => import('@/pages/Home'))
const Compass = lazy(() => import('@/pages/Compass'))
const Timer = lazy(() => import('@/pages/Timer'))
const Calculator = lazy(() => import('@/pages/Calculator'))
const Parking = lazy(() => import('@/pages/Parking'))
const Measure = lazy(() => import('@/pages/Measure'))
const Flashlight = lazy(() => import('@/pages/Flashlight'))
const Weather = lazy(() => import('@/pages/Weather'))
const Ambient = lazy(() => import('@/pages/Ambient'))

function Loading() {
  return (
    <div className="page-bg flex min-h-[60vh] items-center justify-center">
      <Spinner size={36} />
    </div>
  )
}

function EscapeHandler() {
  const navigate = useNavigate()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <EscapeHandler />
      <ErrorBoundary>
        <div className="min-h-[100dvh] text-white">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/compass" element={<Compass />} />
              <Route path="/timer" element={<Timer />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/parking" element={<Parking />} />
              <Route path="/measure" element={<Measure />} />
              <Route path="/flashlight" element={<Flashlight />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/ambient" element={<Ambient />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
