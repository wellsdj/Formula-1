import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../api/openf1'
import type { Session, Driver, Position, Interval, Lap, Stint, CarData, Weather, Pit, RaceControl } from '../api/openf1'

function latestPerDriver<T extends { driver_number: number; date: string }>(items: T[]): Map<number, T> {
  const map = new Map<number, T>()
  for (const item of items) {
    const existing = map.get(item.driver_number)
    if (!existing || item.date > existing.date) {
      map.set(item.driver_number, item)
    }
  }
  return map
}

function latestItem<T extends { date: string }>(items: T[]): T | null {
  if (!items.length) return null
  return items.reduce((a, b) => (a.date > b.date ? a : b))
}

function fmtTime(seconds: number | null): string {
  if (seconds == null) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(3).padStart(6, '0')
  return `${m}:${s}`
}

function fmtGap(val: number | null): string {
  if (val == null || val === 0) return 'LEADER'
  if (val < 0) return 'LAP'
  return `+${val.toFixed(3)}`
}

function fmtInterval(val: number | null): string {
  if (val == null) return '—'
  return `+${val.toFixed(3)}`
}

function drsOn(code: number): boolean {
  return [10, 12, 14].includes(code)
}

export interface DriverRow {
  position: number
  number: number
  code: string
  name: string
  team: string
  teamColor: string
  gap: string
  interval: string
  lastLap: string
  bestLap: string
  tire: string
  tireAge: number
  pitstops: number
  drs: boolean
  speed: number
  throttle: number
  brake: number
  gear: number
  rpm: number
}

export interface RaceData {
  session: Session | null
  isLive: boolean
  flag: string
  drivers: DriverRow[]
  weather: Weather | null
  pits: Pit[]
  raceControl: RaceControl[]
  currentLap: number
  totalLaps: number
  loading: boolean
  error: string | null
}

export function useOpenF1(): RaceData {
  const [session, setSession] = useState<Session | null>(null)
  const [driversMap, setDriversMap] = useState<Map<number, Driver>>(new Map())
  const [positions, setPositions] = useState<Map<number, Position>>(new Map())
  const [intervals, setIntervals] = useState<Map<number, Interval>>(new Map())
  const [laps, setLaps] = useState<Lap[]>([])
  const [stints, setStints] = useState<Stint[]>([])
  const [carData, setCarData] = useState<Map<number, CarData>>(new Map())
  const [weather, setWeather] = useState<Weather | null>(null)
  const [pits, setPits] = useState<Pit[]>([])
  const [raceControl, setRaceControl] = useState<RaceControl[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sessionKey = session?.session_key
  const isLive = session?.status === 'started'

  // Load initial session + static-ish data
  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        setLoading(true)
        setError(null)
        const sessions = await api.sessions.latest()
        const s = sessions[0]
        if (!s || cancelled) return
        setSession(s)

        const [driverList, pitList, rcList, stintList] = await Promise.all([
          api.drivers.bySession(s.session_key),
          api.pit.bySession(s.session_key),
          api.raceControl.bySession(s.session_key),
          api.stints.bySession(s.session_key),
        ])
        if (cancelled) return
        setDriversMap(new Map(driverList.map((d) => [d.driver_number, d])))
        setPits(pitList)
        setRaceControl(rcList)
        setStints(stintList)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  // Poll live timing data
  const pollTiming = useCallback(async () => {
    if (!sessionKey) return
    try {
      const [posData, intData, lapData, weatherData] = await Promise.all([
        api.position.latest(sessionKey),
        api.intervals.latest(sessionKey),
        api.laps.bySession(sessionKey),
        api.weather.latest(sessionKey),
      ])
      setPositions(latestPerDriver(posData))
      setIntervals(latestPerDriver(intData))
      setLaps(lapData)
      const w = latestItem(weatherData)
      if (w) setWeather(w)
    } catch { /* silently ignore polling errors */ }
  }, [sessionKey])

  // Poll car telemetry for top driver
  const pollCar = useCallback(async () => {
    if (!sessionKey || !positions.size) return
    try {
      const topDriverNum = [...positions.entries()]
        .sort((a, b) => a[1].position - b[1].position)[0]?.[0]
      if (!topDriverNum) return
      const data = await api.carData.latest(sessionKey, topDriverNum)
      if (data.length) {
        const latest = data.reduce((a, b) => (a.date > b.date ? a : b))
        setCarData((prev) => new Map(prev).set(topDriverNum, latest))
      }
    } catch { /* ignore */ }
  }, [sessionKey, positions])

  // Set up polling intervals
  const timingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const carRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!sessionKey) return
    pollTiming()
    timingRef.current = setInterval(pollTiming, isLive ? 3000 : 30000)
    return () => { if (timingRef.current) clearInterval(timingRef.current) }
  }, [sessionKey, isLive, pollTiming])

  useEffect(() => {
    if (!sessionKey) return
    carRef.current = setInterval(pollCar, isLive ? 4000 : 60000)
    return () => { if (carRef.current) clearInterval(carRef.current) }
  }, [sessionKey, isLive, pollCar])

  // Derive current flag from race control
  const flag = (() => {
    const flagMsgs = raceControl.filter((r) => r.flag)
    if (!flagMsgs.length) return 'GREEN'
    const last = flagMsgs.reduce((a, b) => (a.date > b.date ? a : b))
    return last.flag ?? 'GREEN'
  })()

  // Derive current lap
  const currentLap = laps.length
    ? Math.max(...laps.map((l) => l.lap_number))
    : 0

  // Build driver rows
  const driverRows: DriverRow[] = []
  const sortedPositions = [...positions.values()].sort((a, b) => a.position - b.position)

  for (const pos of sortedPositions) {
    const driver = driversMap.get(pos.driver_number)
    if (!driver) continue

    const interval = intervals.get(pos.driver_number)
    const driverLaps = laps
      .filter((l) => l.driver_number === pos.driver_number && !l.is_pit_out_lap && l.lap_duration)
      .sort((a, b) => b.lap_number - a.lap_number)
    const lastLap = driverLaps[0]
    const bestLap = driverLaps.reduce<Lap | null>(
      (best, l) => (!best || (l.lap_duration! < best.lap_duration!)) ? l : best,
      null
    )
    const currentStint = stints
      .filter((s) => s.driver_number === pos.driver_number)
      .sort((a, b) => b.stint_number - a.stint_number)[0]
    const driverPits = pits.filter((p) => p.driver_number === pos.driver_number)
    const car = carData.get(pos.driver_number)

    driverRows.push({
      position: pos.position,
      number: driver.driver_number,
      code: driver.name_acronym,
      name: driver.full_name,
      team: driver.team_name,
      teamColor: `#${driver.team_colour}`,
      gap: pos.position === 1 ? 'LEADER' : fmtGap(interval?.gap_to_leader ?? null),
      interval: pos.position === 1 ? '—' : fmtInterval(interval?.interval ?? null),
      lastLap: fmtTime(lastLap?.lap_duration ?? null),
      bestLap: fmtTime(bestLap?.lap_duration ?? null),
      tire: currentStint?.compound?.charAt(0) ?? '?',
      tireAge: currentStint ? (currentLap - currentStint.lap_start + (currentStint.tyre_age_at_start ?? 0)) : 0,
      pitstops: driverPits.length,
      drs: drsOn(car?.drs ?? 0),
      speed: car?.speed ?? 0,
      throttle: car?.throttle ?? 0,
      brake: car?.brake ?? 0,
      gear: car?.n_gear ?? 0,
      rpm: car?.rpm ?? 0,
    })
  }

  return {
    session,
    isLive,
    flag,
    drivers: driverRows,
    weather,
    pits,
    raceControl,
    currentLap,
    totalLaps: session?.session_type === 'Race' ? 58 : 0,
    loading,
    error,
  }
}
