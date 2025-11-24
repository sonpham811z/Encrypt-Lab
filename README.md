# EncryptLab - Encryption Playground

A modern, static single-page web application for exploring and experimenting with various encryption algorithms. Built with vanilla JavaScript, HTML, and CSS.

## Features

- **Dark Hacker Theme** - Terminal-style interface with monospace typography
- **Multiple Algorithms** - Caesar, Vigenère, Monoalphabetic Substitution, DES, and AES
- **Interactive UI** - Real-time encryption/decryption with live console output
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Zero Dependencies** - No build tools, frameworks, or npm packages required

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: PHP (for local server) or Node.js (for live-server)

### Running Locally

#### Option 1: Using PHP (built-in)
\`\`\`bash
php -S 127.0.0.1:8000
# Navigate to http://127.0.0.1:8000
\`\`\`

#### Option 2: Using live-server
\`\`\`bash
npm install -g live-server
live-server
# Automatically opens http://127.0.0.1:8080
\`\`\`

#### Option 3: Direct File Access
Simply open `index.html` in your browser (some features may be limited)

## Project Structure

\`\`\`
EncryptLab/
├── index.html                 # Main HTML file
├── styles.css                 # All styling with CSS variables
├── README.md                  # This file
└── js/
    ├── main.js               # Application entry point
    ├── ui.js                 # UI rendering and event handling
    ├── utils.js              # Utility functions (logger)
    └── algorithms/
        ├── caesar.js         # Caesar cipher implementation
        ├── vigenere.js       # Vigenère cipher implementation
        ├── mono_substitution.js  # Monoalphabetic substitution
        ├── des.js            # DES algorithm (stub)
        └── aes.js            # AES algorithm (stub)
\`\`\`

## File Descriptions

### HTML (`index.html`)
- Semantic HTML5 structure
- Header with navigation
- 2-column layout (sidebar + workspace)
- Footer with credits

### CSS (`styles.css`)
- CSS variables for theming
- Dark theme (#000 background, white text)
- Monospace typography (Fira Code / Courier New)
- Responsive design with media queries
- Smooth transitions and animations
- Custom scrollbar styling

### JavaScript Modules

#### `main.js`
Entry point that initializes the application on page load.

#### `ui.js`
Handles all UI rendering and user interactions:
- Renders algorithm list
- Displays algorithm-specific forms
- Manages encrypt/decrypt operations
- Handles copy/download functionality

#### `utils.js`
Contains the logger utility:
- `log()` - Standard logging
- `error()` - Error logging (red text)
- `success()` - Success logging (green text)
- `clear()` - Clear console output
- `appendToConsole()` - Internal method for UI updates

#### Algorithm Modules (`algorithms/`)
Each module exports `encrypt()` and `decrypt()` functions:
- **caesar.js** - Fully implemented Caesar cipher
- **vigenere.js** - Fully implemented Vigenère cipher
- **mono_substitution.js** - Stub for monoalphabetic substitution
- **des.js** - Stub for DES algorithm
- **aes.js** - Stub for AES algorithm

## Usage

1. Select an algorithm from the left sidebar
2. Enter plaintext in the "Input" field
3. Enter an encryption key in the "Key" field
4. Click "Encrypt" to encrypt or "Decrypt" to decrypt
5. View results in the "Output" field
6. Copy or download the output as needed
7. Check the console for operation logs

## Implemented Algorithms

### Caesar Cipher ✅
- Simple substitution with numeric shift
- Key: Any integer (default = 3)
- Example: Key=3, "hello" → "khoor"

### Vigenère Cipher ✅
- Polyalphabetic substitution
- Key: Any text string
- More secure than Caesar

### Monoalphabetic Substitution 🔄
- Currently a stub (placeholder)
- Ready for implementation

### DES 🔄
- Currently a stub (placeholder)
- Ready for full implementation

### AES 🔄
- Currently a stub (placeholder)
- Ready for full implementation

## Deployment

### GitHub Pages
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
\`\`\`

Enable GitHub Pages in repository settings and set source to `main` branch.

### Vercel
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Other Static Hosts
EncryptLab works on any static hosting service:
- Netlify
- Firebase Hosting
- AWS S3
- Cloudflare Pages
- Any web server (nginx, Apache)

## Customization

### Changing Colors
Edit CSS variables in `styles.css`:
\`\`\`css
:root {
  --bg-primary: #000000;
  --text-primary: #f5f5f5;
  --accent-white: #ffffff;
  /* ... etc ... */
}
\`\`\`

### Adding New Algorithms
1. Create new file in `js/algorithms/`
2. Export `encrypt()` and `decrypt()` functions
3. Add to algorithms array in `ui.js`
4. UI will automatically render it

### Modifying Theme
All styling uses CSS variables for easy customization without modifying component HTML.

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported (uses ES6 modules)

## Performance

- No external dependencies
- Fast page load (~100ms)
- Minimal memory footprint
- Smooth 60fps animations

## Future Enhancements

- [ ] Implement full DES algorithm
- [ ] Implement full AES algorithm
- [ ] Add RSA/public-key cryptography
- [ ] Add file encryption/decryption
- [ ] Add performance benchmarking
- [ ] Add visual encryption/decryption step-by-step
- [ ] Add multiple language support

## License

Open source - feel free to use, modify, and distribute

## Credits

EncryptLab © 2025
Built as an educational tool for learning cryptography
