# FlagMaster Sprint 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the `docs/FlagMaster.html` prototype into a production React+TypeScript PWA with 6 game modes, Zustand state, Framer Motion animations, and Vitest test coverage.

**Architecture:** Three screens (Home/Game/Result) driven by a single Zustand store; pure question engine functions tested independently; Tailwind+CSS custom properties for theming; WebAudio API for sound (zero audio files).

**Tech Stack:** React 18, TypeScript 5 strict, Vite 5, Zustand 5 + persist, Framer Motion 11, Tailwind CSS 3, vite-plugin-pwa, Vitest 2.

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/styles/tokens.css` | CSS custom properties (palette, shadow) |
| `tailwind.config.js` | Maps CSS vars to Tailwind color names |
| `src/data/countries.ts` | `FM_COUNTRIES` (86 entries), `Country` type, `FM_REGIONS` |
| `src/data/countries.test.ts` | Validates all fields present, no dups, ≥70 entries |
| `src/engine/questionEngine.ts` | `getPool`, `shuffle`, `makeHint`, `norm`, `pickDistractors` |
| `src/engine/questionEngine.test.ts` | Unit tests for all engine functions |
| `src/store/gameStore.ts` | Zustand store — session + persisted state + all actions |
| `src/store/gameStore.test.ts` | Action/state transition tests |
| `src/audio/audioEngine.ts` | WebAudio tones: correct/wrong/streak/timeout |
| `src/components/CompassRose.tsx` | Animated SVG compass, Framer Motion spin |
| `src/components/TimerRing.tsx` | SVG countdown ring, 10s, danger<3s |
| `src/components/ProgressBar.tsx` | Gold→teal progress strip |
| `src/components/StatCard.tsx` | 4-column stats grid with bracket corners |
| `src/components/FeedbackBanner.tsx` | Slide-up correct/wrong banner |
| `src/components/FlagStage.tsx` | Flag display area, spring animation per question |
| `src/components/OptionsGrid.tsx` | 4-button grid, all modes, feedback states |
| `src/screens/HomeScreen.tsx` | Compass + brand + difficulty + mode selection |
| `src/screens/GameScreen.tsx` | Header HUD + FlagStage + OptionsGrid/input + Next btn |
| `src/screens/ResultScreen.tsx` | Score/tier display + wrongList + action buttons |
| `src/App.tsx` | Screen router keyed on `store.screen` |
| `src/main.tsx` | React root mount |
| `index.html` | Google Fonts link, viewport meta |
| `vite.config.ts` | Vite + VitePWA + Vitest config |
| `tailwind.config.js` | Tailwind + CSS var tokens |
| `tsconfig.json` | TypeScript strict config |
| `public/manifest.webmanifest` | PWA manifest |
| `public/favicon.svg` | Compass SVG favicon |
| `.github/workflows/deploy.yml` | GitHub Actions → GitHub Pages |

---

## Task 0: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts`

- [ ] **Step 1: Scaffold Vite project and install deps**

Run in project root (confirm overwrite when prompted — existing files are docs/CLAUDE.md/SPECS.md only):
```powershell
npm create vite@latest . -- --template react-ts
npm install framer-motion zustand
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa vitest jsdom @vitest/ui
npx tailwindcss init -p
```

- [ ] **Step 2: Replace `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Replace `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] },
      manifest: {
        name: 'FlagMaster — Atlas de Banderas',
        short_name: 'FlagMaster',
        description: 'Aprende las banderas del mundo en familia',
        theme_color: '#1a1209',
        background_color: '#f5edd6',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 4: Replace `index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <meta name="theme-color" content="#1a1209" />
    <title>FlagMaster — Atlas de Banderas</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Write `src/main.tsx`**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/tokens.css'
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 6: Write placeholder `src/App.tsx`**

```typescript
export default function App() {
  return <div className="app">FlagMaster</div>
}
```

- [ ] **Step 7: Write `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="none" stroke="#1a1209" stroke-width="2"/>
  <polygon points="50,8 53,47 50,50 47,47" fill="#1a1209"/>
  <polygon points="50,92 53,53 50,50 47,53" fill="#1a1209"/>
  <polygon points="8,50 47,47 50,50 47,53" fill="#1a1209"/>
  <polygon points="92,50 53,47 50,50 53,53" fill="#1a1209"/>
  <polygon points="50,18 65,50 50,50" fill="#b8872a"/>
  <polygon points="50,18 35,50 50,50" fill="#b8872a"/>
  <polygon points="50,82 65,50 50,50" fill="#b8872a"/>
  <polygon points="50,82 35,50 50,50" fill="#b8872a"/>
  <circle cx="50" cy="50" r="5" fill="#b8872a"/>
</svg>
```

- [ ] **Step 8: Verify scaffold compiles**

```powershell
npm run build
```
Expected: build succeeds, `dist/` created.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold React+TS+Vite project with PWA config"
```

---

## Task 1: Design Tokens

**Files:**
- Create: `src/styles/tokens.css`
- Modify: `tailwind.config.js`, `src/index.css`

- [ ] **Step 1: Write `src/styles/tokens.css`**

```css
:root {
  --paper:      #f5edd6;
  --paper-2:    #efe4c4;
  --paper-3:    #e8d9b0;
  --ink:        #1a1209;
  --ink-2:      #3a2a18;
  --ink-soft:   #5c4528;
  --gold:       #b8872a;
  --gold-2:     #946a1d;
  --gold-light: #d9b366;
  --ok-bg:      #0d3320;
  --ok:         #2d8c55;
  --err-bg:     #2d0a0a;
  --err:        #8b2222;
  --rule:       rgba(26,18,9,0.18);
  --shadow:     0 1px 0 rgba(26,18,9,0.06), 0 18px 30px -22px rgba(26,18,9,0.35);
}
```

- [ ] **Step 2: Replace `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html, body { height: 100%; }

body {
  font-family: 'Libre Baskerville', Georgia, serif;
  color: var(--ink);
  background: var(--paper);
  background-image:
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.10 0 0 0 0 0.07 0 0 0 0 0.04 0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"),
    radial-gradient(140% 90% at 20% 0%, #faf2da 0%, #f5edd6 38%, #ecdfbd 100%);
  background-blend-mode: multiply, normal;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
}

.app {
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  position: relative;
  padding-bottom: 28px;
}

@media (min-width: 720px) {
  body {
    background-image:
      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.10 0 0 0 0 0.07 0 0 0 0 0.04 0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"),
      radial-gradient(60% 60% at 50% 30%, #e8d9b0 0%, #d8c391 70%, #b89a5e 100%);
    background-blend-mode: multiply, normal;
    min-height: 100dvh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 36px 16px;
  }
  .app {
    background: var(--paper);
    background-image:
      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.10 0 0 0 0 0.07 0 0 0 0 0.04 0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"),
      radial-gradient(140% 90% at 20% 0%, #faf2da 0%, #f5edd6 38%, #ecdfbd 100%);
    background-blend-mode: multiply, normal;
    box-shadow:
      0 0 0 1px rgba(26,18,9,0.14),
      0 30px 60px -24px rgba(26,18,9,0.45),
      0 8px 16px -8px rgba(26,18,9,0.25);
    border-radius: 4px;
    overflow: hidden;
    min-height: 780px;
  }
}
```

- [ ] **Step 3: Replace `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper:      'var(--paper)',
        'paper-2':  'var(--paper-2)',
        'paper-3':  'var(--paper-3)',
        ink:        'var(--ink)',
        'ink-2':    'var(--ink-2)',
        'ink-soft': 'var(--ink-soft)',
        gold:       'var(--gold)',
        'gold-2':   'var(--gold-2)',
        'gold-light':'var(--gold-light)',
        'ok-bg':    'var(--ok-bg)',
        ok:         'var(--ok)',
        'err-bg':   'var(--err-bg)',
        err:        'var(--err)',
      },
      fontFamily: {
        serif:  ["'Playfair Display'", 'Georgia', 'serif'],
        body:   ["'Libre Baskerville'", 'Georgia', 'serif'],
        mono:   ["'DM Mono'", 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Verify build**

```powershell
npm run build
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.css src/index.css tailwind.config.js
git commit -m "feat: add design tokens, Tailwind config, body parchment background"
```

---

## Task 2: Countries Data

**Files:**
- Create: `src/data/countries.ts`
- Create: `src/data/countries.test.ts`

- [ ] **Step 1: Write failing test `src/data/countries.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { FM_COUNTRIES, FM_REGIONS } from './countries'

const VALID_STAGES = new Set(['easy', 'medium', 'hard'])
const VALID_REGIONS = new Set(['europe', 'americas', 'asia', 'africa', 'oceania'])

describe('FM_COUNTRIES', () => {
  it('has at least 70 countries', () => {
    expect(FM_COUNTRIES.length).toBeGreaterThanOrEqual(70)
  })

  it('every country has all required fields', () => {
    FM_COUNTRIES.forEach(c => {
      expect(c.f, `${c.n} missing f`).toBeTruthy()
      expect(c.n, `missing n`).toBeTruthy()
      expect(c.c, `${c.n} missing c`).toBeTruthy()
      expect(VALID_STAGES.has(c.s), `${c.n} invalid stage`).toBe(true)
      expect(VALID_REGIONS.has(c.r), `${c.n} invalid region`).toBe(true)
    })
  })

  it('country names are unique', () => {
    const names = FM_COUNTRIES.map(c => c.n)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })

  it('has countries from all 5 regions', () => {
    const regions = new Set(FM_COUNTRIES.map(c => c.r))
    expect(regions.has('europe')).toBe(true)
    expect(regions.has('americas')).toBe(true)
    expect(regions.has('asia')).toBe(true)
    expect(regions.has('africa')).toBe(true)
    expect(regions.has('oceania')).toBe(true)
  })
})

describe('FM_REGIONS', () => {
  it('has 5 regions', () => {
    expect(FM_REGIONS).toHaveLength(5)
  })

  it('europe has no lock', () => {
    const eu = FM_REGIONS.find(r => r.id === 'europe')
    expect(eu?.lock).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```powershell
npx vitest run src/data/countries.test.ts
```
Expected: FAIL — "Cannot find module './countries'"

- [ ] **Step 3: Write `src/data/countries.ts`**

```typescript
export interface Country {
  f: string;
  n: string;
  c: string;
  s: 'easy' | 'medium' | 'hard';
  r: 'europe' | 'americas' | 'asia' | 'africa' | 'oceania';
}

export interface Region {
  id:    string;
  name:  string;
  order: number;
  lock:  { region: string; mastery: number } | null;
}

export const FM_REGIONS: Region[] = [
  { id: 'europe',   name: 'Europa',   order: 1, lock: null },
  { id: 'americas', name: 'Américas', order: 2, lock: { region: 'europe',   mastery: 0.6 } },
  { id: 'asia',     name: 'Asia',     order: 3, lock: { region: 'americas', mastery: 0.6 } },
  { id: 'africa',   name: 'África',   order: 4, lock: { region: 'asia',     mastery: 0.5 } },
  { id: 'oceania',  name: 'Oceanía',  order: 5, lock: { region: 'africa',   mastery: 0.5 } },
]

export const FM_COUNTRIES: Country[] = [
  // ── EASY (23) ─────────────────────────────────────────────────────
  { f:'🇪🇸', n:'España',          c:'Madrid',            s:'easy',   r:'europe'   },
  { f:'🇫🇷', n:'Francia',         c:'París',             s:'easy',   r:'europe'   },
  { f:'🇩🇪', n:'Alemania',        c:'Berlín',            s:'easy',   r:'europe'   },
  { f:'🇮🇹', n:'Italia',          c:'Roma',              s:'easy',   r:'europe'   },
  { f:'🇵🇹', n:'Portugal',        c:'Lisboa',            s:'easy',   r:'europe'   },
  { f:'🇬🇧', n:'Reino Unido',     c:'Londres',           s:'easy',   r:'europe'   },
  { f:'🇮🇪', n:'Irlanda',         c:'Dublín',            s:'easy',   r:'europe'   },
  { f:'🇳🇱', n:'Países Bajos',    c:'Ámsterdam',         s:'easy',   r:'europe'   },
  { f:'🇧🇪', n:'Bélgica',         c:'Bruselas',          s:'easy',   r:'europe'   },
  { f:'🇨🇭', n:'Suiza',           c:'Berna',             s:'easy',   r:'europe'   },
  { f:'🇦🇹', n:'Austria',         c:'Viena',             s:'easy',   r:'europe'   },
  { f:'🇸🇪', n:'Suecia',          c:'Estocolmo',         s:'easy',   r:'europe'   },
  { f:'🇳🇴', n:'Noruega',         c:'Oslo',              s:'easy',   r:'europe'   },
  { f:'🇩🇰', n:'Dinamarca',       c:'Copenhague',        s:'easy',   r:'europe'   },
  { f:'🇫🇮', n:'Finlandia',       c:'Helsinki',          s:'easy',   r:'europe'   },
  { f:'🇺🇸', n:'Estados Unidos',  c:'Washington D.C.',   s:'easy',   r:'americas' },
  { f:'🇨🇦', n:'Canadá',          c:'Ottawa',            s:'easy',   r:'americas' },
  { f:'🇲🇽', n:'México',          c:'Ciudad de México',  s:'easy',   r:'americas' },
  { f:'🇧🇷', n:'Brasil',          c:'Brasilia',          s:'easy',   r:'americas' },
  { f:'🇦🇷', n:'Argentina',       c:'Buenos Aires',      s:'easy',   r:'americas' },
  { f:'🇯🇵', n:'Japón',           c:'Tokio',             s:'easy',   r:'asia'     },
  { f:'🇨🇳', n:'China',           c:'Pekín',             s:'easy',   r:'asia'     },
  { f:'🇦🇺', n:'Australia',       c:'Canberra',          s:'easy',   r:'oceania'  },

  // ── MEDIUM (28) ───────────────────────────────────────────────────
  { f:'🇵🇱', n:'Polonia',                  c:'Varsovia',     s:'medium', r:'europe'   },
  { f:'🇨🇿', n:'República Checa',          c:'Praga',        s:'medium', r:'europe'   },
  { f:'🇭🇺', n:'Hungría',                  c:'Budapest',     s:'medium', r:'europe'   },
  { f:'🇷🇴', n:'Rumanía',                  c:'Bucarest',     s:'medium', r:'europe'   },
  { f:'🇬🇷', n:'Grecia',                   c:'Atenas',       s:'medium', r:'europe'   },
  { f:'🇷🇺', n:'Rusia',                    c:'Moscú',        s:'medium', r:'europe'   },
  { f:'🇺🇦', n:'Ucrania',                  c:'Kiev',         s:'medium', r:'europe'   },
  { f:'🇹🇷', n:'Turquía',                  c:'Ankara',       s:'medium', r:'europe'   },
  { f:'🇮🇳', n:'India',                    c:'Nueva Delhi',  s:'medium', r:'asia'     },
  { f:'🇰🇷', n:'Corea del Sur',            c:'Seúl',         s:'medium', r:'asia'     },
  { f:'🇹🇭', n:'Tailandia',               c:'Bangkok',      s:'medium', r:'asia'     },
  { f:'🇻🇳', n:'Vietnam',                  c:'Hanói',        s:'medium', r:'asia'     },
  { f:'🇮🇩', n:'Indonesia',               c:'Yakarta',      s:'medium', r:'asia'     },
  { f:'🇵🇭', n:'Filipinas',               c:'Manila',       s:'medium', r:'asia'     },
  { f:'🇮🇱', n:'Israel',                   c:'Jerusalén',    s:'medium', r:'asia'     },
  { f:'🇸🇦', n:'Arabia Saudita',           c:'Riad',         s:'medium', r:'asia'     },
  { f:'🇦🇪', n:'Emiratos Árabes Unidos',   c:'Abu Dabi',     s:'medium', r:'asia'     },
  { f:'🇪🇬', n:'Egipto',                   c:'El Cairo',     s:'medium', r:'africa'   },
  { f:'🇿🇦', n:'Sudáfrica',               c:'Pretoria',     s:'medium', r:'africa'   },
  { f:'🇲🇦', n:'Marruecos',               c:'Rabat',        s:'medium', r:'africa'   },
  { f:'🇳🇬', n:'Nigeria',                  c:'Abuya',        s:'medium', r:'africa'   },
  { f:'🇰🇪', n:'Kenia',                    c:'Nairobi',      s:'medium', r:'africa'   },
  { f:'🇨🇱', n:'Chile',                    c:'Santiago',     s:'medium', r:'americas' },
  { f:'🇨🇴', n:'Colombia',                c:'Bogotá',       s:'medium', r:'americas' },
  { f:'🇵🇪', n:'Perú',                     c:'Lima',         s:'medium', r:'americas' },
  { f:'🇻🇪', n:'Venezuela',               c:'Caracas',      s:'medium', r:'americas' },
  { f:'🇨🇺', n:'Cuba',                     c:'La Habana',    s:'medium', r:'americas' },
  { f:'🇳🇿', n:'Nueva Zelanda',            c:'Wellington',   s:'medium', r:'oceania'  },

  // ── HARD (35) ─────────────────────────────────────────────────────
  { f:'🇷🇸', n:'Serbia',                   c:'Belgrado',     s:'hard',   r:'europe'   },
  { f:'🇭🇷', n:'Croacia',                  c:'Zagreb',       s:'hard',   r:'europe'   },
  { f:'🇧🇦', n:'Bosnia y Herzegovina',     c:'Sarajevo',     s:'hard',   r:'europe'   },
  { f:'🇸🇮', n:'Eslovenia',               c:'Liubliana',    s:'hard',   r:'europe'   },
  { f:'🇲🇰', n:'Macedonia del Norte',      c:'Skopie',       s:'hard',   r:'europe'   },
  { f:'🇲🇪', n:'Montenegro',              c:'Podgorica',    s:'hard',   r:'europe'   },
  { f:'🇦🇱', n:'Albania',                  c:'Tirana',       s:'hard',   r:'europe'   },
  { f:'🇧🇬', n:'Bulgaria',                 c:'Sofía',        s:'hard',   r:'europe'   },
  { f:'🇸🇰', n:'Eslovaquia',              c:'Bratislava',   s:'hard',   r:'europe'   },
  { f:'🇪🇪', n:'Estonia',                  c:'Tallin',       s:'hard',   r:'europe'   },
  { f:'🇱🇻', n:'Letonia',                  c:'Riga',         s:'hard',   r:'europe'   },
  { f:'🇱🇹', n:'Lituania',                c:'Vilna',        s:'hard',   r:'europe'   },
  { f:'🇧🇾', n:'Bielorrusia',             c:'Minsk',        s:'hard',   r:'europe'   },
  { f:'🇲🇩', n:'Moldavia',                c:'Chisináu',     s:'hard',   r:'europe'   },
  { f:'🇬🇪', n:'Georgia',                  c:'Tiflis',       s:'hard',   r:'europe'   },
  { f:'🇦🇲', n:'Armenia',                  c:'Ereván',       s:'hard',   r:'europe'   },
  { f:'🇦🇿', n:'Azerbaiyán',              c:'Bakú',         s:'hard',   r:'asia'     },
  { f:'🇰🇿', n:'Kazajistán',             c:'Astaná',       s:'hard',   r:'asia'     },
  { f:'🇺🇿', n:'Uzbekistán',             c:'Taskent',      s:'hard',   r:'asia'     },
  { f:'🇰🇬', n:'Kirguistán',             c:'Biskek',       s:'hard',   r:'asia'     },
  { f:'🇲🇳', n:'Mongolia',                c:'Ulán Bator',   s:'hard',   r:'asia'     },
  { f:'🇵🇰', n:'Pakistán',               c:'Islamabad',    s:'hard',   r:'asia'     },
  { f:'🇧🇩', n:'Bangladés',              c:'Daca',         s:'hard',   r:'asia'     },
  { f:'🇱🇰', n:'Sri Lanka',               c:'Colombo',      s:'hard',   r:'asia'     },
  { f:'🇳🇵', n:'Nepal',                   c:'Katmandú',     s:'hard',   r:'asia'     },
  { f:'🇪🇹', n:'Etiopía',                c:'Adís Abeba',   s:'hard',   r:'africa'   },
  { f:'🇬🇭', n:'Ghana',                   c:'Acra',         s:'hard',   r:'africa'   },
  { f:'🇸🇳', n:'Senegal',                 c:'Dakar',        s:'hard',   r:'africa'   },
  { f:'🇹🇿', n:'Tanzania',               c:'Dodoma',       s:'hard',   r:'africa'   },
  { f:'🇺🇬', n:'Uganda',                  c:'Kampala',      s:'hard',   r:'africa'   },
  { f:'🇦🇴', n:'Angola',                  c:'Luanda',       s:'hard',   r:'africa'   },
  { f:'🇩🇿', n:'Argelia',                c:'Argel',        s:'hard',   r:'africa'   },
  { f:'🇹🇳', n:'Túnez',                  c:'Túnez',        s:'hard',   r:'africa'   },
  { f:'🇨🇲', n:'Camerún',               c:'Yaundé',       s:'hard',   r:'africa'   },
  { f:'🇨🇮', n:'Costa de Marfil',         c:'Yamusukro',    s:'hard',   r:'africa'   },
]
```

- [ ] **Step 4: Run tests — verify they pass**

```powershell
npx vitest run src/data/countries.test.ts
```
Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/
git commit -m "feat: add FM_COUNTRIES (86 entries) and FM_REGIONS with region field"
```

---

## Task 3: Question Engine

**Files:**
- Create: `src/engine/questionEngine.ts`
- Create: `src/engine/questionEngine.test.ts`

- [ ] **Step 1: Write failing test `src/engine/questionEngine.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { getPool, shuffle, makeHint, norm, pickDistractors } from './questionEngine'
import { FM_COUNTRIES } from '../data/countries'

describe('getPool', () => {
  it('easy returns only easy countries', () => {
    const pool = getPool('easy', FM_COUNTRIES)
    expect(pool.length).toBeGreaterThan(0)
    expect(pool.every(c => c.s === 'easy')).toBe(true)
  })

  it('medium includes easy and medium, not hard', () => {
    const pool = getPool('medium', FM_COUNTRIES)
    const stages = new Set(pool.map(c => c.s))
    expect(stages.has('easy')).toBe(true)
    expect(stages.has('medium')).toBe(true)
    expect(stages.has('hard')).toBe(false)
  })

  it('hard includes all stages', () => {
    const pool = getPool('hard', FM_COUNTRIES)
    const stages = new Set(pool.map(c => c.s))
    expect(stages.has('easy')).toBe(true)
    expect(stages.has('medium')).toBe(true)
    expect(stages.has('hard')).toBe(true)
  })

  it('hard pool is larger than medium which is larger than easy', () => {
    expect(getPool('easy', FM_COUNTRIES).length).toBeLessThan(getPool('medium', FM_COUNTRIES).length)
    expect(getPool('medium', FM_COUNTRIES).length).toBeLessThan(getPool('hard', FM_COUNTRIES).length)
  })
})

describe('shuffle', () => {
  it('preserves all elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffle(arr)
    expect(result).toHaveLength(5)
    expect([...result].sort((a,b) => a-b)).toEqual([1, 2, 3, 4, 5])
  })

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3]
    shuffle(arr)
    expect(arr).toEqual([1, 2, 3])
  })
})

describe('makeHint', () => {
  it('easy reveals first 2 letters per word', () => {
    expect(makeHint('España', 'easy')).toBe('Es····')
  })

  it('medium reveals first letter per word', () => {
    expect(makeHint('España', 'medium')).toBe('E·····')
  })

  it('hard reveals first letter per word', () => {
    expect(makeHint('España', 'hard')).toBe('E·····')
  })

  it('handles multi-word names', () => {
    expect(makeHint('Estados Unidos', 'easy')).toBe('Es····· Un····s')
    expect(makeHint('Estados Unidos', 'hard')).toBe('E······ U·····s')
  })

  it('preserves spaces between words', () => {
    const hint = makeHint('Nueva Zelanda', 'hard')
    expect(hint).toContain(' ')
  })
})

describe('norm', () => {
  it('lowercases', () => {
    expect(norm('ESPAÑA')).toBe('espana')
  })

  it('removes accents', () => {
    expect(norm('Japón')).toBe('japon')
    expect(norm('España')).toBe('espana')
  })

  it('comparison: accented vs plain', () => {
    expect(norm('Japón')).toBe(norm('japon'))
  })

  it('removes non-alphanumeric except spaces', () => {
    expect(norm('Bosnia y Herzegovina')).toBe('bosnia y herzegovina')
  })

  it('trims and collapses spaces', () => {
    expect(norm('  estados   unidos  ')).toBe('estados unidos')
  })

  it('handles empty string', () => {
    expect(norm('')).toBe('')
  })
})

describe('pickDistractors', () => {
  const pool = FM_COUNTRIES
  const correct = FM_COUNTRIES[0]

  it('returns exactly N distractors', () => {
    expect(pickDistractors(correct, pool, 3)).toHaveLength(3)
  })

  it('never includes the correct country', () => {
    for (let i = 0; i < 30; i++) {
      const result = pickDistractors(correct, pool, 3)
      expect(result.every(c => c.n !== correct.n)).toBe(true)
    }
  })

  it('returns unique entries', () => {
    const result = pickDistractors(correct, pool, 3)
    const names = result.map(c => c.n)
    expect(new Set(names).size).toBe(3)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```powershell
npx vitest run src/engine/questionEngine.test.ts
```
Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Write `src/engine/questionEngine.ts`**

```typescript
import type { Country } from '../data/countries'

export type Stage = 'easy' | 'medium' | 'hard'

const STAGE_FILTER: Record<Stage, Stage[]> = {
  easy:   ['easy'],
  medium: ['easy', 'medium'],
  hard:   ['easy', 'medium', 'hard'],
}

export function getPool(stage: Stage, countries: Country[]): Country[] {
  const allowed = new Set<string>(STAGE_FILTER[stage])
  return countries.filter(c => allowed.has(c.s))
}

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function makeHint(name: string, stage: Stage): string {
  const revealCount = stage === 'easy' ? 2 : 1
  return name
    .split(' ')
    .map(word =>
      [...word]
        .map((ch, i) => {
          if (!/[A-Za-záéíóúüñÁÉÍÓÚÜÑ]/.test(ch)) return ch
          return i < revealCount ? ch : '·'
        })
        .join('')
    )
    .join(' ')
}

export function norm(s: string): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function pickDistractors(correct: Country, pool: Country[], n: number): Country[] {
  const others = pool.filter(c => c.n !== correct.n)
  return shuffle(others).slice(0, n)
}
```

- [ ] **Step 4: Run tests — verify they pass**

```powershell
npx vitest run src/engine/questionEngine.test.ts
```
Expected: all tests PASS.

**Note on `makeHint('Estados Unidos', 'easy')`:** 'Unidos' = U,n,i,d,o,s. Easy reveals first 2 (U,n), hides i,d,o but 's' at index 5 is NOT a letter... wait, 's' IS a letter. So Unidos easy = Un···· (4 dots). But the test above shows `'Un····s'`. Let me re-check: Estados = E,s,t,a,d,o,s (7 chars, easy reveals Es, hides t,a,d,o,s = 5 dots → 'Es·····'). Unidos = U,n,i,d,o,s (6 chars, easy reveals U,n, hides i,d,o,s = 4 dots → 'Un····'). So `makeHint('Estados Unidos', 'easy')` = `'Es····· Un····'`. Fix the test if needed to match actual implementation output.

- [ ] **Step 5: Fix test expectations to match implementation**

After running, if `makeHint('Estados Unidos', 'easy')` test fails, update the expected value in the test file to match actual output: `'Es····· Un····'`.

- [ ] **Step 6: Commit**

```bash
git add src/engine/
git commit -m "feat: question engine — getPool, shuffle, makeHint, norm, pickDistractors"
```

---

## Task 4: Game Store

**Files:**
- Create: `src/store/gameStore.ts`
- Create: `src/store/gameStore.test.ts`

- [ ] **Step 1: Write failing test `src/store/gameStore.test.ts`**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage for persist middleware
const mockStorage: Record<string, string> = {}
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, val: string) => { mockStorage[key] = val },
    removeItem: (key: string) => { delete mockStorage[key] },
  },
  configurable: true,
})

import { useGameStore } from './gameStore'

describe('startGame', () => {
  beforeEach(() => {
    useGameStore.setState({
      screen: 'home', qIndex: 0, score: 0, streak: 0, maxStreak: 0,
      correct: 0, answered: false, wrongList: [], pool: [], questions: [],
      currentOptions: [], currentCountry: null,
    })
  })

  it('switches screen to game', () => {
    useGameStore.getState().startGame()
    expect(useGameStore.getState().screen).toBe('game')
  })

  it('resets score and streak', () => {
    useGameStore.setState({ score: 100, streak: 5 })
    useGameStore.getState().startGame()
    const s = useGameStore.getState()
    expect(s.score).toBe(0)
    expect(s.streak).toBe(0)
  })

  it('builds pool and selects 10 questions', () => {
    useGameStore.getState().startGame()
    const s = useGameStore.getState()
    expect(s.pool.length).toBeGreaterThan(0)
    expect(s.questions.length).toBe(10)
  })

  it('sets currentCountry to first question', () => {
    useGameStore.getState().startGame()
    const s = useGameStore.getState()
    expect(s.currentCountry).not.toBeNull()
    expect(s.currentCountry).toEqual(s.questions[0])
  })
})

describe('answer — correct', () => {
  beforeEach(() => {
    useGameStore.getState().startGame()
  })

  it('increments correct count', () => {
    const before = useGameStore.getState().correct
    useGameStore.getState().answer(true)
    expect(useGameStore.getState().correct).toBe(before + 1)
  })

  it('increments streak', () => {
    useGameStore.setState({ streak: 2 })
    useGameStore.getState().answer(true)
    expect(useGameStore.getState().streak).toBe(3)
  })

  it('adds base points + streak bonus', () => {
    useGameStore.setState({ stage: 'easy', streak: 0, score: 0 })
    useGameStore.getState().answer(true)
    // easy=10, streak was 0 before answer, bonus = 0*2 = 0 → 10
    expect(useGameStore.getState().score).toBe(10)
  })

  it('streak bonus grows with consecutive answers', () => {
    useGameStore.setState({ stage: 'easy', streak: 2, score: 0 })
    useGameStore.getState().answer(true)
    // bonus = 2*2 = 4 → 10 + 4 = 14
    expect(useGameStore.getState().score).toBe(14)
  })

  it('updates maxStreak', () => {
    useGameStore.setState({ streak: 4, maxStreak: 4 })
    useGameStore.getState().answer(true)
    expect(useGameStore.getState().maxStreak).toBe(5)
  })
})

describe('answer — wrong', () => {
  beforeEach(() => {
    useGameStore.getState().startGame()
  })

  it('resets streak to 0', () => {
    useGameStore.setState({ streak: 3 })
    useGameStore.getState().answer(false)
    expect(useGameStore.getState().streak).toBe(0)
  })

  it('adds country to wrongList', () => {
    const country = useGameStore.getState().currentCountry!
    useGameStore.getState().answer(false)
    expect(useGameStore.getState().wrongList).toContainEqual(country)
  })

  it('does not change score', () => {
    useGameStore.setState({ score: 50 })
    useGameStore.getState().answer(false)
    expect(useGameStore.getState().score).toBe(50)
  })
})

describe('finishGame', () => {
  it('persists totalGames increment', () => {
    const before = useGameStore.getState().totalGames
    useGameStore.getState().startGame()
    useGameStore.getState().finishGame()
    expect(useGameStore.getState().totalGames).toBe(before + 1)
  })

  it('switches to results screen', () => {
    useGameStore.getState().startGame()
    useGameStore.getState().finishGame()
    expect(useGameStore.getState().screen).toBe('results')
  })
})

describe('goHome', () => {
  it('switches to home screen', () => {
    useGameStore.setState({ screen: 'game' })
    useGameStore.getState().goHome()
    expect(useGameStore.getState().screen).toBe('home')
  })
})
```

- [ ] **Step 2: Run — verify fail**

```powershell
npx vitest run src/store/gameStore.test.ts
```
Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Write `src/store/gameStore.ts`**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FM_COUNTRIES, type Country } from '../data/countries'
import { getPool, shuffle, pickDistractors } from '../engine/questionEngine'
import type { Stage } from '../engine/questionEngine'

export type GameMode = 'flag2country' | 'country2flag' | 'hint' | 'capital' | 'type' | 'lightning'
export type Screen = 'home' | 'game' | 'results'

const POINTS_BASE: Record<Stage, number> = { easy: 10, medium: 15, hard: 20 }
const QUESTIONS_PER_ROUND = 10

interface GameState {
  // Navigation
  screen: Screen

  // Preferences (persisted)
  stage: Stage
  mode: GameMode

  // History (persisted)
  bestStreak:     number
  totalGames:     number
  totalCorrect:   number
  totalQuestions: number

  // Session (not persisted)
  pool:           Country[]
  questions:      Country[]
  qIndex:         number
  currentCountry: Country | null
  currentOptions: Country[]
  score:          number
  streak:         number
  maxStreak:      number
  correct:        number
  answered:       boolean
  wrongList:      Country[]
}

interface GameActions {
  startGame:   () => void
  nextQuestion:() => void
  answer:      (correct: boolean) => void
  finishGame:  () => void
  goHome:      () => void
  setStage:    (s: Stage) => void
  setMode:     (m: GameMode) => void
}

function buildOptions(country: Country, pool: Country[]): Country[] {
  const distractors = pickDistractors(country, pool, 3)
  return shuffle([country, ...distractors])
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      // Navigation
      screen: 'home',

      // Preferences
      stage: 'medium',
      mode:  'flag2country',

      // History
      bestStreak:     0,
      totalGames:     0,
      totalCorrect:   0,
      totalQuestions: 0,

      // Session
      pool:           [],
      questions:      [],
      qIndex:         0,
      currentCountry: null,
      currentOptions: [],
      score:          0,
      streak:         0,
      maxStreak:      0,
      correct:        0,
      answered:       false,
      wrongList:      [],

      startGame: () => {
        const { stage, mode } = get()
        const pool = getPool(stage, FM_COUNTRIES)
        const questions = shuffle(pool).slice(0, Math.min(QUESTIONS_PER_ROUND, pool.length))
        const currentCountry = questions[0]
        const currentOptions = buildOptions(currentCountry, pool)
        set({
          screen: 'game',
          pool,
          questions,
          qIndex:   0,
          currentCountry,
          currentOptions,
          score:    0,
          streak:   0,
          maxStreak:0,
          correct:  0,
          answered: false,
          wrongList:[],
        })
      },

      nextQuestion: () => {
        const { qIndex, questions, pool } = get()
        const next = qIndex + 1
        if (next >= questions.length) {
          get().finishGame()
          return
        }
        const currentCountry = questions[next]
        const currentOptions = buildOptions(currentCountry, pool)
        set({ qIndex: next, currentCountry, currentOptions, answered: false })
      },

      answer: (correct: boolean) => {
        const { stage, score, streak, maxStreak, correct: hits, wrongList, currentCountry } = get()
        if (correct) {
          const bonus = streak * 2
          const pts = POINTS_BASE[stage] + bonus
          const newStreak = streak + 1
          set({
            score:     score + pts,
            streak:    newStreak,
            maxStreak: Math.max(maxStreak, newStreak),
            correct:   hits + 1,
            answered:  true,
          })
        } else {
          set({
            streak:   0,
            answered: true,
            wrongList: currentCountry ? [...wrongList, currentCountry] : wrongList,
          })
        }
      },

      finishGame: () => {
        const { bestStreak, totalGames, totalCorrect, totalQuestions, correct, maxStreak } = get()
        set({
          screen:         'results',
          bestStreak:     Math.max(bestStreak, maxStreak),
          totalGames:     totalGames + 1,
          totalCorrect:   totalCorrect + correct,
          totalQuestions: totalQuestions + QUESTIONS_PER_ROUND,
        })
      },

      goHome: () => set({ screen: 'home' }),

      setStage: (stage) => set({ stage }),
      setMode:  (mode)  => set({ mode }),
    }),
    {
      name: 'flagmaster_v2',
      partialize: (state) => ({
        stage:          state.stage,
        mode:           state.mode,
        bestStreak:     state.bestStreak,
        totalGames:     state.totalGames,
        totalCorrect:   state.totalCorrect,
        totalQuestions: state.totalQuestions,
      }),
    },
  ),
)
```

- [ ] **Step 4: Run tests — verify pass**

```powershell
npx vitest run src/store/gameStore.test.ts
```
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/
git commit -m "feat: Zustand game store — session, history, all actions"
```

---

## Task 5: Audio Engine

**Files:**
- Create: `src/audio/audioEngine.ts`

- [ ] **Step 1: Write `src/audio/audioEngine.ts`**

```typescript
let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function tone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3): void {
  try {
    const ac  = getCtx()
    const osc = ac.createOscillator()
    const env = ac.createGain()
    osc.connect(env)
    env.connect(ac.destination)
    osc.frequency.value = freq
    osc.type = type
    env.gain.setValueAtTime(gain, ac.currentTime)
    env.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration)
    osc.start()
    osc.stop(ac.currentTime + duration)
  } catch {
    // AudioContext unavailable (SSR / test env)
  }
}

export const playCorrect = (): void => tone(880, 0.15)
export const playWrong   = (): void => tone(220, 0.2, 'sawtooth', 0.2)
export const playStreak  = (): void => { tone(660, 0.1); setTimeout(() => tone(880, 0.15), 100) }
export const playTimeout = (): void => tone(110, 0.3, 'square', 0.15)
```

- [ ] **Step 2: Verify TypeScript compiles**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/audio/
git commit -m "feat: WebAudio engine — correct/wrong/streak/timeout tones"
```

---

## Task 6: Simple Components

**Files:**
- Create: `src/components/CompassRose.tsx`
- Create: `src/components/ProgressBar.tsx`
- Create: `src/components/StatCard.tsx`
- Create: `src/components/FeedbackBanner.tsx`

- [ ] **Step 1: Write `src/components/CompassRose.tsx`**

```typescript
import { motion } from 'framer-motion'

export function CompassRose() {
  return (
    <div className="relative flex items-center justify-center mx-auto mt-1.5" style={{ width: 170, height: 170 }}>
      <motion.svg
        viewBox="0 0 200 200"
        style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 6px 14px rgba(26,18,9,0.18))' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {/* Rings */}
        <circle cx="100" cy="100" r="92" fill="none" stroke="var(--ink)" strokeWidth="1" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.35" />
        <circle cx="100" cy="100" r="55" fill="none" stroke="var(--ink)" strokeWidth="1" />

        {/* 32 ticks */}
        {Array.from({ length: 32 }, (_, i) => {
          const a = (i * 360 / 32) * Math.PI / 180
          const r1 = 92, r2 = i % 8 === 0 ? 78 : 84
          return (
            <line
              key={i}
              x1={100 + Math.sin(a) * r1} y1={100 - Math.cos(a) * r1}
              x2={100 + Math.sin(a) * r2} y2={100 - Math.cos(a) * r2}
              stroke="var(--ink)" strokeWidth="0.8"
              opacity={i % 8 === 0 ? 1 : 0.55}
            />
          )
        })}

        {/* N/S ink points */}
        <polygon points="100,12 105,95 100,100 95,95"  fill="var(--ink)" />
        <polygon points="100,188 105,105 100,100 95,105" fill="var(--ink)" />
        <polygon points="12,100 95,95 100,100 95,105"  fill="var(--ink)" />
        <polygon points="188,100 105,95 100,100 105,105" fill="var(--ink)" />

        {/* E/W gold points */}
        <polygon points="100,30 130,100 100,100" fill="var(--gold)" />
        <polygon points="100,30 70,100 100,100"  fill="var(--gold)" />
        <polygon points="100,170 130,100 100,100" fill="var(--gold)" />
        <polygon points="100,170 70,100 100,100"  fill="var(--gold)" />
        <polygon points="30,100 100,70 100,100"  fill="var(--gold)" />
        <polygon points="30,100 100,130 100,100" fill="var(--gold)" />
        <polygon points="170,100 100,70 100,100"  fill="var(--gold)" />
        <polygon points="170,100 100,130 100,100" fill="var(--gold)" />

        {/* Cardinal letters */}
        <text x="100" y="9"   textAnchor="middle" dominantBaseline="middle"
          fontFamily="'Playfair Display', serif" fontSize="10" fontWeight="700" fill="var(--ink)">N</text>
        <text x="194" y="103" textAnchor="middle" dominantBaseline="middle"
          fontFamily="'Playfair Display', serif" fontSize="10" fontWeight="700" fill="var(--ink)">E</text>
        <text x="100" y="198" textAnchor="middle" dominantBaseline="middle"
          fontFamily="'Playfair Display', serif" fontSize="10" fontWeight="700" fill="var(--ink)">S</text>
        <text x="6"   y="103" textAnchor="middle" dominantBaseline="middle"
          fontFamily="'Playfair Display', serif" fontSize="10" fontWeight="700" fill="var(--ink)">O</text>
      </motion.svg>

      {/* Gold center dot */}
      <div
        className="absolute rounded-full"
        style={{
          left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
          width: 18, height: 18,
          background: 'var(--gold)',
          boxShadow: '0 0 0 3px var(--paper), 0 0 0 4px var(--ink)',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/ProgressBar.tsx`**

```typescript
interface Props {
  current: number
  total:   number
}

export function ProgressBar({ current, total }: Props) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0
  return (
    <div style={{ height: 3, background: 'rgba(245,237,214,0.12)', position: 'relative', overflow: 'hidden', marginTop: 12 }}>
      <div
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: 'linear-gradient(to right, var(--gold-2), var(--gold), var(--gold-light))',
          transition: 'width 0.35s ease',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/StatCard.tsx`**

```typescript
interface Props {
  bestStreak:     number
  totalGames:     number
  totalCorrect:   number
  totalQuestions: number
}

export function StatCard({ bestStreak, totalGames, totalCorrect, totalQuestions }: Props) {
  const acc = totalQuestions > 0 ? Math.round(100 * totalCorrect / totalQuestions) : null

  return (
    <div style={{
      border: '1px solid var(--rule)',
      background: 'rgba(255,253,243,0.45)',
      padding: '14px 14px 12px',
      marginTop: 4,
      position: 'relative',
      boxShadow: 'var(--shadow)',
    }}>
      {/* Corner brackets */}
      <div style={{ position:'absolute', left:-1, top:-1,   width:10, height:10, border:'1px solid var(--ink)', borderRight:'none', borderBottom:'none', opacity:.55 }} />
      <div style={{ position:'absolute', right:-1, bottom:-1, width:10, height:10, border:'1px solid var(--ink)', borderLeft: 'none', borderTop:  'none', opacity:.55 }} />

      <div style={{ display:'flex', alignItems:'center', gap:8, fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.28em', color:'var(--ink-soft)', textTransform:'uppercase', marginBottom:10 }}>
        <span style={{ color:'var(--gold)' }}>✦</span> Bitácora del navegante
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
        {[
          { num: bestStreak, label: 'Mejor\nRacha', gold: true },
          { num: totalGames, label: 'Partidas',     gold: false },
          { num: totalCorrect, label: 'Aciertos',   gold: false },
          { num: acc !== null ? `${acc}%` : '—', label: 'Precisión', gold: false },
        ].map(({ num, label, gold }, i, arr) => (
          <div key={i} style={{
            textAlign:'center', padding:'6px 4px',
            borderRight: i < arr.length - 1 ? '1px dashed var(--rule)' : 'none',
          }}>
            <div style={{
              fontFamily:"'Playfair Display', serif", fontWeight:700,
              fontSize:22, lineHeight:1,
              color: gold ? 'var(--gold)' : 'var(--ink)',
            }}>{num}</div>
            <div style={{
              fontFamily:"'DM Mono', monospace", fontSize:9,
              letterSpacing:'0.18em', color:'var(--ink-soft)',
              textTransform:'uppercase', marginTop:6,
              whiteSpace:'pre-line',
            }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/components/FeedbackBanner.tsx`**

```typescript
import { motion } from 'framer-motion'
import type { Country } from '../data/countries'

interface Props {
  correct:      boolean
  country:      Country
  pointsEarned: number
  streak:       number
}

export function FeedbackBanner({ correct, country, pointsEarned, streak }: Props) {
  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        marginTop: 14, padding: '10px 14px',
        background: correct ? 'var(--ok-bg)' : 'var(--err-bg)',
        border: `1px solid ${correct ? 'var(--ok)' : 'var(--err)'}`,
        fontFamily: "'Playfair Display', serif",
      }}
    >
      {correct ? (
        <div style={{ color: 'var(--ok)', display:'flex', alignItems:'center', gap:8 }}>
          <span>¡Correcto!</span>
          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:12 }}>+{pointsEarned} pts</span>
          {streak > 1 && <span>🔥 ×{streak}</span>}
        </div>
      ) : (
        <div style={{ color: 'var(--err)', display:'flex', alignItems:'center', gap:8 }}>
          <span>✗ Era:</span>
          <span style={{ fontSize:22 }}>{country.f}</span>
          <span style={{ fontWeight:700 }}>{country.n}</span>
        </div>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 5: Verify TypeScript**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/CompassRose.tsx src/components/ProgressBar.tsx src/components/StatCard.tsx src/components/FeedbackBanner.tsx
git commit -m "feat: CompassRose, ProgressBar, StatCard, FeedbackBanner components"
```

---

## Task 7: Game Components

**Files:**
- Create: `src/components/TimerRing.tsx`
- Create: `src/components/FlagStage.tsx`
- Create: `src/components/OptionsGrid.tsx`

- [ ] **Step 1: Write `src/components/TimerRing.tsx`**

```typescript
import { useEffect, useRef, useState } from 'react'

const CIRC = 2 * Math.PI * 22  // ≈ 138.23

interface Props {
  seconds:   number
  onTimeout: () => void
}

export function TimerRing({ seconds, onTimeout }: Props) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const startRef = useRef(Date.now())
  const calledRef = useRef(false)

  useEffect(() => {
    startRef.current = Date.now()
    calledRef.current = false
    setTimeLeft(seconds)

    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000
      const left = Math.max(0, seconds - elapsed)
      setTimeLeft(left)
      if (left <= 0 && !calledRef.current) {
        calledRef.current = true
        clearInterval(id)
        onTimeout()
      }
    }, 80)

    return () => clearInterval(id)
  }, [seconds, onTimeout])

  const danger = timeLeft <= 3
  const offset = CIRC * (1 - timeLeft / seconds)

  return (
    <div style={{ position:'relative', width:54, height:54 }}>
      <svg viewBox="0 0 50 50" style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }}>
        <circle cx="25" cy="25" r="22" fill="none" stroke="var(--rule)" strokeWidth="4" />
        <circle
          cx="25" cy="25" r="22" fill="none"
          stroke={danger ? 'var(--err)' : 'var(--gold)'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: 'stroke 0.3s ease' }}
        />
      </svg>
      <div style={{
        position:'absolute', inset:0,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:18,
        color: danger ? 'var(--err)' : 'var(--ink)',
        animation: danger ? 'pulse 0.5s ease-in-out infinite' : 'none',
      }}>
        {Math.ceil(timeLeft)}
      </div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}`}</style>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/FlagStage.tsx`**

```typescript
import { motion } from 'framer-motion'
import type { GameMode } from '../store/gameStore'
import type { Country } from '../data/countries'
import { TimerRing } from './TimerRing'

interface Props {
  country:   Country
  mode:      GameMode
  hint?:     string
  onTimeout?: () => void
}

export function FlagStage({ country, mode, hint, onTimeout }: Props) {
  return (
    <div style={{
      border: '1px solid var(--rule)',
      background: 'rgba(255,253,243,0.7)',
      padding: '22px 16px',
      textAlign: 'center',
      position: 'relative',
      boxShadow: 'var(--shadow)',
    }}>
      {/* Corner brackets */}
      <div style={{ position:'absolute', left:-1, top:-1,   width:8, height:8, border:'1px solid var(--gold)', borderRight:'none', borderBottom:'none' }} />
      <div style={{ position:'absolute', right:-1, bottom:-1, width:8, height:8, border:'1px solid var(--gold)', borderLeft: 'none', borderTop:  'none' }} />

      {/* Lightning timer in top-right */}
      {mode === 'lightning' && onTimeout && (
        <div style={{ position:'absolute', top:12, right:12 }}>
          <TimerRing seconds={10} onTimeout={onTimeout} />
        </div>
      )}

      {/* Flag — animated on each new country */}
      {mode !== 'country2flag' && (
        <motion.div
          key={country.n}
          initial={{ scale: 0.6, rotate: -5, opacity: 0 }}
          animate={{ scale: 1,   rotate:  0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          style={{ fontSize: 90, lineHeight: 1.1, filter: 'drop-shadow(0 6px 14px rgba(26,18,9,0.18))', userSelect: 'none' }}
        >
          {country.f}
        </motion.div>
      )}

      {/* Mode-specific text */}
      {mode === 'country2flag' && (
        <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:24, letterSpacing:'0.01em' }}>
          {country.n}
        </div>
      )}

      {mode === 'hint' && hint && (
        <div style={{ fontFamily:"'DM Mono', monospace", letterSpacing:'0.18em', fontSize:20, color:'var(--ink-2)', marginTop:14 }}>
          {hint}
        </div>
      )}

      {mode === 'capital' && (
        <>
          <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:22, marginTop:14 }}>
            {country.n}
          </div>
          <div style={{ fontFamily:"'Libre Baskerville', serif", fontStyle:'italic', color:'var(--ink-soft)', fontSize:13, marginTop:10 }}>
            ¿Cuál es su capital?
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/OptionsGrid.tsx`**

```typescript
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Country } from '../data/countries'
import type { GameMode } from '../store/gameStore'

interface Props {
  options:      Country[]
  mode:         GameMode
  correctName:  string
  onAnswer:     (correct: boolean) => void
}

const LETTERS = ['A', 'B', 'C', 'D']

export function OptionsGrid({ options, mode, correctName, onAnswer }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  function handleClick(opt: Country) {
    if (revealed) return
    setRevealed(true)
    setSelected(opt.n)
    onAnswer(opt.n === correctName)
  }

  if (mode === 'country2flag') {
    return (
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:20 }}>
        {options.map((opt, i) => {
          const isCorrect = opt.n === correctName
          const isSelected = selected === opt.n
          let bg = 'rgba(255,253,243,0.65)', border = '1px solid var(--rule)'
          if (revealed && isCorrect)  { bg = 'var(--ok-bg)';  border = '1px solid var(--ok)' }
          if (revealed && isSelected && !isCorrect) { bg = 'var(--err-bg)'; border = '1px solid var(--err)' }

          return (
            <motion.button
              key={opt.n}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleClick(opt)}
              disabled={revealed}
              data-letter={LETTERS[i]}
              style={{
                position:'relative',
                background: bg, border,
                padding:'22px 10px 14px',
                cursor: revealed ? 'default' : 'pointer',
                textAlign:'center',
                fontSize: 46, lineHeight: 1.1,
                transition: 'background .18s, border-color .18s',
              }}
            >
              <span style={{
                position:'absolute', right:8, top:8,
                fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.18em',
                color:'var(--ink-soft)', border:'1px solid var(--rule)',
                width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center',
              }}>{LETTERS[i]}</span>
              {opt.f}
            </motion.button>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ display:'grid', gap:10, marginTop:20 }}>
      {options.map((opt, i) => {
        const isCorrect = opt.n === correctName
        const isSelected = selected === opt.n
        let bg = 'rgba(255,253,243,0.65)', border = '1px solid var(--rule)', color = 'var(--ink)'
        if (revealed && isCorrect)                   { bg = 'var(--ok-bg)';  border = '1px solid var(--ok)';  color = '#eef7ed' }
        if (revealed && isSelected && !isCorrect)    { bg = 'var(--err-bg)'; border = '1px solid var(--err)'; color = '#fbe9e9' }

        const label = mode === 'capital' ? opt.c : opt.n

        return (
          <motion.button
            key={opt.n}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleClick(opt)}
            disabled={revealed}
            data-letter={LETTERS[i]}
            style={{
              position:'relative',
              background: bg, border, color,
              padding:'14px 44px 14px 16px',
              cursor: revealed ? 'default' : 'pointer',
              textAlign:'left',
              fontFamily:"'Libre Baskerville', serif",
              fontSize:15, fontWeight:700,
              display:'flex', alignItems:'center', gap:8,
              transition: 'background .18s, border-color .18s',
            }}
          >
            {(mode === 'flag2country' || mode === 'lightning') && (
              <span style={{ fontSize:22, lineHeight:1 }}>{opt.f}</span>
            )}
            <span style={{ flex:1 }}>{label}</span>
            <span style={{
              position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
              fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.18em',
              color: revealed && isCorrect ? '#fff' : revealed && isSelected ? '#fff' : 'var(--ink-soft)',
              background: revealed && isCorrect ? 'var(--ok)' : revealed && isSelected ? 'var(--err)' : 'transparent',
              border: `1px solid ${revealed && isCorrect ? 'var(--ok)' : revealed && isSelected ? 'var(--err)' : 'var(--rule)'}`,
              width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center',
            }}>{LETTERS[i]}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Verify TypeScript**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/TimerRing.tsx src/components/FlagStage.tsx src/components/OptionsGrid.tsx
git commit -m "feat: TimerRing, FlagStage, OptionsGrid game components"
```

---

## Task 8: HomeScreen

**Files:**
- Create: `src/screens/HomeScreen.tsx`

- [ ] **Step 1: Write `src/screens/HomeScreen.tsx`**

```typescript
import { CompassRose } from '../components/CompassRose'
import { StatCard } from '../components/StatCard'
import { useGameStore, type GameMode } from '../store/gameStore'
import type { Stage } from '../engine/questionEngine'
import { getPool } from '../engine/questionEngine'
import { FM_COUNTRIES } from '../data/countries'

const DIFFICULTIES: { id: Stage; icon: string; name: string; sub: string }[] = [
  { id: 'easy',   icon: '🌿', name: 'Fácil',  sub: 'Iniciado'    },
  { id: 'medium', icon: '⚓', name: 'Medio',  sub: 'Navegante'   },
  { id: 'hard',   icon: '🗺️', name: 'Experto', sub: 'Cartógrafo' },
]

const MODES: { id: GameMode; roman: string; title: string; desc: string }[] = [
  { id: 'flag2country', roman: 'I',   title: '🏳️ ¿Qué país?',    desc: 'Ves la bandera, eliges el nombre' },
  { id: 'country2flag', roman: 'II',  title: '🔍 ¿Qué bandera?', desc: 'Ves el nombre, eliges la bandera' },
  { id: 'hint',         roman: 'III', title: '🔤 Pistas',         desc: 'Letras ocultas — descifra el nombre' },
  { id: 'capital',      roman: 'IV',  title: '🏛️ Capitales',      desc: 'Identifica la capital correcta' },
  { id: 'type',         roman: 'V',   title: '✍️ Escríbelo',       desc: 'Sin opciones — solo tu memoria' },
  { id: 'lightning',    roman: 'VI',  title: '⚡ Relámpago',       desc: '10 segundos por bandera' },
]

export function HomeScreen() {
  const { stage, mode, setStage, setMode, startGame, bestStreak, totalGames, totalCorrect, totalQuestions } = useGameStore()
  const poolCount = getPool(stage, FM_COUNTRIES).length

  return (
    <div style={{ position:'relative', zIndex:1, padding:'22px 22px 28px' }}>

      {/* Nautical chart lines background */}
      <div aria-hidden="true" style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0, opacity:0.9 }}>
        <svg viewBox="0 0 430 900" preserveAspectRatio="xMidYMid slice" style={{ width:'100%', height:'100%', display:'block' }}>
          <g fill="none" stroke="var(--ink)" strokeWidth="0.6" opacity="0.07">
            <circle cx="215" cy="180" r="240"/>
            <circle cx="215" cy="180" r="180" opacity="0.5"/>
            <circle cx="215" cy="180" r="120"/>
            <circle cx="215" cy="180" r="60" opacity="0.5"/>
            <path d="M -50 180 Q 215 80 480 180"/>
            <path d="M -50 220 Q 215 320 480 220"/>
            <path d="M -50 140 Q 215 -20 480 140"/>
            <line x1="215" y1="-20" x2="215" y2="900"/>
            <line x1="-20" y1="180" x2="450" y2="180"/>
            <line x1="40" y1="-20" x2="380" y2="900"/>
            <line x1="380" y1="-20" x2="40" y2="900"/>
          </g>
        </svg>
      </div>

      <div style={{ position:'relative', zIndex:1 }}>
        <CompassRose />

        {/* Brand */}
        <div style={{ textAlign:'center', marginTop:4 }}>
          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10.5, letterSpacing:'0.36em', color:'var(--ink-soft)', textTransform:'uppercase' }}>
            Compendium · MMXXVI
          </div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontStyle:'italic', fontSize:46, lineHeight:1, letterSpacing:'-0.01em', margin:'6px 0 4px' }}>
            Flag<span style={{ color:'var(--gold)', fontStyle:'italic', fontWeight:400 }}>·</span>Master
          </h1>
          <div style={{ fontFamily:"'Libre Baskerville', serif", fontStyle:'italic', color:'var(--ink-soft)', fontSize:13.5, marginTop:2 }}>
            Un atlas ilustrado para jóvenes exploradores
          </div>
        </div>

        {/* Double rule */}
        <div style={{ height:7, position:'relative', margin:'16px 6px' }}>
          <div style={{ position:'absolute', left:0, right:0, top:0, height:1, background:'var(--ink)', opacity:.55 }}/>
          <div style={{ position:'absolute', left:0, right:0, bottom:0, height:1, background:'var(--ink)', opacity:.25 }}/>
          <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%) rotate(45deg)', width:7, height:7, background:'var(--gold)' }}/>
        </div>

        {/* Stats */}
        <StatCard bestStreak={bestStreak} totalGames={totalGames} totalCorrect={totalCorrect} totalQuestions={totalQuestions} />

        {/* Difficulty */}
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', margin:'22px 2px 10px' }}>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:18 }}>Dificultad</h2>
          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.22em', color:'var(--ink-soft)', textTransform:'uppercase' }}>{poolCount} países</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              onClick={() => setStage(d.id)}
              style={{
                background: stage === d.id ? 'var(--ink)' : 'transparent',
                border: '1px solid var(--rule)',
                padding:'12px 8px 10px', cursor:'pointer', textAlign:'center',
                color: stage === d.id ? 'var(--paper)' : 'var(--ink)',
                transition:'all .18s ease',
                boxShadow: stage === d.id ? '0 6px 18px -10px rgba(26,18,9,0.6)' : 'none',
              }}
            >
              <div style={{ fontSize:20, lineHeight:1 }}>{d.icon}</div>
              <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:14, marginTop:6 }}>{d.name}</div>
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.18em', color: stage === d.id ? 'rgba(245,237,214,0.7)' : 'var(--ink-soft)', marginTop:3 }}>{d.sub}</div>
            </button>
          ))}
        </div>

        {/* Modes */}
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', margin:'22px 2px 10px' }}>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:18 }}>Modos de juego</h2>
          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.22em', color:'var(--ink-soft)', textTransform:'uppercase' }}>Elige uno</span>
        </div>
        <div style={{ display:'grid', gap:9 }}>
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                display:'flex', alignItems:'center', gap:14,
                padding:'14px 14px',
                border: mode === m.id ? '1px solid var(--gold)' : '1px solid var(--rule)',
                background: mode === m.id ? 'rgba(255,253,243,0.85)' : 'rgba(255,253,243,0.55)',
                cursor:'pointer', textAlign:'left', color:'var(--ink)',
                transition:'all .18s ease',
              }}
            >
              <div style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontSize:24, color:'var(--gold)', width:28, textAlign:'center', lineHeight:1 }}>{m.roman}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:16 }}>{m.title}</div>
                <div style={{ fontSize:12, color:'var(--ink-soft)', marginTop:2, fontStyle:'italic' }}>{m.desc}</div>
              </div>
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize:22, color: mode === m.id ? 'var(--gold)' : 'var(--ink-soft)', transition:'transform .2s ease' }}>→</div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={startGame}
          style={{
            display:'block', width:'100%', marginTop:22,
            background:'var(--ink)', color:'var(--gold)',
            border:'none', padding:'16px 8px',
            fontFamily:"'DM Mono', monospace", fontSize:11, letterSpacing:'0.32em',
            textTransform:'uppercase', cursor:'pointer',
            boxShadow:'0 6px 18px -10px rgba(26,18,9,0.6)',
          }}
        >
          Zarpar →
        </button>

        <div style={{ marginTop:26, textAlign:'center', fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.32em', color:'var(--ink-soft)', textTransform:'uppercase' }}>
          ✦ <span style={{ color:'var(--gold)' }}>Septentrionem</span> · <span style={{ color:'var(--gold)' }}>Meridiem</span> · <span style={{ color:'var(--gold)' }}>Orientem</span> · <span style={{ color:'var(--gold)' }}>Occidentem</span> ✦
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```powershell
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/HomeScreen.tsx
git commit -m "feat: HomeScreen — compass, difficulty selector, mode picker, CTA"
```

---

## Task 9: GameScreen

**Files:**
- Create: `src/screens/GameScreen.tsx`

- [ ] **Step 1: Write `src/screens/GameScreen.tsx`**

```typescript
import { useState, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { FlagStage } from '../components/FlagStage'
import { OptionsGrid } from '../components/OptionsGrid'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { ProgressBar } from '../components/ProgressBar'
import { makeHint } from '../engine/questionEngine'
import { playCorrect, playWrong, playStreak, playTimeout } from '../audio/audioEngine'

const QUESTIONS_PER_ROUND = 10

const MODE_LABELS: Record<string, string> = {
  flag2country: 'I · ¿Qué país?',
  country2flag: 'II · ¿Qué bandera?',
  hint:         'III · Pistas',
  capital:      'IV · Capitales',
  type:         'V · Escríbelo',
  lightning:    'VI · Relámpago',
}

export function GameScreen() {
  const {
    mode, stage, qIndex, currentCountry, currentOptions,
    score, streak, answered, answer, nextQuestion, goHome,
  } = useGameStore()

  const [writeValue, setWriteValue] = useState('')
  const [writeFeedback, setWriteFeedback] = useState<{ text: string; ok: boolean } | null>(null)

  if (!currentCountry) return null

  const hint = mode === 'hint' ? makeHint(currentCountry.n, stage) : undefined

  function handleAnswer(correct: boolean) {
    answer(correct)
    if (correct) {
      if (streak + 1 >= 3) playStreak(); else playCorrect()
    } else {
      playWrong()
    }
    setWriteValue('')
  }

  function handleTimeout() {
    if (!answered) {
      playTimeout()
      handleAnswer(false)
    }
  }

  function submitWrite() {
    if (answered) return
    const { norm } = require('../engine/questionEngine')
    const correct = norm(writeValue) === norm(currentCountry.n)
    setWriteFeedback(
      correct
        ? { text: `✓ ¡Correcto! ${currentCountry.n}`, ok: true }
        : { text: `✗ Era ${currentCountry.n}${writeValue ? ` · escribiste "${writeValue}"` : ''}`, ok: false }
    )
    handleAnswer(correct)
  }

  // Points earned for this answer (for feedback display)
  const POINTS_BASE: Record<string, number> = { easy: 10, medium: 15, hard: 20 }
  const pointsEarned = POINTS_BASE[stage] + streak * 2

  return (
    <div>
      {/* Header */}
      <header style={{ background:'var(--ink)', color:'var(--paper)', padding:'14px 16px 0', boxShadow:'0 2px 0 var(--gold)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button
            onClick={goHome}
            style={{ background:'none', border:'none', color:'var(--paper)', fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.2em', cursor:'pointer', padding:'6px 0', textTransform:'uppercase' }}
          >
            ‹ Menú
          </button>
          <div style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontSize:14, color:'var(--gold-light)' }}>
            {MODE_LABELS[mode]}
          </div>
          <div style={{ width:54 }} />
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:10 }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:20, lineHeight:1, color:'var(--gold-light)' }}>{score}</div>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.18em', color:'rgba(245,237,214,0.55)', textTransform:'uppercase' }}>Puntos</div>
          </div>
          <div>
            <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:20, lineHeight:1, color:'var(--paper)', display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ color:'var(--gold-light)', fontSize:14, animation:'flicker 1.4s ease-in-out infinite' }}>✦</span>
              {streak}
            </div>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.18em', color:'rgba(245,237,214,0.55)', textTransform:'uppercase' }}>Racha</div>
          </div>
          <div style={{ marginLeft:'auto', textAlign:'right' }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:20, lineHeight:1, color:'var(--paper)' }}>{qIndex + 1}/{QUESTIONS_PER_ROUND}</div>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.18em', color:'rgba(245,237,214,0.55)', textTransform:'uppercase' }}>Pregunta</div>
          </div>
        </div>

        <ProgressBar current={qIndex} total={QUESTIONS_PER_ROUND} />
      </header>

      {/* Question area */}
      <div style={{ padding:'22px 22px 26px' }}>
        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.28em', color:'var(--ink-soft)', textTransform:'uppercase', textAlign:'center', marginBottom:12 }}>
          Pregunta <span style={{ color:'var(--gold)' }}>{qIndex + 1}</span> de {QUESTIONS_PER_ROUND}
          {mode === 'lightning' && ' · ⚡ Reloj de arena'}
          {mode === 'type' && ' · Sin opciones'}
        </div>

        <FlagStage country={currentCountry} mode={mode} hint={hint} onTimeout={handleTimeout} />

        {/* Type mode input */}
        {mode === 'type' ? (
          <div style={{ marginTop:22 }}>
            <div style={{ border:'1px solid var(--rule)', background:'rgba(255,253,243,0.85)', padding:'12px 12px', display:'flex', gap:10, alignItems:'center' }}>
              <input
                value={writeValue}
                onChange={e => setWriteValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitWrite() }}
                disabled={answered}
                autoComplete="off"
                autoCapitalize="words"
                spellCheck={false}
                placeholder="Nombre del país…"
                style={{
                  flex:1, background:'transparent', border:'none', outline:'none',
                  fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:18,
                  color:'var(--ink)', padding:'6px 4px',
                  borderBottom:'1px solid var(--rule)',
                }}
              />
              <button
                onClick={submitWrite}
                disabled={answered}
                style={{
                  background:'var(--ink)', color:'var(--paper)', border:'none',
                  padding:'10px 14px', cursor: answered ? 'default' : 'pointer',
                  fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase',
                }}
              >
                Confirmar
              </button>
            </div>
            {writeFeedback && (
              <div style={{ marginTop:14, textAlign:'center', fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontSize:15, color: writeFeedback.ok ? 'var(--ok)' : 'var(--err)' }}>
                {writeFeedback.text}
              </div>
            )}
          </div>
        ) : (
          <OptionsGrid
            options={currentOptions}
            mode={mode}
            correctName={currentCountry.n}
            onAnswer={handleAnswer}
          />
        )}

        {/* Feedback banner */}
        {answered && (
          <FeedbackBanner
            correct={useGameStore.getState().correct > 0 && useGameStore.getState().wrongList.every(c => c.n !== currentCountry.n)}
            country={currentCountry}
            pointsEarned={pointsEarned}
            streak={streak}
          />
        )}

        {/* Next button */}
        {answered && (
          <div style={{ display:'flex', justifyContent:'center', marginTop:18 }}>
            <button
              onClick={() => { setWriteFeedback(null); nextQuestion() }}
              style={{
                background:'var(--ink)', color:'var(--paper)', border:'none',
                padding:'13px 26px', cursor:'pointer',
                fontFamily:"'DM Mono', monospace", fontSize:10.5, letterSpacing:'0.28em', textTransform:'uppercase',
                boxShadow:'0 6px 18px -10px rgba(26,18,9,0.6)',
                animation:'pop-in .25s ease',
              }}
            >
              Siguiente ›
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes flicker{0%,100%{opacity:1}50%{opacity:.55}}
        @keyframes pop-in{from{transform:translateY(6px);opacity:0}to{transform:translateY(0);opacity:1}}
      `}</style>
    </div>
  )
}
```

**Note:** The `require()` in `submitWrite` is wrong. Fix it: move `import { norm } from '../engine/questionEngine'` to the top of the file.

- [ ] **Step 2: Fix the require() — move norm import to top**

After writing the file, immediately edit: remove the `require(...)` call in `submitWrite` and add `import { makeHint, norm } from '../engine/questionEngine'` to imports.

Also fix the `FeedbackBanner` correct detection — it should use the last answer result, not re-derive from store state. Add local state:

```typescript
const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false)

function handleAnswer(correct: boolean) {
  setLastAnswerCorrect(correct)
  answer(correct)
  // ... rest of fn
}
```

Then in FeedbackBanner: `correct={lastAnswerCorrect}`.

- [ ] **Step 3: Verify TypeScript**

```powershell
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/screens/GameScreen.tsx
git commit -m "feat: GameScreen — HUD, all 6 modes, feedback, next button"
```

---

## Task 10: ResultScreen + App Wiring

**Files:**
- Create: `src/screens/ResultScreen.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write `src/screens/ResultScreen.tsx`**

```typescript
import { useGameStore } from '../store/gameStore'

const TIERS = [
  { min: 1.0,  emoji: '🏆', title: 'Perfecto',    sub: 'Has dominado los siete mares.' },
  { min: 0.8,  emoji: '🌟', title: 'Magnífico',   sub: 'Tu brújula apenas vacila.' },
  { min: 0.6,  emoji: '⚓', title: 'Buen viaje',   sub: 'Buen rumbo, capitán.' },
  { min: 0.4,  emoji: '🧭', title: 'Travesía',    sub: 'Aún quedan costas por descubrir.' },
  { min: 0.2,  emoji: '🪨', title: 'Encallado',   sub: 'Endereza el timón y vuelve a zarpar.' },
  { min: 0,    emoji: '🌧️', title: 'Naufragio',   sub: 'Vuelve a embarcar y traza una nueva ruta.' },
]

const QUESTIONS_PER_ROUND = 10

export function ResultScreen() {
  const { score, correct, maxStreak, wrongList, startGame, goHome } = useGameStore()

  const pct = correct / QUESTIONS_PER_ROUND
  const tier = TIERS.find(t => pct >= t.min) ?? TIERS[TIERS.length - 1]

  return (
    <div style={{ padding:'26px 22px 28px', textAlign:'center' }}>
      <div style={{ fontSize:64, lineHeight:1, animation:'pop-in .6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>{tier.emoji}</div>
      <div style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontWeight:900, fontSize:34, marginTop:8 }}>{tier.title}</div>
      <div style={{ fontFamily:"'Libre Baskerville', serif", fontStyle:'italic', color:'var(--ink-soft)', marginTop:4 }}>{tier.sub}</div>

      <div style={{ height:1, background:'var(--rule)', margin:'18px 0 16px' }} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, margin:'4px 0' }}>
        {[
          { val: score,   label: 'Puntos',       gold: true  },
          { val: `${correct}/${QUESTIONS_PER_ROUND}`, label: 'Aciertos', gold: false },
          { val: maxStreak, label: 'Mejor Racha', gold: false },
        ].map(({ val, label, gold }) => (
          <div key={label} style={{ padding:'10px 6px', border:'1px solid var(--rule)', background:'rgba(255,253,243,0.55)' }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:24, color: gold ? 'var(--gold)' : 'var(--ink)' }}>{val}</div>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.2em', color:'var(--ink-soft)', marginTop:4, textTransform:'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {wrongList.length > 0 && (
        <div style={{ textAlign:'left', marginTop:22 }}>
          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.24em', color:'var(--ink-soft)', textTransform:'uppercase', marginBottom:8 }}>
            ✦ Banderas para repasar
          </div>
          <div style={{ display:'grid', gap:6 }}>
            {wrongList.map(c => (
              <div key={c.n} style={{ display:'flex', alignItems:'center', gap:12, border:'1px solid var(--rule)', padding:'8px 12px', background:'rgba(255,253,243,0.55)' }}>
                <span style={{ fontSize:26 }}>{c.f}</span>
                <div>
                  <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:14, lineHeight:1.1 }}>{c.n}</div>
                  <div style={{ fontFamily:"'Libre Baskerville', serif", fontStyle:'italic', fontSize:11.5, color:'var(--ink-soft)' }}>Capital: {c.c}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:22 }}>
        <button
          onClick={goHome}
          style={{ padding:'14px 8px', border:'1px solid var(--ink)', background:'transparent', color:'var(--ink)', fontFamily:"'DM Mono', monospace", fontSize:10.5, letterSpacing:'0.28em', textTransform:'uppercase', cursor:'pointer' }}
        >
          Menú
        </button>
        <button
          onClick={startGame}
          style={{ padding:'14px 8px', border:'1px solid var(--ink)', background:'var(--ink)', color:'var(--paper)', fontFamily:"'DM Mono', monospace", fontSize:10.5, letterSpacing:'0.28em', textTransform:'uppercase', cursor:'pointer' }}
        >
          Repetir
        </button>
      </div>

      <style>{`@keyframes pop-in{from{transform:translateY(6px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  )
}
```

- [ ] **Step 2: Replace `src/App.tsx`**

```typescript
import { useGameStore } from './store/gameStore'
import { HomeScreen } from './screens/HomeScreen'
import { GameScreen } from './screens/GameScreen'
import { ResultScreen } from './screens/ResultScreen'

export default function App() {
  const screen = useGameStore(s => s.screen)

  return (
    <div className="app">
      {screen === 'home'    && <HomeScreen />}
      {screen === 'game'    && <GameScreen />}
      {screen === 'results' && <ResultScreen />}
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript and build**

```powershell
npx tsc --noEmit
npm run build
```
Expected: both succeed.

- [ ] **Step 4: Run all tests**

```powershell
npx vitest run
```
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/ResultScreen.tsx src/App.tsx
git commit -m "feat: ResultScreen, App router — Sprint 1 core complete"
```

---

## Task 11: PWA + GitHub Actions

**Files:**
- Create: `public/manifest.webmanifest`
- Create: `.github/workflows/deploy.yml`
- Create: `public/icon-192.png` and `public/icon-512.png` (placeholder PNGs)

- [ ] **Step 1: Write `public/manifest.webmanifest`**

```json
{
  "name": "FlagMaster — Atlas de Banderas",
  "short_name": "FlagMaster",
  "description": "Aprende las banderas del mundo en familia",
  "theme_color": "#1a1209",
  "background_color": "#f5edd6",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Generate placeholder icons**

```powershell
# Create minimal 192x192 PNG (1x1 pixel, upscaled by browser)
# Use any tool available: sharp, canvas, or copy a placeholder
# Quickest: download or create a basic colored square PNG
# If no tool available, create an SVG-based favicon and note icons are TODO
```

If no image tool is available, add `vite-plugin-pwa`'s `injectManifest` mode with SVG icons and note that proper PNG icons should be created before deploy.

- [ ] **Step 3: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 4: Verify full build**

```powershell
npm run build
```
Expected: `dist/` built, manifest included.

- [ ] **Step 5: Commit**

```bash
git add public/manifest.webmanifest .github/workflows/deploy.yml
git commit -m "feat: PWA manifest, GitHub Actions deploy to Pages"
```

---

## Self-Review

### Spec coverage check

| Requirement | Task |
|-------------|------|
| 86 countries with f/n/c/s/r | Task 2 |
| 6 game modes | Tasks 7, 9 |
| Question engine: getPool, shuffle, makeHint, norm, pickDistractors | Task 3 |
| Zustand store with persist | Task 4 |
| Score: base + streak×2 | Task 4 |
| Lightning 10s timer | Task 7 (TimerRing) |
| WebAudio engine | Task 5 |
| CompassRose 40s spin | Task 6 |
| FlagStage spring animation | Task 7 |
| OptionsGrid all modes + states | Task 7 |
| FeedbackBanner slideUp | Task 6 |
| ProgressBar gradient | Task 6 |
| StatCard with corner brackets | Task 6 |
| HomeScreen complete | Task 8 |
| GameScreen + type mode | Task 9 |
| ResultScreen with tiers | Task 10 |
| CSS tokens + Tailwind map | Task 1 |
| PWA manifest | Task 11 |
| GitHub Actions deploy | Task 11 |
| Tests: countries, engine, store | Tasks 2, 3, 4 |
| Desktop frame (720px+) | Task 1 (index.css) |

### Placeholder scan

- Task 9, Step 1: `require()` call flagged inline — fix in Step 2.
- Task 9, Step 1: `FeedbackBanner correct` prop derivation flagged — fix in Step 2.
- Task 11, Step 2: PNG icons marked as TODO if no tool available.

### Type consistency

- `Stage` type exported from `questionEngine.ts`, imported in `gameStore.ts` and `HomeScreen.tsx` ✓
- `GameMode` type exported from `gameStore.ts`, imported in `FlagStage`, `OptionsGrid`, `GameScreen` ✓
- `Country` type exported from `countries.ts`, used everywhere ✓
- `FM_COUNTRIES` imported in `gameStore.ts` via direct import ✓

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-12-flagmaster-sprint-1.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks

**2. Inline Execution** — execute tasks in this session using `superpowers:executing-plans`

**Which approach?**
