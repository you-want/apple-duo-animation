import { Topbar } from '../components/Topbar'
import { HandoffTransfer } from '../sections/HandoffTransfer'
import { HandoffPlayground } from '../sections/HandoffPlayground'
import Footer from '../sections/Footer'

export default function HandoffPage() {
  return (
    <div className="page">
      <Topbar route="/handoff" tags={['内外屏交接', 'Apple 展示片研究', 'CSS 3D · no WebGL']} />

      <main>
        <HandoffTransfer />
        <HandoffPlayground />
      </main>

      <Footer />
    </div>
  )
}
