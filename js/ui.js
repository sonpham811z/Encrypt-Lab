import { logger } from "./utils.js"
import * as caesar from "./algorithms/caesar/caesar.js"
import * as vigenere from "./algorithms/vigenere/vigenere.js"
import * as monoSubstitution from "./algorithms/mono/mono_substitution.js"
import * as des from "./algorithms/des/des.js"
import * as aes from "./algorithms//aes/aes.js"

const algorithms = [
  {
    id: "caesar",
    name: "Caesar Cipher",
    description: "Simple substitution cipher with fixed shift",
    module: caesar,
    requiresMode: false,
    isBruteForce: true,
  },
  {
    id: "vigenere",
    name: "Vigenère Cipher",
    description: "Polyalphabetic substitution cipher",
    module: vigenere,
    requiresMode: false,
  },
  {
    id: "mono_substitution",
    name: "Monoalphabetic Substitution",
    description: "Single alphabet substitution cipher",
    module: monoSubstitution,
    requiresMode: false,
    isBruteForce: true,
  },
  {
    id: "des",
    name: "DES (Data Encryption Standard)",
    description: "56-bit block cipher algorithm",
    module: des,
    requiresMode: true,
  },
  {
    id: "aes",
    name: "AES (Advanced Encryption Standard)",
    description: "128/192/256-bit symmetric encryption",
    module: aes,
    requiresMode: true,
  },
]

let currentAlgorithm = null

export function initializeUI() {
  renderAlgorithmsList()
  setupEventListeners()
}

function renderAlgorithmsList() {
  const list = document.getElementById("algorithmsList")
  list.innerHTML = ""

  algorithms.forEach((algo) => {
    const card = document.createElement("div")
    card.className = "algorithm-card"
    card.innerHTML = `
      <div class="algorithm-name">${algo.name}</div>
      <div class="algorithm-desc">${algo.description}</div>
      <button class="algorithm-btn" data-id="${algo.id}">Open</button>
    `

    const button = card.querySelector("button")
    button.addEventListener("click", (event) => {
      selectAlgorithm(algo, event)
    })

    list.appendChild(card)
  })
}

function selectAlgorithm(algo, event) {
  currentAlgorithm = algo
  logger.log(`[UI] Selected algorithm: ${algo.name}`)

  document.querySelectorAll(".algorithm-card").forEach((card) => {
    card.classList.remove("active")
  })

  if (event && event.currentTarget) {
    const card = event.currentTarget.closest(".algorithm-card")
    if (card) {
      card.classList.add("active")
    }
  }

  renderAlgorithmView(algo)
}

function renderAlgorithmView(algo) {
  const workspace = document.getElementById("workspaceContent")

  // ------------------------------------------
  // OVERRIDE UI CHO VIGENERE
  // ------------------------------------------
  if (algo.id === "vigenere") {
    workspace.innerHTML = `
      <div class="algorithm-view">
        <div class="algorithm-header">
          <h2>${algo.name}</h2>
          <p>${algo.description}</p>
          <p class="task-info">Upload a ciphertext file to automatically detect the key and decrypt the Vigenère cipher.</p>
        </div>

        <div class="file-upload-section">
          <label class="form-label">Upload Ciphertext File:</label>
          <div class="file-input-wrapper">
            <input type="file" class="file-input" id="fileInput" accept=".txt">
            <span class="file-input-label">Choose file or drag & drop</span>
          </div>
        </div>

        <div class="button-group">
          <button class="btn" id="decryptFileBtn">Decrypt File</button>
        </div>

        <div class="progress-section" id="progressSection" style="display: none;">
          <div class="spinner" id="progressSpinner"></div>
          <div class="progress-label" id="progressLabel">Decrypting...</div>
        </div>

        <div class="output-section">
          <div class="output-label">
            Results:
            <button class="btn btn-secondary" id="downloadBtn">Download Plaintext</button>
          </div>

          <div class="results-container">
            <div class="result-item">
              <div class="result-label">Detected Key:</div>
              <div class="result-value" id="detectedKey">-</div>
            </div>

            <div class="result-item">
              <label class="result-label">Plaintext:</label>
              <textarea class="output-textarea" id="outputText" readonly></textarea>
            </div>
          </div>
        </div>

        <div class="console-panel">
          <div class="console-header">
            Console Output
            <button class="btn btn-secondary" id="clearConsoleBtn">Clear</button>
          </div>
          <div class="console-log" id="consoleLog"></div>
        </div>
      </div>
    `

    setupVigenereFileListeners(algo)
    return
  }

  // ------------------------------------------
  // BRUTE FORCE UI CHO CAESAR + MONO
  // ------------------------------------------
  if (algo.isBruteForce) {
    workspace.innerHTML = `
      <div class="algorithm-view">
        <div class="algorithm-header">
          <h2>${algo.name}</h2>
          <p>${algo.description}</p>
          <p class="task-info">${
            algo.id === "caesar"
              ? "Upload a ciphertext file to automatically decrypt using brute force attack (tries all 26 shifts)."
              : "Upload a ciphertext file to automatically decrypt using frequency analysis and hill climbing optimization."
          }</p>
        </div>

        <div class="file-upload-section">
          <label class="form-label">Upload Ciphertext File:</label>
          <div class="file-input-wrapper">
            <input type="file" class="file-input" id="fileInput" accept=".txt">
            <span class="file-input-label">Choose file or drag & drop</span>
          </div>
        </div>

        <div class="button-group">
          <button class="btn" id="decryptFileBtn">Decrypt File</button>
        </div>

        <!-- Spinner progress indicator -->
        <div class="progress-section" id="progressSection" style="display: none;">
          <div class="spinner" id="progressSpinner"></div>
          <div class="progress-label" id="progressLabel">Decrypting...</div>
          <div class="progress-bar" id="progressBar"></div>
          <div class="progress-text" id="progressText"></div>
        </div>

        <div class="output-section">
          <div class="output-label">
            Results:
            <div>
              <button class="btn btn-secondary" id="downloadBtn">Download Plaintext</button>
            </div>
          </div>
          <div class="results-container">
            ${
              algo.id === "mono_substitution"
                ? `
              <div class="result-item">
                <div class="result-label">Log-Likelihood Score:</div>
                <div class="result-value" id="scoreValue">-</div>
              </div>
              <div class="result-item">
                <div class="result-label">Mapping (Cipher → Plaintext):</div>
                <textarea class="output-textarea" id="mappingText" readonly></textarea>
              </div>
              <div class="result-item">
                <label class="result-label">Plaintext:</label>
                <textarea class="output-textarea" id="outputText" readonly></textarea>
              </div>
            `
                : `
              <div class="result-item">
                <div class="result-label">Shift Amount (k):</div>
                <div class="result-value" id="shiftValue">-</div>
              </div>
              <div class="result-item">
                <label class="result-label">Plaintext:</label>
                <textarea class="output-textarea" id="outputText" readonly></textarea>
              </div>
            `
            }
          </div>
        </div>

        <div class="console-panel">
          <div class="console-header">
            Console Output
            <button class="btn btn-secondary" id="clearConsoleBtn">Clear</button>
          </div>
          <div class="console-log" id="consoleLog"></div>
        </div>
      </div>
    `

    setupCaesarBruteForceListeners(algo)
    return
  }

  // ------------------------------------------
  // NORMAL MODE (AES / DES)
  // ------------------------------------------
  let modeSelect = ""

  if (algo.id === "aes" || algo.id === "des") {
    modeSelect = `
      <div class="aes-des-settings">
        <div class="form-group">
          <label class="form-label">Mode:</label>
          <select class="form-select" id="modeSelect">
            <option value="ecb">ECB (Electronic Codebook)</option>
            <option value="cbc">CBC (Cipher Block Chaining)</option>
          </select>
        </div>

        <div class="form-group" id="ivGroup" style="display:none;">
          <label class="form-label">Initialization Vector (IV):</label>
          <input type="text" class="form-input" id="ivInput"
                 placeholder="Enter IV: AES = 16 bytes, DES = 8 bytes (ASCII or HEX)">
          <small class="form-help">
            CBC mode requires IV. ECB mode ignores IV.
          </small>
        </div>
      </div>
    `
  } else if (algo.requiresMode) {
    modeSelect = `
      <div class="form-group">
        <label class="form-label">Mode:</label>
        <select class="form-select" id="modeSelect">
          <option value="ecb">ECB (Electronic Codebook)</option>
          <option value="cbc">CBC (Cipher Block Chaining)</option>
        </select>
      </div>
    `
  }

  workspace.innerHTML = `
    <div class="algorithm-view">
      <div class="algorithm-header">
        <h2>${algo.name}</h2>
        <p>${algo.description}</p>
      </div>

      <div class="form-group">
        <label class="form-label">Input (Plaintext/Ciphertext):</label>
        <textarea class="form-textarea" id="inputText" placeholder="Enter text to encrypt..."></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Key:</label>
        <input type="text" class="form-input" id="keyInput" placeholder="Enter encryption key...">
      </div>

      ${modeSelect}

      <div class="button-group">
        <button class="btn" id="encryptBtn">Encrypt</button>
        <button class="btn" id="decryptBtn">Decrypt</button>
      </div>

      <div class="output-section">
        <div class="output-label">
          Output (Ciphertext/Plaintext):
          <div>
            <button class="btn btn-secondary" id="copyBtn">Copy</button>
            <button class="btn btn-secondary" id="downloadBtn">Download</button>
          </div>
        </div>
        <textarea class="output-textarea" id="outputText" readonly></textarea>
      </div>

      <div class="console-panel">
        <div class="console-header">
          Console Output
          <button class="btn btn-secondary" id="clearConsoleBtn">Clear</button>
        </div>
        <div class="console-log" id="consoleLog"></div>
      </div>
    </div>
  `

  setupAlgorithmListeners(algo)
}

// ------------------------------------------------------------------
// LISTENER FOR VIGENERE
// ------------------------------------------------------------------
function setupVigenereFileListeners(algo) {
  const fileInput = document.getElementById("fileInput")
  const decryptFileBtn = document.getElementById("decryptFileBtn")
  const downloadBtn = document.getElementById("downloadBtn")
  const clearConsoleBtn = document.getElementById("clearConsoleBtn")

  const outputText = document.getElementById("outputText")
  const detectedKey = document.getElementById("detectedKey")
  const fileInputLabel = document.querySelector(".file-input-label")
  const fileInputWrapper = document.querySelector(".file-input-wrapper")
  const progressSection = document.getElementById("progressSection")

  fileInput.addEventListener("change", (e) => {
    if (e.target.files[0]) {
      const f = e.target.files[0]
      const size = (f.size / 1024).toFixed(2)
      fileInputLabel.textContent = `✓ ${f.name} (${size} KB)`
      fileInputLabel.classList.add("file-loaded")
      logger.log(`File selected: ${f.name}`)
    }
  })

  fileInputWrapper.addEventListener("dragover", (e) => {
    e.preventDefault()
    fileInputWrapper.classList.add("drag-over")
  })

  fileInputWrapper.addEventListener("dragleave", () => {
    fileInputWrapper.classList.remove("drag-over")
  })

  fileInputWrapper.addEventListener("drop", (e) => {
    e.preventDefault()
    fileInputWrapper.classList.remove("drag-over")
    fileInput.files = e.dataTransfer.files
    fileInput.dispatchEvent(new Event("change"))
  })

  decryptFileBtn.addEventListener("click", () => {
    const file = fileInput.files[0]
    if (!file) {
      logger.error("Please select a ciphertext file")
      return
    }

    decryptFileBtn.classList.add("btn-loading")
    decryptFileBtn.disabled = true
    progressSection.style.display = "flex"

    const reader = new FileReader()
    reader.onload = (ev) => {
      const ciphertext = ev.target.result
      logger.log(`[Vigenere] Loaded file (${ciphertext.length} chars)`)

      try {
        const result = algo.module.breakVigenere(ciphertext)

        detectedKey.textContent = result.key
        outputText.value = result.plaintext

        logger.success(`[Vigenere] Decryption successful! Key = ${result.key}`)
      } catch (err) {
        logger.error(`Error: ${err.message}`)
      }

      decryptFileBtn.classList.remove("btn-loading")
      decryptFileBtn.disabled = false
      progressSection.style.display = "none"
    }

    reader.readAsText(file)
  })

  downloadBtn.addEventListener("click", () => {
    const text = outputText.value
    if (!text) return

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "vigenere-plaintext.txt"
    a.click()

    URL.revokeObjectURL(url)
    logger.success("Plaintext downloaded")
  })

  clearConsoleBtn.addEventListener("click", () => logger.clear())
}

// ------------------------------------------------------------------
// LISTENER FOR CAESAR + MONO (file brute force)
// ------------------------------------------------------------------
function setupCaesarBruteForceListeners(algo) {
  const fileInput = document.getElementById("fileInput")
  const decryptFileBtn = document.getElementById("decryptFileBtn")
  const downloadBtn = document.getElementById("downloadBtn")
  const clearConsoleBtn = document.getElementById("clearConsoleBtn")
  const outputText = document.getElementById("outputText")
  const fileInputWrapper = document.querySelector(".file-input-wrapper")
  const fileInputLabel = document.querySelector(".file-input-label")

  const progressSection = document.getElementById("progressSection")
  const progressLabel = document.getElementById("progressLabel")
  const scoreValue = document.getElementById("scoreValue")
  const mappingText = document.getElementById("mappingText")
  const shiftValue = document.getElementById("shiftValue")
  const progressBar = document.getElementById("progressBar")
  const progressText = document.getElementById("progressText")

  fileInput.addEventListener("change", (e) => {
    if (e.target.files[0]) {
      const f = e.target.files[0]
      const size = (f.size / 1024).toFixed(2)
      fileInputLabel.textContent = `✓ ${f.name} (${size} KB)`
      fileInputLabel.classList.add("file-loaded")
      logger.log(`File selected: ${f.name}`)
    }
  })

  fileInputWrapper.addEventListener("dragover", (e) => {
    e.preventDefault()
    fileInputWrapper.classList.add("drag-over")
  })

  fileInputWrapper.addEventListener("dragleave", () => {
    fileInputWrapper.classList.remove("drag-over")
  })

  fileInputWrapper.addEventListener("drop", (e) => {
    e.preventDefault()
    fileInputWrapper.classList.remove("drag-over")
    fileInput.files = e.dataTransfer.files
    fileInput.dispatchEvent(new Event("change"))
  })

  decryptFileBtn.addEventListener("click", () => {
    const file = fileInput.files[0]

    if (!file) {
      logger.error("Please select a ciphertext file")
      return
    }

    const originalText = decryptFileBtn.textContent
    decryptFileBtn.textContent =
      algo.id === "mono_substitution" ? "Cracking..." : "Decrypting..."
    decryptFileBtn.classList.add("btn-loading")
    decryptFileBtn.disabled = true

    if (algo.id === "mono_substitution" && progressSection) {
      progressSection.style.display = "flex"
      progressLabel.textContent = "Cracking monoalphabetic cipher..."
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const ciphertext = e.target.result
      logger.log(
        `File loaded: ${file.name} (${ciphertext.length} characters)`
      )

      if (algo.id === "mono_substitution") {
        const worker = new Worker(
          "./js/algorithms/mono/mono_worker.js",
          { type: "module" }
        )

        worker.onmessage = (ev) => {
          const data = ev.data

          if (typeof data.progress === "number") {
            const percent = Math.round(data.progress * 100)

            progressLabel.textContent = `Cracking...`
            progressBar.style.width = `${percent}%`
            progressText.textContent = `${percent}%`
            return
          }

          if (data.error) {
            logger.error(data.error)
            decryptFileBtn.textContent = originalText
            decryptFileBtn.classList.remove("btn-loading")
            decryptFileBtn.disabled = false
            progressSection.style.display = "none"
            worker.terminate()
            return
          }

          outputText.value = data.text
          scoreValue.textContent = data.score.toFixed(4)

          let mapping = ""
          for (let i = 0; i < 26; i++) {
            mapping += `${data.mapping[i]} → ${String.fromCharCode(
              65 + i
            )}  `
            if ((i + 1) % 6 === 0) mapping += "\n"
          }
          mappingText.value = mapping

          logger.success(
            `Cracking successful! Score: ${data.score.toFixed(4)}`
          )

          decryptFileBtn.textContent = originalText
          decryptFileBtn.classList.remove("btn-loading")
          decryptFileBtn.disabled = false
          progressSection.style.display = "none"
          worker.terminate()
        }

        worker.onerror = (err) => {
          logger.error(err.message)
          decryptFileBtn.textContent = originalText
          decryptFileBtn.classList.remove("btn-loading")
          decryptFileBtn.disabled = false
          progressSection.style.display = "none"
          worker.terminate()
        }

        worker.postMessage({ ciphertext })
        return
      }

      try {
        const result = algo.module.bruteForce(ciphertext)
        outputText.value = result.text
        shiftValue.textContent = result.shift
        logger.success(`Decryption successful! Shift = ${result.shift}`)
      } catch (err) {
        logger.error(err.message)
      }

      decryptFileBtn.textContent = originalText
      decryptFileBtn.classList.remove("btn-loading")
      decryptFileBtn.disabled = false
      progressSection.style.display = "none"
    }

    reader.readAsText(file)
  })

  downloadBtn.addEventListener("click", () => {
    const text = outputText.value
    if (!text) return

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${algo.id}-plaintext.txt`
    a.click()
    URL.revokeObjectURL(url)
    logger.success("Plaintext downloaded")
  })

  clearConsoleBtn.addEventListener("click", () => logger.clear())
}

// ------------------------------------------------------------------
// LISTENER FOR AES / DES NORMAL
// ------------------------------------------------------------------
function setupAlgorithmListeners(algo) {
  const encryptBtn = document.getElementById("encryptBtn")
  const decryptBtn = document.getElementById("decryptBtn")
  const copyBtn = document.getElementById("copyBtn")
  const downloadBtn = document.getElementById("downloadBtn")
  const clearConsoleBtn = document.getElementById("clearConsoleBtn")
  const inputText = document.getElementById("inputText")
  const keyInput = document.getElementById("keyInput")
  const outputText = document.getElementById("outputText")
  const modeSelect = document.getElementById("modeSelect")
  const ivInput = document.getElementById("ivInput")
  const ivGroup = document.getElementById("ivGroup")

  // Show/hide IV group for AES/DES depending on mode
  if ((algo.id === "aes" || algo.id === "des") && modeSelect && ivGroup) {
    const toggleIv = () => {
      if (modeSelect.value === "cbc") {
        ivGroup.style.display = "block"
      } else {
        ivGroup.style.display = "none"
      }
    }
    toggleIv()
    modeSelect.addEventListener("change", toggleIv)
  }

  encryptBtn.addEventListener("click", () => {
    const input = inputText.value
    const key = keyInput.value
    const mode = modeSelect ? modeSelect.value : null
    const iv =
      (algo.id === "aes" || algo.id === "des") && mode === "cbc" && ivInput
        ? ivInput.value.trim()
        : null

    if (!input || !key) {
      logger.error("Please provide both input text and key")
      return
    }

    if ((algo.id === "aes" || algo.id === "des") && mode === "cbc" && (!iv || iv.length === 0)) {
      logger.error("CBC mode requires an IV")
      return
    }

    try {
      let result
      if (algo.requiresMode) {
        if (algo.id === "aes" || algo.id === "des") {
          result = algo.module.encrypt(input, key, mode, iv)
        } else {
          result = algo.module.encrypt(input, key, mode)
        }
      } else {
        result = algo.module.encrypt(input, key)
      }
      outputText.value = result
      logger.success(`Encryption successful using ${algo.name}`)
    } catch (error) {
      logger.error(error.message)
    }
  })

  decryptBtn.addEventListener("click", () => {
    const input = inputText.value
    const key = keyInput.value
    const mode = modeSelect ? modeSelect.value : null
    const iv =
      (algo.id === "aes" || algo.id === "des") && mode === "cbc" && ivInput
        ? ivInput.value.trim()
        : null

    if (!input || !key) {
      logger.error("Please provide both input text and key")
      return
    }

    if ((algo.id === "aes" || algo.id === "des") && mode === "cbc" && (!iv || iv.length === 0)) {
      logger.error("CBC mode requires an IV")
      return
    }

    try {
      let result
      if (algo.requiresMode) {
        if (algo.id === "aes" || algo.id === "des") {
          result = algo.module.decrypt(input, key, mode, iv)
        } else {
          result = algo.module.decrypt(input, key, mode)
        }
      } else {
        result = algo.module.decrypt(input, key)
      }
      outputText.value = result
      logger.success(`Decryption successful using ${algo.name}`)
    } catch (error) {
      logger.error(error.message)
    }
  })

  copyBtn.addEventListener("click", () => {
    const text = outputText.value
    if (!text) return
    navigator.clipboard.writeText(text)
    logger.success("Copied to clipboard")
  })

  downloadBtn.addEventListener("click", () => {
    const text = outputText.value
    if (!text) return

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${algo.id}-output.txt`
    a.click()
    URL.revokeObjectURL(url)
    logger.success("Output downloaded")
  })

  clearConsoleBtn.addEventListener("click", () => logger.clear())
}

function setupEventListeners() {
  // nothing additional
}
