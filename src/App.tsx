import './index.css'
import {
  currentRace,
  weather,
  drivers,
  pitStops,
  fastestLaps,
  championshipStandings,
} from './data/fakeData'

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-wordmark">F<span>1</span></div>
        <div className="header-divider" />
        <div className="header-subtitle">Live Dashboard</div>
      </div>
      <div className="header-center">
        <span className="header-race-name">{currentRace.name}</span>
        <span className={`flag-badge ${currentRace.flag.toLowerCase()}`}>{currentRace.flag}</span>
      </div>
      <div className="header-right">
        <div className="header-lap">
          LAP <em>{currentRace.lap}</em> / {currentRace.totalLaps}
        </div>
        <div className="live-indicator">
          <span className="live-dot" />
          Live
        </div>
      </div>
    </header>
  )
}

function RaceBar() {
  const pct = Math.round((currentRace.lap / currentRace.totalLaps) * 100)
  return (
    <div className="race-bar">
      <div className="race-stat">
        <span className="race-stat-label">Circuit</span>
        <span className="race-stat-value">{currentRace.circuit}</span>
      </div>
      <div className="race-stat">
        <span className="race-stat-label">Session</span>
        <span className="race-stat-value">{currentRace.sessionType}</span>
      </div>
      <div className="race-stat">
        <span className="race-stat-label">Remaining</span>
        <span className="race-stat-value red">{currentRace.timeRemaining}</span>
      </div>
      <div className="progress-wrap">
        <div className="progress-label">
          <span>Race Progress</span>
          <span>{pct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

function LiveTiming() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-dot" />
          Live Timing
        </div>
        <span className="card-meta">Lap {currentRace.lap}</span>
      </div>
      <table className="timing-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Driver</th>
            <th>Gap</th>
            <th>Interval</th>
            <th>Last Lap</th>
            <th>Tire</th>
            <th className="r">Speed</th>
            <th className="r">DRS</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.number}>
              <td>
                <span className={`pos${d.position === 1 ? ' p1' : ''}`}>{d.position}</span>
              </td>
              <td>
                <div className="driver-cell">
                  <div className="team-stripe" style={{ background: d.teamColor }} />
                  <div>
                    <div className="d-code">{d.code}</div>
                    <div className="d-name">{d.team}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className={`gap${d.position === 1 ? ' leader' : ''}`}>{d.gap}</span>
              </td>
              <td className="gap">{d.interval}</td>
              <td>{d.lastLap}</td>
              <td>
                <span className={`tire-badge ${d.tire}`}>{d.tire}</span>
                <span className="tire-age">{d.tireAge}</span>
              </td>
              <td className="r">{d.speed}</td>
              <td className="r">{d.drs ? <span className="drs">DRS</span> : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Telemetry() {
  const d = drivers[0]
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-dot" />
          Telemetry
        </div>
        <span className="card-meta">P1</span>
      </div>
      <div className="tele-header">
        <div className="tele-stripe" style={{ background: d.teamColor }} />
        <div>
          <div className="tele-driver">{d.code}</div>
          <div className="tele-team">{d.team}</div>
        </div>
      </div>
      <div className="tele-grid">
        <div className="tele-stat">
          <span className="tele-label">Speed</span>
          <span className="tele-val">{d.speed}<span className="u">km/h</span></span>
        </div>
        <div className="tele-stat">
          <span className="tele-label">RPM</span>
          <span className="tele-val">{d.rpm.toLocaleString()}</span>
        </div>
        <div className="tele-stat">
          <span className="tele-label">Throttle</span>
          <span className="tele-val">{d.throttle}<span className="u">%</span></span>
          <div className="mini-bar">
            <div className="mini-fill throttle" style={{ width: `${d.throttle}%` }} />
          </div>
        </div>
        <div className="tele-stat">
          <span className="tele-label">Brake</span>
          <span className="tele-val">{d.brake}<span className="u">%</span></span>
          <div className="mini-bar">
            <div className="mini-fill brake" style={{ width: `${d.brake}%` }} />
          </div>
        </div>
        <div className="gear-row">
          <div className="gear-box">{d.gear}</div>
          <div className="gear-info">
            <span className="gear-label">Gear</span>
            <span className="rpm-val">{d.rpm.toLocaleString()} rpm</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Weather() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-dot" />
          Weather
        </div>
        <span className="cond-badge">{weather.conditions}</span>
      </div>
      <div className="weather-body">
        <div className="w-stat">
          <span className="w-label">Track Temp</span>
          <span className="w-val">{weather.trackTemp}<span className="u">°C</span></span>
        </div>
        <div className="w-stat">
          <span className="w-label">Air Temp</span>
          <span className="w-val">{weather.airTemp}<span className="u">°C</span></span>
        </div>
        <div className="w-stat">
          <span className="w-label">Humidity</span>
          <span className="w-val">{weather.humidity}<span className="u">%</span></span>
        </div>
        <div className="w-stat">
          <span className="w-label">Wind</span>
          <span className="w-val">{weather.windSpeed}<span className="u">km/h {weather.windDirection}</span></span>
        </div>
        <div className="w-stat">
          <span className="w-label">Rain Chance</span>
          <span className="w-val">{weather.rainProbability}<span className="u">%</span></span>
        </div>
      </div>
    </div>
  )
}

function PitStops() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-dot" />
          Pit Stops
        </div>
        <span className="card-meta">{pitStops.length} stops</span>
      </div>
      {pitStops.map((p, i) => (
        <div className="pit-row" key={i}>
          <span className="pit-lap">LAP {p.lap}</span>
          <span className="pit-driver">{p.code}</span>
          <div className="pit-compound">
            <span className={`tire-badge ${p.from}`}>{p.from}</span>
            <span className="pit-arrow">→</span>
            <span className={`tire-badge ${p.tire}`}>{p.tire}</span>
          </div>
          <span className="pit-time">{p.duration}</span>
        </div>
      ))}
    </div>
  )
}

function FastestLaps() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-dot" />
          Fastest Laps
        </div>
      </div>
      {fastestLaps.map((fl, i) => (
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

function ChampionshipStandings() {
  const maxPts = championshipStandings[0].points
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-dot" />
          Drivers' Championship
        </div>
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

export default function App() {
  return (
    <div className="app">
      <Header />
      <RaceBar />
      <main className="main">
        <div className="grid-top">
          <LiveTiming />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Telemetry />
            <Weather />
          </div>
        </div>
        <div className="grid-bottom">
          <PitStops />
          <FastestLaps />
          <ChampionshipStandings />
        </div>
      </main>
    </div>
  )
}
