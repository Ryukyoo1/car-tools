import { Loader2 } from 'lucide-react'

export function Spinner({ size = 28 }: { size?: number }) {
  return <Loader2 className="animate-spin text-white/70" style={{ width: size, height: size }} />
}
