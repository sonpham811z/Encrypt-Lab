export const encrypt = (input, key) => {
  console.log("[Caesar] Encrypting with key:", key)
  const shift = Number.parseInt(key) || 3
  const result = input
    .split("")
    .map((char) => {
      if (/[a-z]/.test(char)) {
        return String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97)
      }
      if (/[A-Z]/.test(char)) {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65)
      }
      return char
    })
    .join("")
  return result
}

export const decrypt = (cipherText, key) => {
  console.log("[Caesar] Decrypting with key:", key)
  let result = "";

  for (let i = 0; i < cipherText.length; i++) {
    const char = cipherText[i];

    if (/[a-z]/.test(char)) {
      const offset = char.charCodeAt(0) - 97;
      const dec_code = (offset - key + 26) % 26;

      result += String.fromCharCode(dec_code + 97);
    } 
    else if (/[A-Z]/.test(char)) {

      const offset = char.charCodeAt(0) - 65;
      const dec_code = (offset - key + 26) % 26;

      result += String.fromCharCode(dec_code + 65);
    } 
    else {
      result += char;
    }
  }
  return result;
}

export const bruteForce = (ciphertext) => {
  console.log("[Caesar] Starting brute force attack...")
  const results = []

  for (let shift = 0; shift < 26; shift++) {
    const decrypted = decrypt(ciphertext, shift)
    results.push({
      shift: shift,
      text: decrypted,
      score: calculateEnglishScore(decrypted), 
    })
  }

  results.sort((a, b) => b.score - a.score)
  return results[0] 
}

export const calculateEnglishScore = (text) => {
  const commonWords = ["the", "and", "is", "a", "to", "of", "in", "for", "it", "that", "with", "be", "on", "as", "this","are","have","has","go","when","not","had","by","so","which"]
  const lowerText = text.toLowerCase()
  let score = 0

  commonWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g")
    const matches = lowerText.match(regex)
    score += matches ? matches.length * 10 : 0
  })


  const alphaRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length
  score += alphaRatio * 100

  return score
}
