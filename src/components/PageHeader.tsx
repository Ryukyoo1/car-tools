import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
}

export function PageHeader({ title }: PageHeaderProps) {
  const navigate = useNavigate()
  return (
    <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-8 sm:py-4">
      <button
        onClick={() => navigate('/')}
        aria-label="Back to home"
        className="flex min-h-[44px] items-center gap-2 rounded-xl px-2 -ml-2 text-white/80 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ArrowLeft className="h-6 w-6" />
        <span className="text-sm font-medium tracking-wide">CAR TOOLS</span>
      </button>
      <h1 className="ml-auto text-sm font-semibold uppercase tracking-[0.2em] text-white/50 sm:text-base">
        {title}
      </h1>
    </header>
  )
}
