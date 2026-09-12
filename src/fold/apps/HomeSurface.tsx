import type { CSSProperties } from 'react'
import lake from '../../assets/duo/lake.jpg'
import summit from '../../assets/duo/summit.jpg'
import forest from '../../assets/duo/forest.jpg'
import water from '../../assets/duo/water.jpg'
import morning from '../../assets/duo/morning.jpg'
import night from '../../assets/duo/night.jpg'
import valley from '../../assets/duo/valley.jpg'
import wild from '../../assets/duo/wild.jpg'

type SymbolName = 'close' | 'up' | 'photo' | 'search' | 'check' | 'more' | 'attach' | 'pen' | 'albums' | 'chevron' | 'sparkle'
const symbols: Record<SymbolName, string> = {
  close: 'm7 7 10 10M7 17 17 7', up: 'M12 19V5m-6 6 6-6 6 6',
  photo: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm-1 12 5-5 5 5 3-3 3 3M15 8h.01',
  search: 'M16 16 21 21M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  check: 'm5 12 4 4L19 6', more: 'M5 12h.01M12 12h.01M19 12h.01',
  attach: 'm8 12 6-6a3 3 0 0 1 4 4L9 19a5 5 0 0 1-7-7l9-9m-6 12 9-9',
  pen: 'm15 4 5 5M4 20l5-1L20 8a3 3 0 0 0-4-4L5 15Z',
  albums: 'M7 3h10M5 6h14M4 9h16v12H4Z', chevron: 'm14 5-7 7 7 7',
  sparkle: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
}

function Symbol({ name }: { name: SymbolName }) {
  return <svg className="duo-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={symbols[name]} /></svg>
}

const PHOTOS = [
  { src: summit, label: '雪山与松林' }, { src: forest, label: '林间小径' },
  { src: water, label: '湖上的小船' }, { src: valley, label: '穿过山谷' },
  { src: lake, label: '湖畔的清晨' }, { src: wild, label: '山野与鹿' },
  { src: morning, label: '晨光中的山峦' }, { src: night, label: '雪山星空' },
  { src: water, label: '碧绿的湖水', position: '75% 80%' },
]
const SELECTED = 4

function PhotoShot({ index = SELECTED }: { index?: number }) {
  const photo = PHOTOS[index]
  return <img className="duo-photo" src={photo.src} alt={photo.label} draggable={false} style={{ objectPosition: photo.position } as CSSProperties} />
}

/** A shared Photos layout keeps the selected image recognizable after opening. */
export function PhotoLibrary({ cover = false }: { cover?: boolean }) {
  return <div className={`duo-library${cover ? ' duo-library--cover' : ''}`}>
    <div className="duo-app-grip" aria-hidden />
    <header className="duo-library__header">
      <div className="duo-library__eyebrow"><span>9月 · 周末相簿</span><span className="duo-library__more"><Symbol name="more" /></span></div>
      <div className="duo-library__title"><strong>山野之间</strong><span className="duo-library__select">选择</span></div>
      <div className="duo-library__meta"><span>留住光，也留住这一刻。</span><span>24 张照片</span></div>
    </header>
    <div className="duo-library__grid">
      {PHOTOS.map((photo, index) => <div className={`duo-library__shot${index === SELECTED ? ' is-selected' : ''}`} key={photo.label}>
        <PhotoShot index={index} />
        {index === SELECTED && <span className="duo-library__check"><Symbol name="check" /></span>}
      </div>)}
    </div>
    <footer className="duo-library__footer">
      <div className="duo-library__tabs"><span className="is-active"><Symbol name="photo" />图库</span><span><Symbol name="albums" />相簿</span><span><Symbol name="search" />搜索</span></div>
      <div className="duo-home-line" aria-hidden />
    </footer>
    {cover && <i className="duo-library__camera" aria-hidden />}
  </div>
}

function MailDraft() {
  return <div className="duo-mail">
    <div className="duo-app-grip" aria-hidden />
    <header className="duo-mail__header"><span className="duo-mail__cancel">取消</span><strong>新邮件</strong><span className="duo-mail__send"><Symbol name="up" /></span></header>
    <div className="duo-mail__fields">
      <div><span>收件人</span><b className="duo-mail__recipient"><i>林</i>林同学</b></div>
      <div><span>发件人</span><b>我</b><span className="duo-mail__cc">抄送 / 密送</span></div>
      <div className="duo-mail__subject"><span>主题</span><b>把山里的清晨，寄给你</b></div>
    </div>
    <div className="duo-mail__body"><p>这张湖边的照片，是我最喜欢的一张。<br />下次，我们一起去。</p>
      <figure className="duo-mail__attachment"><PhotoShot /><figcaption><span>湖畔的清晨</span><span>HEIC · 2.4 MB</span></figcaption></figure>
    </div>
    <footer className="duo-mail__footer"><span className="duo-mail__format">Aa</span><Symbol name="photo" /><Symbol name="attach" /><Symbol name="pen" /><div className="duo-home-line" aria-hidden /></footer>
  </div>
}

/** Distinct applications, cropped by the physical leaves on one coordinate plane. */
function InnerWorkspace() {
  return <div className="duo-workspace">
    <div className="duo-workspace__pane duo-workspace__pane--mail"><MailDraft /></div>
    <div className="duo-workspace__pane duo-workspace__pane--photos"><PhotoLibrary /></div>
    <div className="duo-workspace__divider" aria-hidden />
  </div>
}

export function HomeSurface() {
  return <div className="duo-focus"><InnerWorkspace /><div className="duo-focus__soft" aria-hidden><InnerWorkspace /></div></div>
}
