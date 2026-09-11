import { Topbar } from '../components/Topbar'
import { HandoffTransfer } from '../sections/HandoffTransfer'
import { HandoffPlayground } from '../sections/HandoffPlayground'
import Footer from '../sections/Footer'

/**
 * Third study: the inner ↔ outer hand-off as a focus pull rather than a
 * cross-fade. Same engine, same single scalar, different channel: sharpness.
 */
export default function HandoffPage() {
  return (
    <div className="page">
      <Topbar route="/handoff" tags={['内外屏交接', 'rack focus', 'CSS 3D · no WebGL']} />

      <main>
        <HandoffTransfer />
        <HandoffPlayground />
      </main>

      <Footer />
    </div>
  )
}
