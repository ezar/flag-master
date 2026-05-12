# SPECS.md — FlagMaster · Especificaciones técnicas

> Documento de referencia para Claude Code y cualquier desarrollador.
> Fuente de verdad junto con `docs/FlagMaster.html` y `docs/FlagMaster_Brief.html`.

---

## § 01 · Visión general

**FlagMaster — Atlas de Banderas** es un juego educativo mobile-first para aprender banderas del mundo en familia. Prototipo funcional ya existente en `docs/FlagMaster.html`. Este documento especifica la conversión a app de producción.

| Atributo | Valor |
|----------|-------|
| Nombre | FlagMaster — Atlas de Banderas |
| Público | Niños (6-12) + adultos, uso en familia |
| Dispositivo prioritario | Móvil (max-width 430px) |
| Offline | Sí (PWA) |
| Idioma | Español |
| Repo | github.com/ezar/flag-master |
| Deploy | GitHub Pages |

---

## § 02 · Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | React + TypeScript strict | 18 / 5.x |
| Build | Vite | 5 |
| State | Zustand + persist middleware | 5 |
| Animation | Framer Motion | 11 |
| Styling | Tailwind CSS + CSS custom properties | 3 |
| PWA | vite-plugin-pwa + Workbox | latest |
| Tests | Vitest | 2 |
| Deploy | GitHub Actions → GitHub Pages | — |

Mismo patrón que `ezar/nakama-words`. No introducir dependencias adicionales sin justificación.

---

## § 03 · Estructura de carpetas

```
flag-master/
├── docs/
│   ├── FlagMaster.html             ← prototipo jugable (fuente de verdad)
│   └── FlagMaster_Brief.html       ← brief de diseño
├── public/
│   ├── favicon.svg
│   └── manifest.webmanifest
├── src/
│   ├── audio/
│   │   └── audioEngine.ts
│   ├── components/
│   │   ├── CompassRose.tsx
│   │   ├── FlagStage.tsx
│   │   ├── OptionsGrid.tsx
│   │   ├── TimerRing.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StatCard.tsx
│   │   └── FeedbackBanner.tsx
│   ├── data/
│   │   └── countries.ts
│   ├── engine/
│   │   └── questionEngine.ts
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── GameScreen.tsx
│   │   └── ResultScreen.tsx
│   ├── store/
│   │   └── gameStore.ts
│   ├── styles/
│   │   └── tokens.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .github/workflows/deploy.yml
├── .gitignore
├── CLAUDE.md
├── SPECS.md                        ← este fichero
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## § 04 · Modelo de datos

### Country

```typescript
export interface Country {
  f: string;                                              // emoji bandera
  n: string;                                              // nombre en español
  c: string;                                              // capital
  s: 'easy' | 'medium' | 'hard';                         // dificultad
  r: 'europe' | 'americas' | 'asia' | 'africa' | 'oceania'; // región
}
```

### Regiones (FM_REGIONS)

```typescript
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
];
```

### Países mínimos (70+)

Extraer de `docs/FlagMaster.html` — array `COUNTRIES`. Añadir campo `r` a cada uno:

| Stage | Cantidad | Ejemplos |
|-------|----------|---------|
| easy | ~20 | España, Francia, Alemania, Italia, UK, Portugal, Brasil, EE.UU., México, Argentina, Japón, China, Rusia, Canadá, Australia, Países Bajos, Suecia, Noruega, Grecia, Suiza |
| medium | ~25 | Polonia, Ucrania, Rumanía, Bélgica, Austria, Hungría, Rep. Checa, Dinamarca, Finlandia, Irlanda, Turquía, Corea del Sur, India, Sudáfrica, Egipto, Marruecos, Arabia Saudí, Israel, Tailandia, Filipinas, Colombia, Chile, Perú, Indonesia, Vietnam |
| hard | ~25+ | Eslovaquia, Eslovenia, Croacia, Bosnia, Albania, Montenegro, Bulgaria, Estonia, Letonia, Lituania, Bielorrusia, Georgia, Armenia, Azerbaiyán, Kazajistán, Uzbekistán, Nigeria, Ghana, Senegal, Etiopía, Túnez, Nueva Zelanda, Pakistán, Bangladesh, Iraq |

---

## § 05 · Estado (Zustand)

```typescript
// ── Tipos ─────────────────────────────────────────────
type GameMode   = 'flag2country' | 'country2flag' | 'hint' | 'capital' | 'type' | 'lightning'
type Stage      = 'easy' | 'medium' | 'hard'
type Screen     = 'home' | 'game' | 'results'

// ── Sesión (NO persistida) ────────────────────────────
interface SessionState {
  screen:     Screen
  questions:  Country[]
  qIndex:     number
  score:      number
  streak:     number
  maxStreak:  number
  correct:    number
  answered:   boolean
  wrongList:  Country[]
}

// ── Preferencias (persistidas) ────────────────────────
interface PrefsState {
  stage: Stage
  mode:  GameMode
}

// ── Histórico (persistido) ────────────────────────────
interface HistoryState {
  bestStreak:     number
  totalGames:     number
  totalCorrect:   number
  totalQuestions: number
}

// ── Maestría por país (persistida) ───────────────────
interface MasteryState {
  countries: Record<string, { seen: number; hits: number }>
  regions:   Record<string, { unlocked: boolean }>
}
```

### Store actions

```typescript
startGame():    void   // construye questions[], resetea sesión, va a 'game'
nextQuestion(): void   // avanza qIndex o llama finishGame()
answer(correct: boolean): void  // actualiza score/streak/wrongList, llama renderHeader
finishGame():   void   // persiste stats, actualiza maestría, va a 'results'
goHome():       void   // limpia sesión, va a 'home'
setStage(s: Stage): void
setMode(m: GameMode): void
```

Usar `persist` de Zustand solo para `PrefsState`, `HistoryState` y `MasteryState`. `SessionState` vive solo en memoria.

---

## § 06 · Question Engine

```typescript
// Pool acumulativo: hard incluye medium+easy
export function getPool(stage: Stage, countries: Country[]): Country[]

// Fisher-Yates
export function shuffle<T>(arr: T[]): T[]

// Letras reveladas: easy→2, medium/hard→1; primera letra siempre visible
// Espacios preservados, resto → '·'
export function makeHint(name: string, stage: Stage): string

// Elimina acentos, minúsculas, trim — para modo 'type'
export function norm(s: string): string

// N distractores aleatorios del pool, excluyendo `correct`
export function pickDistractors(correct: Country, pool: Country[], n: number): Country[]
```

La lógica de `makeHint` viene de `maskName()` en el prototipo. La de `norm` es idéntica a la del prototipo.

---

## § 07 · Modos de juego

| ID | Nombre UI | Estímulo | Respuesta | Distractores |
|----|-----------|----------|-----------|--------------|
| `flag2country` | ¿Qué país? | Bandera grande | 4 botones: flag pequeña + nombre | 3 países del pool |
| `country2flag` | ¿Qué bandera? | Nombre del país | Grid 2×2: solo emoji 44px | 3 países del pool |
| `hint` | Pistas | Bandera + texto enmascarado | 4 botones: nombre | 3 países del pool |
| `capital` | Capitales | Bandera + nombre del país | 4 botones: capital | 3 capitales del pool |
| `type` | Escríbelo | Bandera | Input libre + Enter | — (normalizar con `norm()`) |
| `lightning` | Relámpago | Bandera + TimerRing | 4 botones: nombre | 3 países del pool |

### Opciones
- Letras de opción: A / B / C / D como atributo `data-letter` + CSS `::before content: attr(data-letter)`
- Timeout Relámpago: 10s, `setInterval` cada 80ms — timeout = respuesta incorrecta
- `country2flag`: grid 2×2 con `grid-template-columns: 1fr 1fr`

---

## § 08 · Sistema de puntuación

```
PUNTOS_BASE = { easy: 10, medium: 15, hard: 20 }

Si correcto:
  puntos += PUNTOS_BASE[stage] + streak_actual * 2
  streak++

Si incorrecto:
  streak = 0
  wrongList.push(country)
```

Extraído de `finalizeAnswer()` en el prototipo.

---

## § 09 · Maestría y desbloqueo (roadmap Sprint 1-2)

```typescript
// Un país está "dominado" si: seen >= 3 AND hits/seen >= 0.66
function isMastered(entry: { seen: number; hits: number }): boolean

// Maestría de una región: dominados / total países de esa región
function regionMastery(regionId: string, countries: Country[], mastery: MasteryState): number

// Una región se desbloquea cuando la región anterior supera el umbral
function isUnlocked(region: Region, mastery: MasteryState, countries: Country[]): boolean
```

Umbrales de desbloqueo por región: Europe→libre, Americas→60%, Asia→60%, Africa→50%, Oceania→50%.

---

## § 10 · Logros (Sprint 2)

| ID | Nombre | Condición |
|----|--------|-----------|
| `first-game` | Primer viaje | Completar la primera partida |
| `perfect-run` | Sin fallos | 10/10 en una partida |
| `streak-15` | Racha de 15 | 15 aciertos consecutivos |
| `lightning-master` | Velocista | 10/10 en modo Relámpago |
| `europe-cleared` | Europa dominada | regionMastery('europe') >= 1 |
| `world-cleared` | Conquistador | Todas las regiones desbloqueadas |
| `all-mastered` | Cartógrafo | Todos los países dominados |

---

## § 11 · Diseño — tokens CSS

```css
:root {
  --paper:      #f5edd6;   /* pergamino base */
  --paper-2:    #efe4c4;
  --paper-3:    #e8d9b0;
  --ink:        #1a1209;   /* tinta oscura */
  --ink-2:      #3a2a18;
  --ink-soft:   #5c4528;
  --gold:       #b8872a;   /* acento dorado */
  --gold-light: #d9b366;
  --ok-bg:      #0d3320;   /* acierto fondo */
  --ok:         #2d8c55;   /* acierto borde/texto */
  --err-bg:     #2d0a0a;   /* error fondo */
  --err:        #8b2222;   /* error borde/texto */
  --rule:       rgba(26,18,9,0.18);
  --shadow:     0 1px 0 rgba(26,18,9,0.06), 0 18px 30px -22px rgba(26,18,9,0.35);
}
```

Mapear en `tailwind.config.js`:
```js
extend: {
  colors: {
    paper:    'var(--paper)',
    'paper-2':'var(--paper-2)',
    ink:      'var(--ink)',
    gold:     'var(--gold)',
    ok:       'var(--ok)',
    err:      'var(--err)',
  }
}
```

### Tipografías

| Rol | Fuente | Peso/Estilo |
|-----|--------|-------------|
| Títulos, h1 | Playfair Display | 900 italic |
| Subtítulos, números | Playfair Display | 700 |
| Cuerpo, opciones | Libre Baskerville | 400 / 700 |
| Labels, mono UI | DM Mono | 400 / 500 |

Cargar en `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Fondo body (pergamino)

```css
body {
  background-image:
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'>
      <filter id='n'>
        <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>
        <feColorMatrix values='0 0 0 0 0.10 0 0 0 0 0.07 0 0 0 0 0.04 0 0 0 0.18 0'/>
      </filter>
      <rect width='100%' height='100%' filter='url(%23n)'/>
    </svg>"),
    radial-gradient(140% 90% at 20% 0%, #faf2da 0%, #f5edd6 38%, #ecdfbd 100%);
  background-blend-mode: multiply, normal;
}
```

### App shell

```css
.app {
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
}

/* Desktop: app flota como tarjeta */
@media (min-width: 720px) {
  body { background: pergamino tostado más oscuro; display: flex; }
  .app {
    box-shadow: 0 0 0 1px rgba(26,18,9,0.14), 0 30px 60px -24px rgba(26,18,9,0.45);
    border-radius: 4px;
    overflow: hidden;
  }
}
```

---

## § 12 · Componentes — especificaciones

### CompassRose.tsx
- SVG 170×170px
- Anillo exterior: `stroke-dasharray="4 4"`, `stroke: var(--ink)`, `stroke-width="1"`
- 8 puntas: N/S en `var(--ink)`, E/O en `var(--gold)` — polígonos `<polygon>`
- Ticks de graduación en el anillo cada 10°
- Letras N/S/E/O: `font-family: Playfair Display, serif; font-size: 10px; font-weight: 700`
- Animación: Framer Motion `animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}`
- Centro: `<div>` circular dorado con `box-shadow: 0 0 0 3px var(--paper), 0 0 0 4px var(--ink)` sobre el SVG en `position: absolute`

### FlagStage.tsx
Props: `flag?: string`, `countryName?: string`, `hint?: string`, `mode: GameMode`

- Fondo: `background: var(--ink)` + `radial-gradient(ellipse at center, rgba(184,135,42,0.08), transparent 70%)`
- Bandera: Framer Motion `key={flag}` para retriggear animación en cada pregunta
  ```
  initial={{ scale: 0.6, rotate: -5, opacity: 0 }}
  animate={{ scale: 1,   rotate:  0, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
  ```
- `font-size: 90px; filter: drop-shadow(0 4px 20px rgba(0,0,0,0.5))`
- En modo `lightning`: `<TimerRing>` posicionado `absolute top-3 right-3`

### TimerRing.tsx
Props: `seconds: number`, `onTimeout: () => void`

- SVG 56×56px, `r=22`, `circumference = 2π×22 ≈ 138.23`
- Arco: `stroke-dasharray={circumference}`, `stroke-dashoffset` de 0 a CIRC en `seconds` s
- `setInterval` cada 80ms para suavidad
- `stroke: var(--gold)` → `stroke: var(--err)` cuando `timeLeft ≤ 3`
- Número centrado en DM Mono, también cambia a rojo
- Al expirar: llama `onTimeout()`, se desmonta

### OptionsGrid.tsx
Props: `options: Country[]`, `mode: GameMode`, `correctName: string`, `onAnswer: (correct: boolean) => void`

- Modo `country2flag`:
  ```css
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  ```
  Botones: `padding: 18px 10px; font-size: 44px; justify-content: center`

- Resto de modos: lista columna, cada botón:
  ```
  flag pequeña (22px) + nombre en Libre Baskerville 15px
  data-letter="A/B/C/D" → ::before { content: attr(data-letter) }
  ```

- Estados tras responder:
  - Correcto: `background: var(--ok-bg); border-color: var(--ok); color: #7edba0`
  - Incorrecto (seleccionado): `background: var(--err-bg); border-color: var(--err); color: #e07070`
  - Resto: `disabled`, sin cambio visual
- Framer Motion: `whileTap={{ scale: 0.97 }}`

### FeedbackBanner.tsx
Props: `correct: boolean`, `country: Country`, `pointsEarned: number`, `streak: number`

```
initial={{ y: 8, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.2 }}
```
- Ok: `¡Correcto!` + `+N pts` + `🔥` si streak > 1
- Error: `✗ Era: 🏳️ Nombre del país`

### ProgressBar.tsx
Props: `current: number`, `total: number`

```css
background: linear-gradient(90deg, var(--ok), var(--gold));
transition: width 0.45s ease;
```

### StatCard.tsx
Props: `stats: { bestStreak, totalGames, totalCorrect, totalQuestions }`

- Borde con esquinas decorativas via `::before` / `::after` (bracket angular 10×10px)
- Grid 4 columnas: Partidas · Aciertos · Racha · %
- Separadores verticales dashed

---

## § 13 · Pantallas

### HomeScreen
1. `div.chart-lines` — SVG decorativo de líneas de carta náutica (posición absoluta, opacidad 0.07)
2. `<CompassRose>` centrada
3. Ornamento doble regla con diamante dorado
4. Eyebrow mono + h1 Playfair italic 900 + subtítulo italic
5. `<StatCard>` con histórico persistido
6. Selector de dificultad (3 botones: Fácil/Medio/Experto)
7. Grid de modos (6 cards: número romano + nombre + descripción)
8. Botón CTA "Zarpar →" — `background: var(--ink); color: var(--gold)`

### GameScreen
1. Header negro: botón salir + `<ProgressBar>` + contador Q/N
2. HUD: score pill + streak pill + timer pill (solo modo lightning)
3. Badge de modo actual (DM Mono uppercase)
4. `<FlagStage>` — zona principal de pregunta
5. `<OptionsGrid>` o input para modo `type`
6. `<FeedbackBanner>` (hidden hasta responder)
7. Botón "Siguiente →" (hidden hasta responder)

### ResultScreen
1. Hero negro con radial gradient dorado: emoji grande + título + subtítulo
2. Stats strip: Puntos / Aciertos / Racha máx.
3. Lista "Para repasar" (solo si wrongList.length > 0): flag + nombre + capital
4. Botones: "Repetir" (primario) + "Menú" (secundario)

Textos según % de acierto:
| % | Emoji | Título | Subtítulo |
|---|-------|--------|-----------|
| 100% | 🏆 | Perfecto | Has dominado los siete mares. |
| ≥80% | 🌟 | Magnífico | Tu brújula apenas vacila. |
| ≥60% | ⚓ | Buen viaje | Buen rumbo, capitán. |
| ≥40% | 🧭 | Travesía | Aún quedan costas por descubrir. |
| ≥20% | 🪨 | Encallado | Endereza el timón y vuelve a zarpar. |
| <20% | 🌧️ | Naufragio | Vuelve a embarcar y traza una nueva ruta. |

---

## § 14 · Audio engine

WebAudio API, cero ficheros. Misma filosofía que nakama-words:

```typescript
// audioEngine.ts
let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function tone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3) {
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
}

export const playCorrect = () => tone(880, 0.15)
export const playWrong   = () => tone(220, 0.2, 'sawtooth', 0.2)
export const playStreak  = () => { tone(660, 0.1); setTimeout(() => tone(880, 0.15), 100) }
export const playTimeout = () => tone(110, 0.3, 'square', 0.15)
```

---

## § 15 · PWA

### manifest.webmanifest
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

### vite.config.ts
```typescript
import { VitePWA } from 'vite-plugin-pwa'

VitePWA({
  registerType: 'autoUpdate',
  workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] },
  manifest: { /* ver arriba */ }
})
```

---

## § 16 · GitHub Actions

```yaml
# .github/workflows/deploy.yml
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
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - uses: actions/deploy-pages@v4
        id: deployment
```

En GitHub → Settings → Pages → Source: **GitHub Actions**.

---

## § 17 · Tests (Vitest)

### questionEngine.test.ts
- `getPool('easy')` devuelve solo países con `s='easy'`
- `getPool('hard')` incluye easy + medium + hard
- `shuffle` no pierde elementos, no devuelve siempre el mismo orden
- `makeHint('España', 'easy')` → `'Es___a'` (primeras 2 letras)
- `makeHint('España', 'hard')` → `'E_____'` (primera letra)
- `norm('Japón')` === `norm('japon')` === `'japon'`
- `pickDistractors` devuelve N elementos, ninguno igual al correcto

### countries.test.ts
- Todos los países tienen `f`, `n`, `c`, `s`, `r`
- `n` no tiene duplicados
- Total ≥ 70 países
- Todos los `s` son `easy | medium | hard`
- Todos los `r` son `europe | americas | asia | africa | oceania`

### gameStore.test.ts
- `startGame()` inicializa `qIndex=0`, `score=0`, `streak=0`
- Respuesta correcta: `score` sube, `streak` sube
- Respuesta incorrecta: `streak` vuelve a 0, `wrongList` crece
- `finishGame()` persiste `totalGames++`

---

## § 18 · Roadmap

| Sprint | Foco | Entregables clave |
|--------|------|-------------------|
| 0 (actual) | Prototipo HTML | `docs/FlagMaster.html` ✓ |
| 1 | Cimientos | Scaffold React+TS, countries.ts, engine, store, 6 modos funcionales |
| 2 | Mapa y desbloqueo | Sistema de maestría, mapa de continentes SVG, animación sello |
| 3 | Diario y retención | Reto diario, logros, modo Travesía (5 banderas por continente con vidas) |
| 4 | Multijugador familiar | Pase y juega, avatares, ranking familiar, diploma PDF imprimible |

---

## § 19 · Decisiones pendientes

Antes del Sprint 2 cerrar estos puntos:

1. **Subdivisión de Américas** — ¿un solo continente o Norte / Centro+Caribe / Sur?
2. **Orden de desbloqueo** — ¿lineal fijo o el usuario elige cuál abrir tras el primero?
3. **Umbral de maestría** — ¿60% es el umbral correcto o lo bajamos para más fluidez?
4. **Reset de continente** — ¿permitimos rehacer un continente para subir el porcentaje?

---

*✦ · ✦ · ✦*
