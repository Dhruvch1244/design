/**
 * Compact MD5 implementation. MD5 isn't exposed by the Web Crypto API (browsers only expose
 * SHA-1/256/384/512), but plenty of legacy systems still use it for checksums, so it's worth
 * having offline rather than sending data to a random online md5 generator.
 */
export function md5(input: string): string {
  const bytes = new TextEncoder().encode(input)
  const words = bytesToWords(bytes)
  const bitLength = bytes.length * 8

  words[bitLength >> 5] |= 0x80 << (bitLength % 32)
  words[(((bitLength + 64) >>> 9) << 4) + 14] = bitLength

  let a = 1732584193
  let b = -271733879
  let c = -1732584194
  let d = 271733878

  const S11 = 7, S12 = 12, S13 = 17, S14 = 22
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21

  for (let i = 0; i < words.length; i += 16) {
    const olda = a, oldb = b, oldc = c, oldd = d

    a = ff(a, b, c, d, words[i + 0] ?? 0, S11, -680876936)
    d = ff(d, a, b, c, words[i + 1] ?? 0, S12, -389564586)
    c = ff(c, d, a, b, words[i + 2] ?? 0, S13, 606105819)
    b = ff(b, c, d, a, words[i + 3] ?? 0, S14, -1044525330)
    a = ff(a, b, c, d, words[i + 4] ?? 0, S11, -176418897)
    d = ff(d, a, b, c, words[i + 5] ?? 0, S12, 1200080426)
    c = ff(c, d, a, b, words[i + 6] ?? 0, S13, -1473231341)
    b = ff(b, c, d, a, words[i + 7] ?? 0, S14, -45705983)
    a = ff(a, b, c, d, words[i + 8] ?? 0, S11, 1770035416)
    d = ff(d, a, b, c, words[i + 9] ?? 0, S12, -1958414417)
    c = ff(c, d, a, b, words[i + 10] ?? 0, S13, -42063)
    b = ff(b, c, d, a, words[i + 11] ?? 0, S14, -1990404162)
    a = ff(a, b, c, d, words[i + 12] ?? 0, S11, 1804603682)
    d = ff(d, a, b, c, words[i + 13] ?? 0, S12, -40341101)
    c = ff(c, d, a, b, words[i + 14] ?? 0, S13, -1502002290)
    b = ff(b, c, d, a, words[i + 15] ?? 0, S14, 1236535329)

    a = gg(a, b, c, d, words[i + 1] ?? 0, S21, -165796510)
    d = gg(d, a, b, c, words[i + 6] ?? 0, S22, -1069501632)
    c = gg(c, d, a, b, words[i + 11] ?? 0, S23, 643717713)
    b = gg(b, c, d, a, words[i + 0] ?? 0, S24, -373897302)
    a = gg(a, b, c, d, words[i + 5] ?? 0, S21, -701558691)
    d = gg(d, a, b, c, words[i + 10] ?? 0, S22, 38016083)
    c = gg(c, d, a, b, words[i + 15] ?? 0, S23, -660478335)
    b = gg(b, c, d, a, words[i + 4] ?? 0, S24, -405537848)
    a = gg(a, b, c, d, words[i + 9] ?? 0, S21, 568446438)
    d = gg(d, a, b, c, words[i + 14] ?? 0, S22, -1019803690)
    c = gg(c, d, a, b, words[i + 3] ?? 0, S23, -187363961)
    b = gg(b, c, d, a, words[i + 8] ?? 0, S24, 1163531501)
    a = gg(a, b, c, d, words[i + 13] ?? 0, S21, -1444681467)
    d = gg(d, a, b, c, words[i + 2] ?? 0, S22, -51403784)
    c = gg(c, d, a, b, words[i + 7] ?? 0, S23, 1735328473)
    b = gg(b, c, d, a, words[i + 12] ?? 0, S24, -1926607734)

    a = hh(a, b, c, d, words[i + 5] ?? 0, S31, -378558)
    d = hh(d, a, b, c, words[i + 8] ?? 0, S32, -2022574463)
    c = hh(c, d, a, b, words[i + 11] ?? 0, S33, 1839030562)
    b = hh(b, c, d, a, words[i + 14] ?? 0, S34, -35309556)
    a = hh(a, b, c, d, words[i + 1] ?? 0, S31, -1530992060)
    d = hh(d, a, b, c, words[i + 4] ?? 0, S32, 1272893353)
    c = hh(c, d, a, b, words[i + 7] ?? 0, S33, -155497632)
    b = hh(b, c, d, a, words[i + 10] ?? 0, S34, -1094730640)
    a = hh(a, b, c, d, words[i + 13] ?? 0, S31, 681279174)
    d = hh(d, a, b, c, words[i + 0] ?? 0, S32, -358537222)
    c = hh(c, d, a, b, words[i + 3] ?? 0, S33, -722521979)
    b = hh(b, c, d, a, words[i + 6] ?? 0, S34, 76029189)
    a = hh(a, b, c, d, words[i + 9] ?? 0, S31, -640364487)
    d = hh(d, a, b, c, words[i + 12] ?? 0, S32, -421815835)
    c = hh(c, d, a, b, words[i + 15] ?? 0, S33, 530742520)
    b = hh(b, c, d, a, words[i + 2] ?? 0, S34, -995338651)

    a = ii(a, b, c, d, words[i + 0] ?? 0, S41, -198630844)
    d = ii(d, a, b, c, words[i + 7] ?? 0, S42, 1126891415)
    c = ii(c, d, a, b, words[i + 14] ?? 0, S43, -1416354905)
    b = ii(b, c, d, a, words[i + 5] ?? 0, S44, -57434055)
    a = ii(a, b, c, d, words[i + 12] ?? 0, S41, 1700485571)
    d = ii(d, a, b, c, words[i + 3] ?? 0, S42, -1894986606)
    c = ii(c, d, a, b, words[i + 10] ?? 0, S43, -1051523)
    b = ii(b, c, d, a, words[i + 1] ?? 0, S44, -2054922799)
    a = ii(a, b, c, d, words[i + 8] ?? 0, S41, 1873313359)
    d = ii(d, a, b, c, words[i + 15] ?? 0, S42, -30611744)
    c = ii(c, d, a, b, words[i + 6] ?? 0, S43, -1560198380)
    b = ii(b, c, d, a, words[i + 13] ?? 0, S44, 1309151649)
    a = ii(a, b, c, d, words[i + 4] ?? 0, S41, -145523070)
    d = ii(d, a, b, c, words[i + 11] ?? 0, S42, -1120210379)
    c = ii(c, d, a, b, words[i + 2] ?? 0, S43, 718787259)
    b = ii(b, c, d, a, words[i + 9] ?? 0, S44, -343485551)

    a = add32(a, olda)
    b = add32(b, oldb)
    c = add32(c, oldc)
    d = add32(d, oldd)
  }

  return [a, b, c, d].map(wordToHex).join('')
}

function bytesToWords(bytes: Uint8Array): number[] {
  const words = new Array<number>(((bytes.length + 8) >>> 6) * 16 + 16).fill(0)
  for (let i = 0; i < bytes.length; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8)
  }
  return words
}

function wordToHex(word: number): string {
  let hex = ''
  for (let i = 0; i < 4; i++) {
    const byte = (word >> (i * 8)) & 0xff
    hex += byte.toString(16).padStart(2, '0')
  }
  return hex
}

function add32(a: number, b: number): number {
  return (a + b) & 0xffffffff
}

function rotateLeft(x: number, n: number): number {
  return (x << n) | (x >>> (32 - n))
}

function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
  return add32(rotateLeft(add32(add32(a, q), add32(x, t)), s), b)
}

function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn((b & c) | (~b & d), a, b, x, s, t)
}
function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn((b & d) | (c & ~d), a, b, x, s, t)
}
function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn(b ^ c ^ d, a, b, x, s, t)
}
function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn(c ^ (b | ~d), a, b, x, s, t)
}
