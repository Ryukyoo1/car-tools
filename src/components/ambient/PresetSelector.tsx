import { useState } from 'react'
import { Bookmark, Trash2, Plus } from 'lucide-react'
import type { AmbientPreset } from '@/types/ambient'

interface PresetSelectorProps {
  presets: AmbientPreset[]
  favorites: AmbientPreset[]
  activeId: string | null
  canSave: boolean
  onLoad: (preset: AmbientPreset) => void
  onSave: (name: string) => void
  onDelete: (id: string) => void
}

function PresetCard({
  preset,
  active,
  onLoad,
  onDelete,
}: {
  preset: AmbientPreset
  active: boolean
  onLoad: () => void
  onDelete?: () => void
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3"
      style={{
        borderColor: active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)',
        background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
      }}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-white">{preset.name}</div>
        <div className="truncate text-xs text-white/50">{preset.subtitle}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onLoad}
          aria-label={`Load ${preset.name}`}
          className="min-h-[44px] rounded-xl bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          Load
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            aria-label={`Delete ${preset.name}`}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}

// Built-in presets + user favorites. Also lets the user store the current mix.
export function PresetSelector({ presets, favorites, activeId, canSave, onLoad, onSave, onDelete }: PresetSelectorProps) {
  const [name, setName] = useState('')

  const handleSave = () => {
    onSave(name)
    setName('')
  }

  return (
    <div className="glass rounded-3xl px-5 py-4">
      <div className="mb-3 flex items-center gap-2 px-1 text-sm tracking-wide text-white/60">
        <Bookmark className="h-4 w-4" /> PRESETS
      </div>

      <div className="space-y-2">
        {presets.map((p) => (
          <PresetCard key={p.id} preset={p} active={activeId === p.id} onLoad={() => onLoad(p)} />
        ))}
        {favorites.map((p) => (
          <PresetCard key={p.id} preset={p} active={activeId === p.id} onLoad={() => onLoad(p)} onDelete={() => onDelete(p.id)} />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Save current mix…"
          aria-label="Preset name"
          className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
        />
        <button
          onClick={handleSave}
          disabled={!canSave}
          aria-label="Save current mix as preset"
          className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Save
        </button>
      </div>
    </div>
  )
}
