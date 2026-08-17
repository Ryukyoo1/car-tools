// Thin read-only client for the TeslaMate HTTP API.
// Auth is the API key passed as the `api_key` query parameter (headers return
// 401 on the Cloudflare-fronted gateway). All endpoints are GET.
import type { TeslaMateConfig } from '@/types'

export interface TeslaMateCharge {
  charge_id: number
  start_date: string
  end_date: string
  duration_min: number
  /** Energy actually added to the battery (kWh). */
  charge_energy_added: number
  charge_energy_used: number
  /** Cost as computed by TeslaMate from its own configured electricity price. */
  cost: number
  address: string
  start_battery: number
  end_battery: number
  start_range: number
  end_range: number
}

export interface TeslaMateStatus {
  display_name: string
  state: string
  battery_level: number
  ideal_battery_range: number
  plugged_in: boolean
  charging_state: string | null
  charge_limit_soc: number
  charger_power: number | null
}

function buildUrl(cfg: TeslaMateConfig, path: string): string {
  const base = cfg.baseUrl.replace(/\/+$/, '')
  const clean = path.startsWith('/') ? path : `/${path}`
  const sep = clean.includes('?') ? '&' : '?'
  return `${base}${clean}${sep}api_key=${encodeURIComponent(cfg.apiKey)}`
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { 'User-Agent': 'CAR-TOOLS' } })
  if (!res.ok) {
    if (res.status === 401) throw new Error('认证失败：API Key 不正确 (401)')
    if (res.status === 403) throw new Error('访问被拒绝 (403)')
    if (res.status === 404) throw new Error('接口不存在 (404)，请检查 API 地址')
    throw new Error(`TeslaMate API 返回 ${res.status}`)
  }
  return res.json()
}

/**
 * Fetch the most recent charging sessions. TeslaMate returns them newest-first,
 * so we slice the first `limit` entries.
 */
export async function fetchTeslaMateCharges(cfg: TeslaMateConfig, limit = 1): Promise<TeslaMateCharge[]> {
  const data = (await getJson(buildUrl(cfg, `/cars/${cfg.carId}/charges`))) as {
    data?: { charges?: unknown[] }
  }
  const raw = (data?.data?.charges ?? []) as Record<string, unknown>[]
  return raw.slice(0, limit).map((c) => ({
    charge_id: Number(c.charge_id) || 0,
    start_date: String(c.start_date ?? ''),
    end_date: String(c.end_date ?? ''),
    duration_min: Number(c.duration_min) || 0,
    charge_energy_added: Number(c.charge_energy_added) || 0,
    charge_energy_used: Number(c.charge_energy_used) || 0,
    cost: Number(c.cost) || 0,
    address: String(c.address ?? ''),
    start_battery: Number((c.battery_details as Record<string, unknown>)?.start_battery_level) || 0,
    end_battery: Number((c.battery_details as Record<string, unknown>)?.end_battery_level) || 0,
    start_range: Number((c.range_ideal as Record<string, unknown>)?.start_range) || 0,
    end_range: Number((c.range_ideal as Record<string, unknown>)?.end_range) || 0,
  }))
}

export async function fetchTeslaMateStatus(cfg: TeslaMateConfig): Promise<TeslaMateStatus> {
  const data = (await getJson(buildUrl(cfg, `/cars/${cfg.carId}/status`))) as {
    data?: { status?: Record<string, unknown> }
  }
  const s = (data?.data?.status ?? {}) as Record<string, unknown>
  const bd = (s.battery_details as Record<string, unknown>) ?? {}
  const cd = (s.charging_details as Record<string, unknown>) ?? {}
  return {
    display_name: String(s.display_name ?? ''),
    state: String(s.state ?? ''),
    battery_level: Number(bd.battery_level) || 0,
    ideal_battery_range: Number(bd.ideal_battery_range) || 0,
    plugged_in: Boolean(cd.plugged_in),
    charging_state: cd.charging_state == null ? null : String(cd.charging_state),
    charge_limit_soc: Number(cd.charge_limit_soc) || 0,
    charger_power: cd.charger_power == null ? null : Number(cd.charger_power),
  }
}
