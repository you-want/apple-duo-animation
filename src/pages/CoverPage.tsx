import { Topbar } from '../components/Topbar'
import { CoverTransfer } from '../sections/CoverTransfer'
import { CoverPlayground } from '../sections/CoverPlayground'
import Footer from '../sections/Footer'

/**
 * Second study: keeping the *content* alive across the fold.
 * The main study is about the hardware; this one is about the hand-off.
 */
export default function CoverPage() {
  return (
    <div className="page">
      <Topbar route="/cover" tags={['外屏 → 内屏', 'shared element', 'CSS 3D · no WebGL']} />

      <main>
        <CoverTransfer />
        <CoverPlayground />
      </main>

      <Footer />
    </div>
  )
}
