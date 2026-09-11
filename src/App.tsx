import { useRoute } from './router'
import { Topbar } from './components/Topbar'
import { Narrative } from './sections/Narrative'
import { Playground } from './sections/Playground'
import { Mechanics } from './sections/Mechanics'
import { States } from './sections/States'
import Footer from './sections/Footer'
import CoverPage from './pages/CoverPage'
import HandoffPage from './pages/HandoffPage'

export default function App() {
  const route = useRoute()

  if (route === '/cover') return <CoverPage />
  if (route === '/handoff') return <HandoffPage />

  return (
    <div className="page">
      <Topbar route="/" tags={['React · GSAP', 'CSS 3D · no WebGL', 'iPhone Duo study']} />

      <main>
        <Narrative />
        <Playground />
        <Mechanics />
        <States />
      </main>

      <Footer />
    </div>
  )
}
