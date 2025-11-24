import { QUADGRAMS } from "../../utils/quadgrams.js"
import { TRIGRAMS } from "../../utils/trigrams.js"

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

const commonWords = new Set([
  "THE","BE","TO","OF","AND","A","IN","THAT","HAVE","I","IT","FOR","NOT","ON","ARE",
  "WITH","HE","AS","YOU","DO","AT","THIS","BUT","HIS","BY","FROM","THEY","WE",
  "SAY","HER","SHE","OR","AN","WILL","MY","ONE","ALL","WOULD","THERE","THEIR",
  "WHAT","SO","UP","OUT","IF","ABOUT","WHO","GET","WHICH","GO","ME","WHEN","MAKE",
  "CAN","LIKE","TIME","NO","JUST","HIM","KNOW","TAKE","PEOPLE","INTO","YEAR","YOUR",
  "GOOD","SOME","COULD","THEM","SEE","OTHER","THAN","THEN","NOW","LOOK","ONLY","COME",
  "ITS","OVER","THINK","ALSO","BACK","AFTER","USE","TWO","HOW","OUR","WORK","FIRST",
  "WELL","WAY","EVEN","NEW","WANT","BECAUSE","ANY","THESE","GIVE","DAY","MOST","US","THOSE"
])

const QUAD = QUADGRAMS
const TRIG = TRIGRAMS

const QUAD_FALLBACK = Math.log10(0.01 / 1_000_000_000)
const TRIG_FALLBACK = Math.log10(0.01 / 1_000_000_000)

function quadgramScore(text) {
  const clean = text.replace(/[^A-Z]/g, "")
  let score = 0
  for (let i = 0; i < clean.length - 3; i++) {
    const gram = clean.substring(i, i + 4)
    score += QUAD[gram] ?? QUAD_FALLBACK
  }
  return score
}

function trigramScore(text) {
  const clean = text.replace(/[^A-Z]/g, "")
  let score = 0
  for (let i = 0; i < clean.length - 2; i++) {
    const gram = clean.substring(i, i + 3)
    score += TRIG[gram] ?? TRIG_FALLBACK
  }
  return score
}

const normalize = (text) => text.toUpperCase()

const countLetterFreq = (text) => {
  const freq = {}
  for (const c of ALPHABET) freq[c] = 0
  for (const ch of text) {
    if (ch >= "A" && ch <= "Z") freq[ch]++
  }
  return freq
}

// keyToMap: cipher → plain
const keyToMap = (key) => {
  const c2p = {}
  for (let i = 0; i < 26; i++) {
    const p = ALPHABET[i]
    const c = key[i]
    c2p[c] = p
  }
  return { c2p }
}

const decrypt = (cipherText, key) => {
  const { c2p } = keyToMap(key)
  let result = ""

  for (const ch of cipherText) {
    if (ch >= "A" && ch <= "Z") {
      result += c2p[ch] ?? "?"
    } else {
      result += ch
    }
  }
  return result
}

function scorePlaintext(text) {
  const quad = quadgramScore(text)
  const tri = trigramScore(text)

  const words = text.split(/\s+/).filter(Boolean)
  let hits = 0

  for (let w of words) {
    const pure = w.replace(/^[^A-Z]+|[^A-Z]+$/g, "")
    if (commonWords.has(pure)) hits++
  }

  const wordScore = hits / Math.max(1, words.length)

  return quad * 1.0 + tri * 0.4 + wordScore * 0.1
}

const randomKey = () => {
  const arr = ALPHABET.split("")
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr.join("")
}

const freqBasedKey = (cipherText) => {
  const engOrder = "ETAOINSHRDLCUMWFGYPBVKJXQZ"
  const cfreq = countLetterFreq(cipherText)

  const sorted = Object.keys(cfreq).sort((a, b) => cfreq[b] - cfreq[a])

  const plainToCipher = {}
  for (let i = 0; i < 26; i++) {
    plainToCipher[engOrder[i]] = sorted[i]
  }

  const unused = ALPHABET.split("").filter((c) => !Object.values(plainToCipher).includes(c))
  let idx = 0
  for (const p of ALPHABET) {
    if (!plainToCipher[p]) plainToCipher[p] = unused[idx++]
  }

  return ALPHABET.split("").map((p) => plainToCipher[p]).join("")
}

const swapKey = (key, i, j) => {
  const arr = key.split("")
  const tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
  return arr.join("")
}

const hillClimb = (cipher, initKey, maxIter = 3000, onIterProgress = null) => {
  let bestKey = initKey
  let bestPlain = decrypt(cipher, bestKey)
  let bestScore = scorePlaintext(bestPlain)

  let noImprove = 0
  const limit = 600

  for (let iter = 0; iter < maxIter; iter++) {
    const i = Math.floor(Math.random() * 26)
    let j = Math.floor(Math.random() * 26)
    while (j === i) j = Math.floor(Math.random() * 26)

    const candKey = swapKey(bestKey, i, j)
    const candPlain = decrypt(cipher, candKey)
    const candScore = scorePlaintext(candPlain)

    if (candScore > bestScore) {
      bestKey = candKey
      bestPlain = candPlain
      bestScore = candScore
      noImprove = 0
    } else {
      noImprove++
    }

    if (Math.random() < 0.002) {
      bestKey = candKey
      bestPlain = candPlain
      bestScore = candScore
      noImprove = 0
    }

    if (onIterProgress && iter % 100 === 0) {
      onIterProgress(iter / maxIter)
    }

    if (noImprove > limit) break
  }

  return { key: bestKey, plain: bestPlain, score: bestScore }
}

export const bruteForce = (ciphertext, onProgress = null) => {
  ciphertext = normalize(ciphertext)

  let globalBest = { key: null, plain: null, score: -Infinity }
  const restarts = 25
  const iterPerRestart = 3000

  for (let r = 0; r < restarts; r++) {
    let initKey

    if (r === 0) {
      initKey = freqBasedKey(ciphertext)
    } else if (r === 1) {
      initKey = freqBasedKey(ciphertext).split("").reverse().join("")
    } else {
      initKey = randomKey()
    }

    const result = hillClimb(ciphertext, initKey, iterPerRestart, (localProgress) => {
      if (onProgress) {
        const totalProgress = (r + localProgress) / restarts
        onProgress(totalProgress)
      }
    })

    if (result.score > globalBest.score) {
      globalBest = result
    }
  }

  return {
    text: globalBest.plain,
    mapping: globalBest.key,
    score: globalBest.score,
  }
}

self.crackMono = bruteForce
