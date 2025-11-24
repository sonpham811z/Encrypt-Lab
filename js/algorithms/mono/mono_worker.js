import { bruteForce } from "./mono_substitution.js"

self.onmessage = (e) => {
  const ciphertext = e.data.ciphertext

  try {
    const result = bruteForce(ciphertext, (progress) => {
      self.postMessage({ progress })
    })

    self.postMessage(result)
  } catch (err) {
    self.postMessage({ error: err.message || String(err) })
  }
}
