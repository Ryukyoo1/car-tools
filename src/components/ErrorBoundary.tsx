import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    // Use warn (not error) to avoid noisy console.error while keeping the app alive.
    console.warn('ErrorBoundary caught:', error.message)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-accent" />
          <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
          <p className="max-w-sm text-white/60">
            This tool encountered an unexpected error and was stopped so the rest of CAR TOOLS keeps
            working.
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-2 min-h-[60px] rounded-2xl bg-white px-6 font-medium text-black"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
