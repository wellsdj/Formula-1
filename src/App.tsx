import './index.css'
import { useOpenF1 } from './hooks/useOpenF1'
import type { DriverRow } from './hooks/useOpenF1'
import {
  currentRace as fakeRace,
  weather as fakeWeather,
  drivers as fakeDrivers,
  pitStops as fakePits,
  fastestLaps,
  championshipStandings,
} from './data/fakeData'

// ─── helpers ────────────────────────────────────────────────────────────────

function windDir(deg: number): string {
  const dirs = ['N','NE','E','SE','S','SW','W','NW']
  return dirs[Math.round(deg / 45) % 8]
}

// ─── Header ─────────────────────────────────────────────────────────────────

interface HeaderProps {
  raceName: string
  flag: string
  lap: number
  totalLaps: number
  isLive: boolean
}

function Header({ raceName, flag, lap, totalLaps, isLive }: HeaderProps) {
  const flagClass = flag === 'GREEN' ? 'green' : flag === 'YELLOW' || flag === 'VIRTUAL_SAFETY_CAR' ? 'yellow' : 'red'
  const flagLabel = flag === 'VIRTUAL_SAFETY_CAR' ? 'VSC' : flag === 'SAFETY_CAR' ? 'SC' : flag

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-wordmark">F<span>1</span></div>
        <div className="header-divider" />
        <div className="header-subtitle">Live Dashboard</div>
      </div>
      <div className="header-center">
        <span className="header-race-name">{raceName}</span>
        <span className={`flag-badge ${flagClass}`}>{flagLabel}</span>
      </div>
      <div className="header-right">
        {totalLaps > 0 && (
          <div className="header-lap">
            LAP <em>{lap}</em> / {totalLaps}
          </div>
        )}
        <div className={`live-indicator${isLive ? '' : ' historical'}`}>
          <span className="live-dot" style={isLive ? {} : { background: '#A3A3A3', animationPlayState: 'paused' }} />
          {isLive ? 'Live' : 'Latest'}
        </div>
      </div>
    </header>
  )
}

// ─── Race bar ────────────────────────────────────────────────────────────────

interface RaceBarProps {
  circuit: string
  sessionType: string
  timeRemaining: string
  lap: number
  totalLaps: number
}

function RaceBar({ circuit, sessionType, timeRemaining, lap, totalLaps }: RaceBarProps) {
  const pct = totalLaps > 0 ? Math.round((lap / totalLaps) * 100) : 0
  return (
    <div className="race-bar">
      <div className="race-stat">
        <span className="race-stat-label">Circuit</span>
        <span className="race-stat-value">{circuit}</span>
      </div>
      <div className="race-stat">
        <span className="race-stat-label">Session</span>
        <span className="race-stat-value">{sessionType}</span>
      </div>
      {timeRemaining && (
        <div className="race-stat">
          <span className="race-stat-label">Remaining</span>
          <span className="race-stat-value red">{timeRemaining}</span>
        </div>
      )}
      {totalLaps > 0 && (
        <div className="progress-wrap">
          <div className="progress-label">
            <span>Race Progress</span>
            <span>{pct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Live Timing ─────────────────────────────────────────────────────────────

function LiveTiming({ drivers, lap }: { drivers: DriverRow[], lap: number }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="card-dot" />Live Timing</div>
        <span className="card-meta">{lap > 0 ? `Lap ${lap}` : 'Session'}</span>
      </div>
      <table className="timing-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Driver</th>
            <th>Gap</th>
            <th>Interval</th>
            <th>Last Lap</th>
            <th>Best Lap</th>
            <th>Tire</th>
            <th className="r">Speed</th>
            <th className="r">DRS</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.number}>
              <td><span className={`pos${d.position === 1 ? ' p1' : ''}`}>{d.position}</span></td>
              <td>
                <div className="driver-cell">
                  <div className="team-stripe" style={{ background: d.teamColor }} />
                  <div>
                    <div className="d-code">{d.code}</div>
                    <div className="d-name">{d.team}</div>
                  </div>
                </div>
              </td>
              <td><span className={`gap${d.position === 1 ? ' leader' : ''}`}>{d.gap}</span></td>
              <td className="gap">{d.interval}</td>
              <td>{d.lastLap}</td>
              <td>{d.bestLap}</td>
              <td>
                <span className={`tire-badge ${d.tire}`}>{d.tire}</span>
                {d.tireAge > 0 && <span className="tire-age">{d.tireAge}</span>}
              </td>
              <td className="r">{d.speed > 0 ? d.speed : '—'}</td>
              <td className="r">{d.drs ? <span className="drs">DRS</span> : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Telemetry ────────────────────────────────────────────────────────────────

function Telemetry({ driver }: { driver: DriverRow }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="card-dot" />Telemetry</div>
        <span className="card-meta">P{driver.position}</span>
      </div>
      <div className="tele-header">
        <div className="tele-stripe" style={{ background: driver.teamColor }} />
        <div>
          <div className="tele-driver">{driver.code}</div>
          <div className="tele-team">{driver.team}</div>
        </div>
      </div>
      <div className="tele-grid">
        <div className="tele-stat">
          <span className="tele-label">Speed</span>
          <span className="tele-val">{driver.speed || '—'}<span className="u">{driver.speed ? ' km/h' : ''}</span></span>
        </div>
        <div className="tele-stat">
          <span className="tele-label">RPM</span>
          <span className="tele-val">{driver.rpm ? driver.rpm.toLocaleString() : '—'}</span>
        </div>
        <div className="tele-stat">
          <span className="tele-label">Throttle</span>
          <span className="tele-val">{driver.throttle}<span className="u">%</span></span>
          <div className="mini-bar"><div className="mini-fill throttle" style={{ width: `${driver.throttle}%` }} /></div>
        </div>
        <div className="tele-stat">
          <span className="tele-label">Brake</span>
          <span className="tele-val">{driver.brake}<span className="u">%</span></span>
          <div className="mini-bar"><div className="mini-fill brake" style={{ width: `${driver.brake}%` }} /></div>
        </div>
        <div className="gear-row">
          <div className="gear-box">{driver.gear || '—'}</div>
          <div className="gear-info">
            <span className="gear-label">Gear</span>
            <span className="rpm-val">{driver.rpm ? `${driver.rpm.toLocaleString()} rpm` : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Weather ──────────────────────────────────────────────────────────────────

interface WeatherProps {
  trackTemp: number
  airTemp: number
  humidity: number
  windSpeed: number
  windDir: string
  rainfall: number
  conditions: string
}

function Weather({ trackTemp, airTemp, humidity, windSpeed, windDir: wd, rainfall, conditions }: WeatherProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="card-dot" />Weather</div>
        <span className="cond-badge">{conditions}</span>
      </div>
      <div className="weather-body">
        <div className="w-stat">
          <span className="w-label">Track Temp</span>
          <span className="w-val">{trackTemp}<span className="u">°C</span></span>
        </div>
        <div className="w-stat">
          <span className="w-label">Air Temp</span>
          <span className="w-val">{airTemp}<span className="u">°C</span></span>
        </div>
        <div className="w-stat">
          <span className="w-label">Humidity</span>
          <span className="w-val">{humidity}<span className="u">%</span></span>
        </div>
        <div className="w-stat">
          <span className="w-label">Wind</span>
          <span className="w-val">{windSpeed}<span className="u">km/h {wd}</span></span>
        </div>
        <div className="w-stat">
          <span className="w-label">Rainfall</span>
          <span className="w-val">{rainfall}<span className="u">mm</span></span>
        </div>
      </div>
    </div>
  )
}

// ─── Pit Stops ────────────────────────────────────────────────────────────────

interface PitEntry {
  lap: number
  code: string
  duration: string
}

function PitStops({ pits }: { pits: PitEntry[] }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="card-dot" />Pit Stops</div>
        <span className="card-meta">{pits.length} stops</span>
      </div>
      {pits.length === 0 && (
        <div style={{ padding: '20px 18px', color: 'var(--gray-400)', fontSize: 12 }}>No pit stops yet</div>
      )}
      {pits.map((p, i) => (
        <div className="pit-row" key={i}>
          <span className="pit-lap">LAP {p.lap}</span>
          <span className="pit-driver">{p.code}</span>
          <span className="pit-time">{p.duration}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Fastest Laps ─────────────────────────────────────────────────────────────

interface FastLap {
  code: string
  time: string
  speed: number
}

function FastestLaps({ laps }: { laps: FastLap[] }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="card-dot" />Fastest Laps</div>
      </div>
      {laps.map((fl, i) => (
        <div className="fl-row" key={i}>
          <span className={`fl-pos${i === 0 ? ' purple' : ''}`}>{i + 1}</span>
          <span className="fl-driver">{fl.code}</span>
          <span className={`fl-time${i === 0 ? ' purple' : ''}`}>{fl.time}</span>
          <span className="fl-speed">{fl.speed} km/h</span>
        </div>
      ))}
    </div>
  )
}

// ─── Championship Standings ───────────────────────────────────────────────────

function ChampionshipStandings() {
  const maxPts = championshipStandings[0].points
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="card-dot" />Drivers' Championship</div>
        <span className="card-meta">2026</span>
      </div>
      <table className="standings-table">
        <tbody>
          {championshipStandings.map((s) => (
            <tr key={s.driver}>
              <td><span className="s-pos">{s.position}</span></td>
              <td>
                <div className="s-driver">
                  <div className="team-stripe" style={{ background: s.teamColor, width: 3, height: 18, borderRadius: 2 }} />
                  <div>
                    <div className="s-code">{s.driver}</div>
                    <div className="s-team">{s.team}</div>
                  </div>
                </div>
              </td>
              <td className="s-bar-wrap">
                <div className="s-bar" style={{ width: `${(s.points / maxPts) * 100}%`, background: s.teamColor }} />
              </td>
              <td><span className="s-pts">{s.points}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Loading / Error ──────────────────────────────────────────────────────────

function StatusScreen({ message, sub }: { message: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>F<span style={{ color: 'var(--red)' }}>1</span></div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-600)' }}>{message}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{sub}</div>}
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const live = useOpenF1()

  // Decide whether to use real or fake data
  const hasRealDrivers = live.drivers.length > 0
  const usingReal = !live.loading && !live.error && hasRealDrivers

  const raceName = live.session
    ? `${live.session.location} Grand Prix`
    : fakeRace.name

  const circuit = live.session?.circuit_short_name ?? fakeRace.circuit

  const sessionType = live.session?.session_name ?? fakeRace.sessionType

  const currentLap = live.currentLap || fakeRace.lap
  const totalLaps = live.totalLaps || fakeRace.totalLaps

  const drivers: DriverRow[] = usingReal
    ? live.drivers
    : fakeDrivers.map((d) => ({
        position: d.position,
        number: d.number,
        code: d.code,
        name: d.name,
        team: d.team,
        teamColor: d.teamColor,
        gap: d.gap,
        interval: d.interval,
        lastLap: d.lastLap,
        bestLap: d.bestLap,
        tire: d.tire,
        tireAge: d.tireAge,
        pitstops: d.pitstops,
        drs: d.drs,
        speed: d.speed,
        throttle: d.throttle,
        brake: d.brake,
        gear: d.gear,
        rpm: d.rpm,
      }))

  const leadDriver = drivers[0] ?? fakeDrivers[0]

  const weatherProps: WeatherProps = live.weather
    ? {
        trackTemp: Math.round(live.weather.track_temperature),
        airTemp: Math.round(live.weather.air_temperature),
        humidity: Math.round(live.weather.humidity),
        windSpeed: Math.round(live.weather.wind_speed),
        windDir: windDir(live.weather.wind_direction),
        rainfall: live.weather.rainfall,
        conditions: live.weather.rainfall > 0 ? 'Wet' : 'Dry',
      }
    : {
        trackTemp: fakeWeather.trackTemp,
        airTemp: fakeWeather.airTemp,
        humidity: fakeWeather.humidity,
        windSpeed: fakeWeather.windSpeed,
        windDir: fakeWeather.windDirection,
        rainfall: 0,
        conditions: fakeWeather.conditions,
      }

  const pitEntries: PitEntry[] = usingReal
    ? live.pits
        .sort((a, b) => b.lap_number - a.lap_number)
        .slice(0, 10)
        .map((p) => {
          const driver = live.drivers.find((d) => d.number === p.driver_number)
          return {
            lap: p.lap_number,
            code: driver?.code ?? String(p.driver_number),
            duration: p.pit_duration ? `${p.pit_duration.toFixed(1)}s` : '—',
          }
        })
    : fakePits.map((p) => ({ lap: p.lap, code: p.code, duration: p.duration }))

  const fastLaps: FastLap[] = usingReal
    ? drivers
        .filter((d) => d.bestLap !== '—')
        .sort((a, b) => a.bestLap.localeCompare(b.bestLap))
        .slice(0, 5)
        .map((d) => ({ code: d.code, time: d.bestLap, speed: d.speed }))
    : fastestLaps.map((fl) => ({ code: fl.code, time: fl.time, speed: fl.speed }))

  const flag = live.flag || fakeRace.flag

  if (live.loading) {
    return (
      <div className="app">
        <Header raceName="Loading..." flag="GREEN" lap={0} totalLaps={0} isLive={false} />
        <StatusScreen message="Connecting to OpenF1..." sub="Fetching latest session data" />
      </div>
    )
  }

  if (live.error) {
    return (
      <div className="app">
        <Header raceName={fakeRace.name} flag={fakeRace.flag} lap={fakeRace.lap} totalLaps={fakeRace.totalLaps} isLive={false} />
        <div style={{ padding: '8px 24px', background: '#FFF3F3', borderBottom: '1px solid #FFD0D0', fontSize: 12, color: '#CC0000' }}>
          OpenF1 unavailable — showing demo data. Error: {live.error}
        </div>
        <RaceBar circuit={fakeRace.circuit} sessionType={fakeRace.sessionType} timeRemaining={fakeRace.timeRemaining} lap={fakeRace.lap} totalLaps={fakeRace.totalLaps} />
        <main className="main">
          <div className="grid-top">
            <LiveTiming drivers={drivers} lap={fakeRace.lap} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Telemetry driver={leadDriver as DriverRow} />
              <Weather {...weatherProps} />
            </div>
          </div>
          <div className="grid-bottom">
            <PitStops pits={pitEntries} />
            <FastestLaps laps={fastLaps} />
            <ChampionshipStandings />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <Header raceName={raceName} flag={flag} lap={currentLap} totalLaps={totalLaps} isLive={live.isLive} />
      {!usingReal && (
        <div style={{ padding: '8px 24px', background: '#FFFBF0', borderBottom: '1px solid #FFE9A0', fontSize: 12, color: '#8B6914' }}>
          No live timing data yet — showing demo data. Data will populate when a session is active.
        </div>
      )}
      <RaceBar
        circuit={circuit}
        sessionType={sessionType}
        timeRemaining={live.isLive ? fakeRace.timeRemaining : ''}
        lap={currentLap}
        totalLaps={totalLaps}
      />
      <main className="main">
        <div className="grid-top">
          <LiveTiming drivers={drivers} lap={currentLap} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Telemetry driver={leadDriver as DriverRow} />
            <Weather {...weatherProps} />
          </div>
        </div>
        <div className="grid-bottom">
          <PitStops pits={pitEntries} />
          <FastestLaps laps={fastLaps} />
          <ChampionshipStandings />
        </div>
      </main>
    </div>
  )
}
