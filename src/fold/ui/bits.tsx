export type Tone = 'a' | 'b' | 'c' | 'd' | 'e' | 'f'

export function Artwork({ tone = 'a', disc = false }: { tone?: Tone; disc?: boolean }) {
  return <div className={disc ? `art art--${tone} art--disc` : `art art--${tone}`} />
}

export function StatusBar() {
  return (
    <div className="ui-status">
      <span className="ui-status__time">9:41</span>
      <span className="ui-status__icons">
        <span className="ui-status__bars" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="ui-batt" aria-hidden />
      </span>
    </div>
  )
}

export function HomeIndicator() {
  return <div className="ui-home" aria-hidden />
}
