const BASE = 'https://api.openf1.org/v1'

async function get<T>(path: string, params: Record<string, string | number> = {}): Promise<T[]> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString()
  const url = `${BASE}${path}${qs ? `?${qs}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`OpenF1 ${path} → ${res.status}`)
  return res.json()
}

export interface Session {
  session_key: number
  session_name: string
  session_type: string
  status: string
  date_start: string
  date_end: string
  gmt_offset: string
  circuit_key: number
  circuit_short_name: string
  country_name: string
  location: string
  meeting_key: number
  year: number
}

export interface Driver {
  driver_number: number
  broadcast_name: string
  full_name: string
  name_acronym: string
  team_name: string
  team_colour: string
  first_name: string
  last_name: string
  headshot_url: string
  country_code: string
  session_key: number
  meeting_key: number
}

export interface Position {
  date: string
  driver_number: number
  meeting_key: number
  position: number
  session_key: number
}

export interface Interval {
  date: string
  driver_number: number
  gap_to_leader: number | null
  interval: number | null
  meeting_key: number
  session_key: number
}

export interface Lap {
  date_start: string
  driver_number: number
  duration_sector_1: number | null
  duration_sector_2: number | null
  duration_sector_3: number | null
  i1_speed: number | null
  i2_speed: number | null
  is_pit_out_lap: boolean
  lap_duration: number | null
  lap_number: number
  meeting_key: number
  session_key: number
  st_speed: number | null
}

export interface Stint {
  compound: string
  driver_number: number
  lap_end: number | null
  lap_start: number
  meeting_key: number
  session_key: number
  stint_number: number
  tyre_age_at_start: number
}

export interface CarData {
  brake: number
  date: string
  driver_number: number
  drs: number
  meeting_key: number
  n_gear: number
  rpm: number
  session_key: number
  speed: number
  throttle: number
}

export interface Weather {
  air_temperature: number
  date: string
  humidity: number
  meeting_key: number
  pressure: number
  rainfall: number
  session_key: number
  track_temperature: number
  wind_direction: number
  wind_speed: number
}

export interface Pit {
  date: string
  driver_number: number
  lap_number: number
  meeting_key: number
  pit_duration: number | null
  session_key: number
}

export interface RaceControl {
  category: string
  date: string
  driver_number: number | null
  flag: string | null
  lap_number: number | null
  meeting_key: number
  message: string
  scope: string | null
  sector: number | null
  session_key: number
}

export const api = {
  sessions: {
    latest: () => get<Session>('/sessions', { session_key: 'latest' }),
  },
  drivers: {
    bySession: (session_key: number) => get<Driver>('/drivers', { session_key }),
  },
  position: {
    latest: (session_key: number) => get<Position>('/position', { session_key }),
  },
  intervals: {
    latest: (session_key: number) => get<Interval>('/intervals', { session_key }),
  },
  laps: {
    bySession: (session_key: number) => get<Lap>('/laps', { session_key }),
  },
  stints: {
    bySession: (session_key: number) => get<Stint>('/stints', { session_key }),
  },
  carData: {
    latest: (session_key: number, driver_number: number) =>
      get<CarData>('/car_data', { session_key, driver_number }),
  },
  weather: {
    latest: (session_key: number) => get<Weather>('/weather', { session_key }),
  },
  pit: {
    bySession: (session_key: number) => get<Pit>('/pit', { session_key }),
  },
  raceControl: {
    bySession: (session_key: number) => get<RaceControl>('/race_control', { session_key }),
  },
}
