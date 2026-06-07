import './index.css'
import { useState } from 'react'
import { useOpenF1 } from './hooks/useOpenF1'
import type { DriverRow } from './hooks/useOpenF1'
import {
  currentRace as fakeRace,
  weather as fakeWeather,
  drivers as fakeDrivers,
  pitStops as fakePits,
  fastestLaps,
  championshipStandings,
  cameraFeeds,
  teamRadio,
  tireStatus,
} from './data/fakeData'

const F1TV_URL = 'https://f1tv.formula1.com/'

// ─── helpers ────────────────────────────────────────────────────────────────

function windDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

function PlayIcon({ size = 22, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  raceName: string
  flag: string
  lap: number
  totalLaps: number
  isLive: boolean
}

function Header({ raceName, flag, lap, totalLaps, isLive }: HeaderProps) {
  const flagClass =
    flag === 'GREEN' ? 'green' : flag === 'YELLOW' || flag === 'VIRTUAL_SAFETY_CAR' ? 'yellow' : 'red'
  const flagLabel = flag === 'VIRTUAL_SAFETY_CAR' ? 'VSC' : flag === 'SAFETY_CAR' ? 'SC' : flag

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-wordmark">F<span>1</span></div>
        <div className="header-divider" />
        <div className="header-subtitle">Cinema</div>
      </div>
      <div className="header-center">
        <span className="header-race-name">{raceName}</span>
        <span className={`flag-badge ${flagClass}`}>{flagLabel}</span>
      </div>
      <div className="header-right">
        {totalLaps > 0 && (
          <div className="header-lap">LAP <em>{lap}</em> / {totalLaps}</div>
        )}
        <div className="live-indicator">
          <span className="live-dot" style={isLive ? {} : { background: '#62626C', boxShadow: 'none', animationPlayState: 'paused' }} />
          {isLive ? 'Live' : 'Latest'}
        </div>
        <a className="f1tv-btn" href={F1TV_URL} target="_blank" rel="noreferrer">
          <PlayIcon size={13} /> Watch on F1 TV
        </a>
      </div>
    </header>
  )
}

// ─── Video stage ────────────────────────────────────────────────────────────────

function VideoStage({ raceName, lap, totalLaps }: { raceName: string; lap: number; totalLaps: number }) {
  const [activeCam, setActiveCam] = useState('world')
  const active = cameraFeeds.find((c) => c.id === activeCam)!

  return (
    <div className="stage-col">
      <div className="video-stage">
        <div className="stage-watermark">
          <span className="stage-rec" /> {active.label}
        </div>
        <div className="stage-corner">
          {lap > 0 && totalLaps > 0 ? `LAP ${lap} / ${totalLaps}` : 'STANDBY'}
        </div>
        <div className="stage-center">
          <a className="stage-play" href={F1TV_URL} target="_blank" rel="noreferrer" aria-label="Watch on F1 TV">
            <PlayIcon size={30} />
          </a>
          <div>
            <div className="stage-title">{raceName}</div>
            <div className="stage-sub">
              Live video isn't streamed in-app. Tap play to open the official F1 TV broadcast,
              and keep this dashboard as your live data second screen.
            </div>
          </div>
        </div>
      </div>
      <div className="camera-bar">
        {cameraFeeds.map((c) => (
          <button
            key={c.id}
            className={`camera-chip${c.id === activeCam ? ' active' : ''}`}
            onClick={() => setActiveCam(c.id)}
          >
            <span className="camera-chip-dot" style={{ background: c.teamColor }} />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Live timing ────────────────────────────────────────────────────────────────

function LiveTiming({ drivers, lap }: { drivers: DriverRow[]; lap: number }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="card-dot" />Live Timing</div>
        <span className="card-meta">{lap > 0 ? `Lap ${lap}` : 'Session'}</span>
      </div>
      <table className="timing-table">
        <thead>
          <tr>
            <th>Pos</th><th>Driver</th><th>Gap</th><th>Interval</th>
            <th>Last Lap</th><th>Tire</th><th className="r">Spd</th><th className="r">DRS</th>
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

// ─── Telemetry ──────────────────────────────────────────────────────────────────

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

// ─── Team Radio ─────────────────────────────────────────────────────────────────

function TeamRadio() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="card-dot" />Team Radio</div>
        <span className="card-meta">{teamRadio.length} clips</span>
      </div>
      <div className="radio-list">
        {teamRadio.map((r) => (
          <div className="radio-row" key={r.id}>
            <button className="radio-play" aria-label="Play radio clip">
              <PlayIcon size={13} />
            </button>
            <div className="radio-body">
              <div className="radio-meta">
                <span className="team-stripe" style={{ background: r.teamColor, height: 12 }} />
                <span className="radio-code">{r.code}</span>
                <span className="radio-channel">{r.channel}</span>
                <span className="radio-time">{r.time}</span>
              </div>
              <div className="radio-text">"{r.text}"</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tire status ────────────────────────────────────────────────────────────────

function tempColor(t: number): string {
  if (t >= 108) return '#FF453A'
  if (t >= 100) return '#FFD60A'
  return '#00E676'
}

function TireStatus() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="card-dot" />Tire Status</div>
        <span className="card-meta">Est.</span>
      </div>
      <div className="tire-list">
        {tireStatus.map((t) => (
          <div className="tire-row" key={t.code}>
            <div className="tire-driver">
              <span className="team-stripe" style={{ background: t.teamColor }} />
              <span className="tire-code">{t.code}</span>
            </div>
            <span className={`tire-badge ${t.compound}`}>{t.compound}</span>
            <div className="tire-stat-group">
              <div className="tire-stat">
                <span className="tire-stat-label">Age</span>
                <span className="tire-stat-val">{t.age}L</span>
              </div>
              <div className="tire-stat">
                <span className="tire-stat-label">Temp</span>
                <span className="tire-stat-val">{t.estTemp}°C</span>
                <div className="tire-temp-bar">
                  <div className="tire-temp-fill" style={{ width: `${Math.min(100, (t.estTemp / 130) * 100)}%`, background: tempColor(t.estTemp) }} />
                </div>
              </div>
              <div className="tire-stat">
                <span className="tire-stat-label">Wear</span>
                <span className="tire-stat-val">{t.wear}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="est-note">Temps & wear are modelled estimates — not available from any public F1 feed.</div>
    </div>
  )
}

// ─── Weather ──────────────────────────────────────────────────────────────────

interface WeatherProps {
  trackTemp: number; airTemp: number; humidity: number
  windSpeed: number; windDir: string; rainfall: number; conditions: string
}

function Weather({ trackTemp, airTemp, humidity, windSpeed, windDir: wd, rainfall, conditions }: WeatherProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="card-dot" />Weather</div>
        <span className="cond-badge">{conditions}</span>
      </div>
      <div className="weather-body">
        <div className="w-stat"><span className="w-label">Track Temp</span><span className="w-val">{trackTemp}<span className="u">°C</span></span></div>
        <div className="w-stat"><span className="w-label">Air Temp</span><span className="w-val">{airTemp}<span className="u">°C</span></span></div>
        <div className="w-stat"><span className="w-label">Humidity</span><span className="w-val">{humidity}<span className="u">%</span></span></div>
        <div className="w-stat"><span className="w-label">Wind</span><span className="w-val">{windSpeed}<span className="u">km/h {wd}</span></span></div>
        <div className="w-stat"><span className="w-label">Rainfall</span><span className="w-val">{rainfall}<span className="u">mm</span></span></div>
      </div>
    </div>
  )
}

// ─── Pit stops ──────────────────────────────────────────────────────────────────

interface PitEntry { lap: number; code: string; duration: string }

function PitStops({ pits }: { pits: PitEntry[] }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title"><span className="card-dot" />Pit Stops</div>
        <span className="card-meta">{pits.length} stops</span>
      </div>
      {pits.length === 0 && <div style={{ padding: '20px 18px', color: 'var(--text-3)', fontSize: 12 }}>No pit stops yet</div>}
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

// ─── Fastest laps ───────────────────────────────────────────────────────────────

interface FastLap { code: string; time: string; speed: number }

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

// ─── Championship ───────────────────────────────────────────────────────────────

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
                  <div className="team-stripe" style={{ background: s.teamColor, width: 3, height: 18 }} />
                  <div>
                    <div className="s-code">{s.driver}</div>
                    <div className="s-team">{s.team}</div>
                  </div>
                </div>
              </td>
              <td className="s-bar-wrap"><div className="s-bar" style={{ width: `${(s.points / maxPts) * 100}%`, background: s.teamColor }} /></td>
              <td><span className="s-pts">{s.points}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  const live = useOpenF1()

  const hasRealDrivers = live.drivers.length > 0
  const usingReal = !live.loading && !live.error && hasRealDrivers

  const raceName = live.session ? `${live.session.location} Grand Prix` : fakeRace.name
  const currentLap = live.currentLap || fakeRace.lap
  const totalLaps = live.totalLaps || fakeRace.totalLaps

  const drivers: DriverRow[] = usingReal
    ? live.drivers
    : fakeDrivers.map((d) => ({ ...d }))

  const leadDriver = drivers[0] ?? (fakeDrivers[0] as DriverRow)

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
        <div className="status-screen">
          <div className="status-logo">F<span>1</span></div>
          <div className="status-msg">Connecting to OpenF1…</div>
          <div className="status-sub">Fetching the latest session</div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Header raceName={raceName} flag={flag} lap={currentLap} totalLaps={totalLaps} isLive={live.isLive} />

      {live.error && (
        <div className="banner error">OpenF1 unavailable — showing demo data. ({live.error})</div>
      )}
      {!live.error && !usingReal && (
        <div className="banner demo">No live timing data right now — showing demo data. Real data appears when a session is active.</div>
      )}

      <main className="main">
        <div className="stage-grid">
          <VideoStage raceName={raceName} lap={currentLap} totalLaps={totalLaps} />
          <LiveTiming drivers={drivers} lap={currentLap} />
        </div>

        <div className="data-grid">
          <Telemetry driver={leadDriver} />
          <TeamRadio />
          <TireStatus />
        </div>

        <div className="data-grid">
          <Weather {...weatherProps} />
          <PitStops pits={pitEntries} />
          <FastestLaps laps={fastLaps} />
        </div>

        <div className="data-grid">
          <ChampionshipStandings />
        </div>
      </main>
    </div>
  )
}
