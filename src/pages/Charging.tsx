import { useRef, useState } from 'react'
import { ToolPage } from '@/components/layout/ToolPage'
import { GlassSurface } from '@/components/ui/GlassSurface'
import { GlassSlider } from '@/components/ui/GlassControls'
import { calcChargeTime } from '@/utils/calculator'
import { formatNumber } from '@/utils/format'
import { storage } from '@/services/storage'
import {
  fetchTeslaMateCharges,
  fetchTeslaMateStatus,
  type TeslaMateCharge,
  type TeslaMateStatus,
} from '@/services/teslamate'
import type { TeslaMateConfig, UserSettings } from '@/types'
import { AlertTriangle, Eye, EyeOff, Link2, Loader2, Plug, Zap } from 'lucide-react'

const DEFAULT_TM: TeslaMateConfig = {
  baseUrl: 'https://api.maono1.com/api/v1',
  apiKey: 'Dashabi941.',
  carId: 1,
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-secondary">{label}</span>
      <span className="text-right text-white/90 tabular-nums">{value}</span>
    </div>
  )
}

function fmtTime(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Charging() {
  const settings = storage.getUserSettings()
  const [price, setPrice] = useState(settings.defaultElectricityPrice)
  const [power, setPower] = useState(120)

  // --- TeslaMate binding -----------------------------------------------------
  const savedTm = settings.teslamate
  const [tmBase, setTmBase] = useState(savedTm?.baseUrl ?? DEFAULT_TM.baseUrl)
  const [tmKey, setTmKey] = useState(savedTm?.apiKey ?? DEFAULT_TM.apiKey)
  const [tmKeyVisible, setTmKeyVisible] = useState(false)
  const [tmCar, setTmCar] = useState(savedTm?.carId ?? DEFAULT_TM.carId)
  const [tmLoading, setTmLoading] = useState(false)
  const [tmError, setTmError] = useState<string | null>(null)
  const [tmStatus, setTmStatus] = useState<TeslaMateStatus | null>(null)
  const [currentCharge, setCurrentCharge] = useState<TeslaMateCharge | null>(null)
  const infoRef = useRef<HTMLDivElement>(null)

  const bound = !!savedTm

  const persist = (patch: Partial<UserSettings>) => storage.saveUserSettings(patch)

  const saveBinding = () => {
    const next: TeslaMateConfig = {
      baseUrl: tmBase.trim().replace(/\/+$/, ''),
      apiKey: tmKey.trim(),
      carId: Number(tmCar) || 1,
    }
    persist({ teslamate: next })
    setTmError(null)
  }

  const loadCurrent = async () => {
    setTmLoading(true)
    setTmError(null)
    try {
      const useCfg: TeslaMateConfig =
        savedTm ?? { baseUrl: tmBase.trim(), apiKey: tmKey.trim(), carId: Number(tmCar) || 1 }
      const [status, charges] = await Promise.all([
        fetchTeslaMateStatus(useCfg).catch(() => null),
        fetchTeslaMateCharges(useCfg, 1),
      ])
      if (status) setTmStatus(status)
      const c = charges[0] ?? null
      setCurrentCharge(c)
      setTimeout(() => infoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120)
    } catch (e) {
      setTmError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setTmLoading(false)
    }
  }

  // --- Derived values --------------------------------------------------------
  const energy = currentCharge?.charge_energy_added ?? 0
  const cost = energy * price
  const timeH = calcChargeTime(energy, power)

  return (
    <ToolPage title="CHARGING" accent="green">
      <div className="mx-auto w-full max-w-md space-y-5 py-2">
        {/* TeslaMate binding */}
        <GlassSurface variant="card" className="p-5">
          <div className="mb-4 flex items-center gap-2 text-white">
            <Plug className="h-5 w-5 text-accent" strokeWidth={1.8} />
            <h2 className="text-lg font-medium">TeslaMate 绑定</h2>
            {bound && <span className="ml-auto text-xs text-white/60">已绑定</span>}
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs text-secondary">API 地址</span>
              <input
                value={tmBase}
                onChange={(e) => setTmBase(e.target.value)}
                placeholder="https://your-host/api/v1"
                className="glass-soft h-11 w-full rounded-md px-3 text-sm text-white outline-none focus:border-white/30"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-secondary">API Key</span>
              <div className="relative">
                <input
                  type={tmKeyVisible ? 'text' : 'password'}
                  value={tmKey}
                  onChange={(e) => setTmKey(e.target.value)}
                  className="glass-soft h-11 w-full rounded-md px-3 pr-10 text-sm text-white outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => setTmKeyVisible((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/40 transition-colors hover:text-white/80"
                  aria-label={tmKeyVisible ? '隐藏 API Key' : '显示 API Key'}
                >
                  {tmKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-secondary">车辆 ID</span>
              <input
                type="number"
                value={tmCar}
                onChange={(e) => setTmCar(parseInt(e.target.value, 10) || 1)}
                className="glass-soft h-11 w-full rounded-md px-3 text-sm text-white outline-none focus:border-white/30"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-secondary">电价 (¥/kWh)</span>
              <input
                type="number"
                inputMode="decimal"
                step={0.01}
                value={Number.isFinite(price) ? price : ''}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0
                  setPrice(v)
                  persist({ defaultElectricityPrice: v })
                }}
                className="glass-soft h-11 w-full rounded-md px-3 text-sm text-white outline-none focus:border-white/30"
              />
            </label>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={saveBinding}
              className="glass-soft flex-1 rounded-md py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              保存绑定
            </button>
            <button
              onClick={loadCurrent}
              disabled={tmLoading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-accent/20 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/30 disabled:opacity-50"
            >
              {tmLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Zap className="h-4 w-4" /> 加载当前充电
                </>
              )}
            </button>
          </div>

          {tmStatus && (
            <p className="mt-3 text-xs text-white/55">
              {tmStatus.display_name || '车辆'} · 电量 {tmStatus.battery_level}% ·{' '}
              {tmStatus.charging_state === 'Charging'
                ? `充电中 ⚡ ${tmStatus.charger_power ?? 0}kW`
                : tmStatus.state || '离线'}
            </p>
          )}
          {tmError && (
            <p className="mt-3 flex items-start gap-1.5 text-xs text-amber-300/90">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {tmError}（若为跨域 CORS 限制，需在 TeslaMate 网关允许本页域名，或用本地代理转发）
            </p>
          )}
        </GlassSurface>

        {/* Current charge info (pulled from TeslaMate) */}
        {currentCharge && (
          <div ref={infoRef}>
            <GlassSurface variant="card" className="p-5">
              <div className="mb-3 flex items-center gap-2 text-white">
                <Link2 className="h-5 w-5 text-accent" strokeWidth={1.8} />
                <h2 className="text-lg font-medium">当前充电信息</h2>
              </div>
              <div className="space-y-2 text-sm">
                <InfoRow label="地点" value={currentCharge.address || '—'} />
                <InfoRow
                  label="时间"
                  value={`${fmtTime(currentCharge.start_date)} → ${fmtTime(currentCharge.end_date)}`}
                />
                <InfoRow
                  label="电量区间"
                  value={`${currentCharge.start_battery}% → ${currentCharge.end_battery}%`}
                />
                <InfoRow label="已充能量" value={`${formatNumber(currentCharge.charge_energy_added, 2)} kWh`} />
                <InfoRow label="TeslaMate 成本" value={`¥${formatNumber(currentCharge.cost, 2)}`} />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-secondary">
                  按你的电价 (¥{formatNumber(price, 2)}/kWh)
                </span>
                <span className="text-2xl font-bold tabular-nums text-accent">
                  ¥{formatNumber(energy * price, 2)}
                </span>
              </div>
            </GlassSurface>
          </div>
        )}

        {currentCharge && (
          <>
            {/* Energy / Cost summary */}
            <GlassSurface variant="card" className="p-5">
              <div className="flex items-center justify-between py-2">
                <span className="text-secondary">Energy Required</span>
                <span className="text-2xl font-semibold tabular-nums text-white">
                  {formatNumber(energy, 1)} kWh
                  <span className="ml-2 text-xs text-accent/80">(TeslaMate 真实)</span>
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 py-2">
                <span className="text-secondary">Estimated Cost</span>
                <span className="text-3xl font-bold tabular-nums text-accent">¥{formatNumber(cost, 2)}</span>
              </div>
            </GlassSurface>

            {/* Charging Time */}
            <GlassSurface variant="card" className="p-5">
              <div className="mb-4 flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-accent" strokeWidth={1.8} />
                <h2 className="text-lg font-medium">Charging Time</h2>
              </div>
              <GlassSlider
                label="Power (kW)"
                value={power}
                min={3}
                max={350}
                step={1}
                accent="green"
                onChange={setPower}
              />
              <div className="mt-4 flex items-center justify-between border-t border-white/10 py-2">
                <span className="text-secondary">Estimated Time</span>
                <span className="text-2xl font-semibold tabular-nums text-white">
                  {formatNumber(timeH, 2)} h
                </span>
              </div>
              <p className="mt-2 text-xs text-muted">Theoretical estimate only. Actual charging time may vary.</p>
            </GlassSurface>
          </>
        )}
      </div>
    </ToolPage>
  )
}
