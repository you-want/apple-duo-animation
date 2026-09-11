import { GalleryApp } from './GalleryApp'
import { MailApp } from './MailApp'
import { PlayerApp } from './PlayerApp'
import type { Tone } from '../ui/bits'

export type AppId = 'player' | 'mail' | 'gallery'

export interface AppMeta {
  id: AppId
  name: string
  hint: string
  cover: { tone: Tone; title: string; artist: string }
}

export const APPS: AppMeta[] = [
  {
    id: 'player',
    name: '播放器',
    hint: '封面横跨折痕 → 双栏播放',
    cover: { tone: 'a', title: 'Nightcall', artist: 'Kavinsky' },
  },
  {
    id: 'mail',
    name: '邮件',
    hint: '大图视图 → 列表 + 正文',
    cover: { tone: 'b', title: '3 封新邮件', artist: '收件箱' },
  },
  {
    id: 'gallery',
    name: '图库',
    hint: '单张照片 → 网格 + 详情',
    cover: { tone: 'd', title: '晨雾，外滩', artist: '今天 06:41' },
  },
]

export function appMeta(id: AppId): AppMeta {
  return APPS.find((a) => a.id === id) ?? APPS[0]
}

export function AppSurface({ app }: { app: AppId }) {
  if (app === 'mail') return <MailApp />
  if (app === 'gallery') return <GalleryApp />
  return <PlayerApp />
}
