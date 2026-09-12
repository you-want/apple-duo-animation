import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

// Load the pure mapping module without adding a test framework or build output.
const source = readFileSync(new URL('../src/fold/mapping.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { computeReferenceFrame, computePanelSize, focusAt, writeFoldVars } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

for (const [width, height] of [[688, 700], [350, 420], [1024, 600]]) {
  const size = computePanelSize(width, height, .78, .42, 1.46)
  assert.ok(size.panelW * 2 <= width, 'unfolded device fits stage width')
  const el = { style: { setProperty: (key, value) => vars.set(key, value) } }
  const vars = new Map()
  const frames = []
  for (let n = 0; n <= 100; n++) {
    const p = n / 100
    const f = computeReferenceFrame(p, size)
    assert.ok(Object.values(f).every(Number.isFinite), 'finite camera and hinge')
    assert.equal(focusAt(p).b, 1, 'fixed display stays sharp')
    if (n) assert.ok(f.fold <= frames[n - 1].fold, 'hinge opens without reversal')
    writeFoldVars(el, p, size, 0, true)
    frames.push({ ...f, vars: Object.fromEntries(vars) })
  }
  assert.equal(vars.get('--moving-filter'), 'none', 'open screen fully resolves')
  for (let n = 100; n >= 0; n--) {
    writeFoldVars(el, n / 100, size, 0, true)
    assert.deepEqual(Object.fromEntries(vars), frames[n].vars, 'closing retraces opening')
  }
  assert.equal(vars.get('--cover-filter'), 'none', 'closed cover fully resolves')
  assert.equal(frames[0].fold, 180)
  assert.equal(frames[100].fold, 0)
  assert.equal(Math.abs(frames[100].camX), 0)
}
console.log('Handoff: sizing, fixed-screen sharpness, endpoints and bidirectional frames passed.')
