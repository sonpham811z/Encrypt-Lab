import { initializeUI } from "./ui.js"
import { logger } from "./utils.js"

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  logger.log("[EncryptLab] Initializing application...")
  initializeUI()
  logger.log("[EncryptLab] Application ready!")
})
