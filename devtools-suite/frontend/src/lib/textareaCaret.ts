/**
 * Pixel position of the caret inside a textarea, relative to the textarea's own top-left.
 * Standard trick: build a hidden div that mirrors the textarea's box model and font exactly,
 * fill it with the text up to the caret, and measure where a marker span at the end lands.
 */
const MIRRORED_PROPERTIES = [
  'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust',
  'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent',
  'textDecoration', 'letterSpacing', 'wordSpacing', 'tabSize', 'whiteSpace', 'wordWrap',
] as const

export function getCaretCoordinates(el: HTMLTextAreaElement, position: number): { top: number; left: number; height: number } {
  const div = document.createElement('div')
  document.body.appendChild(div)

  const style = div.style
  const computed = window.getComputedStyle(el)

  style.whiteSpace = 'pre-wrap'
  style.wordWrap = 'break-word'
  style.position = 'absolute'
  style.visibility = 'hidden'

  for (const prop of MIRRORED_PROPERTIES) {
    style[prop] = computed[prop]
  }

  div.textContent = el.value.substring(0, position)
  const span = document.createElement('span')
  span.textContent = el.value.substring(position) || '.'
  div.appendChild(span)

  const top = span.offsetTop + parseInt(computed.borderTopWidth || '0', 10)
  const left = span.offsetLeft + parseInt(computed.borderLeftWidth || '0', 10)
  const height = parseInt(computed.lineHeight || '16', 10)

  document.body.removeChild(div)
  return { top: top - el.scrollTop, left: left - el.scrollLeft, height }
}
