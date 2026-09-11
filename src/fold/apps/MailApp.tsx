import { Artwork, HomeIndicator, StatusBar } from '../ui/bits'
import type { Tone } from '../ui/bits'

const MAILS: { from: string; subject: string; snip: string; time: string; unread?: boolean; tone: Tone }[] = [
  {
    from: 'Apple Design',
    subject: 'iPhone Duo 的交互设计说明',
    snip: '内容会随着折叠实时重新布局，而不是被简单缩放……',
    time: '09:12',
    unread: true,
    tone: 'b',
  },
  { from: 'Jony', subject: 'Re: 关于折痕的可见性', snip: '把亮度压到 3% 以内就基本看不见了。', time: '昨天', tone: 'd' },
  { from: 'Studio', subject: 'Q4 品牌视觉方向', snip: '三个方向都收一下，周三一起过。', time: '昨天', tone: 'e' },
  { from: 'GitHub', subject: '[fold-ui] 17 new stars', snip: 'someone starred your repository.', time: '周二', tone: 'f' },
  { from: 'Newsletter', subject: 'The Foldable Web', snip: 'Responsive is not enough — layout has to be continuous.', time: '周一', tone: 'c' },
]

export function MailApp() {
  return (
    <div className="ui-root ui-root--mail">
      <StatusBar />

      <div className="ui-hero">
        <Artwork tone="b" />
      </div>

      <div className="ui-left">
        <div className="mail__head">
          <div className="mail__h1">收件箱</div>
          <div className="mail__sub">5 封未读</div>
        </div>

        <div className="mail__herocard">
          <h3>iPhone Duo 的交互设计说明</h3>
          <p>内容会随着折叠实时重新布局 —— 而不是被简单地缩放。</p>
        </div>

        <div className="mail__list">
          {MAILS.map((m, i) => (
            <div key={m.subject} className={i === 0 ? 'mrow is-active' : 'mrow'}>
              <span className="mrow__unread" style={{ opacity: m.unread ? 1 : 0.16 }} />
              <div className="mrow__meta">
                <div className="mrow__top">
                  <span>{m.from}</span>
                  <span className="mrow__time">{m.time}</span>
                </div>
                <div className="mrow__subject">{m.subject}</div>
                <div className="mrow__snip">{m.snip}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ui-right">
        <div className="msg">
          <div className="msg__subject">iPhone Duo 的交互设计说明</div>
          <div className="msg__from">
            <div className="msg__avatar">
              <Artwork tone="b" />
            </div>
            <div>
              <div className="msg__name">Apple Design</div>
              <div className="msg__addr">design@apple.com</div>
            </div>
          </div>
          <div className="msg__body">
            <p>
              当设备展开时，界面不会重绘成另一套页面。它保持同一个坐标空间，只是把多出来的空间分配出去。
            </p>
            <p>
              左侧的列表留在原地，右侧的详情面板从折痕处生长出来。用户的注意力不需要重新定位。
            </p>
          </div>
          <div className="msg__sig">—— Sent from iPad</div>
        </div>
      </div>

      <HomeIndicator />
    </div>
  )
}
