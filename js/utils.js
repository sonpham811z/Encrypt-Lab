export const logger = {
  log(message) {
    console.log(message)
    this.appendToConsole(message, "log")
  },

  error(message) {
    console.error(message)
    this.appendToConsole(message, "error")
  },

  success(message) {
    console.log(message)
    this.appendToConsole(message, "success")
  },

  appendToConsole(message, type = "log") {
    const consoleLog = document.getElementById("consoleLog")
    if (!consoleLog) return

    const line = document.createElement("div")
    line.className = `console-line ${type}`
    line.textContent = `> ${message}`
    consoleLog.appendChild(line)
    consoleLog.scrollTop = consoleLog.scrollHeight
  },

  clear() {
    const consoleLog = document.getElementById("consoleLog")
    if (consoleLog) {
      consoleLog.innerHTML = ""
    }
  },
}
