import { PhotoLibrary } from './HomeSurface'

/** Photos continues onto the fixed right panel when the device opens. */
export function HomeCover() {
  return <div className="duo-cover">
    <PhotoLibrary cover />
    <div className="duo-cover__soft" aria-hidden><PhotoLibrary cover /></div>
  </div>
}
