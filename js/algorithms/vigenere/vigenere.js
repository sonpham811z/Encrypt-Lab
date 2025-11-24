const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

const normalizeLetters = (text) => {
  return text.toUpperCase().replace(/[^A-Z]/g, "")
}

const gcd = (a, b) => {
  return b === 0 ? a : gcd(b, a % b)
}

const kasiski = (cipher) => {
  const MIN_LEN = 3
  const distances = []

  for (let size = MIN_LEN; size <= 5; size++) {
    const seen = {}
    for (let i = 0; i < cipher.length - size; i++) {
      const seq = cipher.slice(i, i + size)
      if (!seen[seq]) seen[seq] = i
      else {
        distances.push(i - seen[seq])
        seen[seq] = i
      }
    }
  }

  const guesses = new Set()
  for (let i = 0; i < distances.length - 1; i++) {
    const g = gcd(distances[i], distances[i + 1])
    if (g > 1 && g < 30) guesses.add(g)
  }
  return [...guesses]
}

const indexOfCoincidence = (text) => {
  const freq = Array(26).fill(0)
  for (const c of text) freq[c.charCodeAt(0) - 65]++

  const N = text.length
  let ic = 0
  for (const f of freq) ic += f * (f - 1)
  return ic / (N * (N - 1))
}

const guessKeyLengthByIC = (cipher, maxLen = 20) => {
  const good = []
  for (let k = 1; k <= maxLen; k++) {
    let avg = 0
    for (let i = 0; i < k; i++) {
      let col = ""
      for (let j = i; j < cipher.length; j += k) col += cipher[j]
      avg += indexOfCoincidence(col)
    }
    avg /= k
    if (avg > 0.045) good.push(k)
  }
  return good
}

const EN_FREQ = [
  8.12, 1.49, 2.71, 4.32, 12.02, 2.3, 2.03, 5.92, 7.31, 0.1, 0.69, 3.98, 2.61, 6.95, 7.68, 1.82, 0.11, 6.02, 6.28, 9.1,
  2.88, 1.11, 2.09, 0.17, 2.11, 0.07,
]

const chiSquareScore = (text) => {
  const freq = Array(26).fill(0)
  for (const c of text) freq[c.charCodeAt(0) - 65]++

  const N = text.length
  let score = 0

  for (let i = 0; i < 26; i++) {
    const expected = (EN_FREQ[i] * N) / 100
    score += (freq[i] - expected) ** 2 / (expected || 1)
  }
  return -score
}

const bestShift = (col) => {
  let bestShift = 0
  let bestScore = Number.NEGATIVE_INFINITY

  for (let shift = 0; shift < 26; shift++) {
    let decrypted = ""
    for (const c of col) {
      const val = (c.charCodeAt(0) - 65 - shift + 26) % 26
      decrypted += ALPHABET[val]
    }
    const score = chiSquareScore(decrypted)
    if (score > bestScore) {
      bestScore = score
      bestShift = shift
    }
  }
  return bestShift
}

const decryptPreserve = (cipher, key) => {
  let out = ""
  let ki = 0

  for (const ch of cipher) {
    if (!/[A-Za-z]/.test(ch)) {
      out += ch
      continue
    }

    const upper = ch.toUpperCase()
    const k = key[ki % key.length].charCodeAt(0) - 65
    const dec = (upper.charCodeAt(0) - 65 - k + 26) % 26

    const real = ALPHABET[dec]
    out += ch === ch.toUpperCase() ? real : real.toLowerCase()
    ki++
  }

  return out
}

export function breakVigenere(fullCipher, onProgress = null) {
  const cipher = normalizeLetters(fullCipher)

  const guess1 = kasiski(cipher)
  const guess2 = guessKeyLengthByIC(cipher)

  let keyLens = [...new Set([...guess1, ...guess2])]

  if (keyLens.length === 0) keyLens = [3, 4, 5, 6, 7, 8]

  let best = null
  let bestScore = Number.NEGATIVE_INFINITY

  for (let idx = 0; idx < keyLens.length; idx++) {
    const klen = keyLens[idx]
    let key = ""
    for (let i = 0; i < klen; i++) {
      let col = ""
      for (let j = i; j < cipher.length; j += klen) col += cipher[j]
      key += ALPHABET[bestShift(col)]
    }

    const plaintext = decryptPreserve(fullCipher, key)
    const score = chiSquareScore(normalizeLetters(plaintext))

    if (score > bestScore) {
      bestScore = score
      best = { key, plaintext }
    }

    if (onProgress) {
      onProgress((idx + 1) / keyLens.length)
    }
  }

  return best
}



