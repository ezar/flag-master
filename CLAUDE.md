# CLAUDE.md — FlagMaster

> Este fichero es leído automáticamente por Claude Code al arrancar.
> Contiene todo lo necesario para construir el proyecto desde cero.

---

## Contexto

Estoy construyendo **FlagMaster — Atlas de Banderas**, un juego educativo de banderas del mundo para aprender en familia (mobile-first).

**Antes de escribir ningún código, lee estos tres ficheros en orden:**
1. `SPECS.md` — especificaciones técnicas completas: tipos, store, engine, componentes, pantallas, tests, roadmap. Es el documento de arquitectura.
2. `docs/FlagMaster.html` — prototipo jugable completo. Contiene la lógica de juego real, los 70+ países, los 6 modos y el diseño visual final. Es la fuente de verdad del comportamiento.
3. `docs/FlagMaster_Brief.html` — brief de diseño. Contiene la paleta, tipografías, tokens CSS y decisiones pendientes.

Ahora lo convertimos a una app de producción siguiendo exactamente el mismo stack y estructura de `ezar/nakama-words` (https://github.com/ezar/nakama-words).

---

## Stack exacto (igual que nakama-words)

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite 5 |
| State | Zustand 5 + persist middleware |
| Animation | Framer Motion 11 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| PWA | vite-plugin-pwa + Workbox |
| Tests | Vitest 2 |
| Deploy | GitHub Actions → GitHub Pages |

---

## Estructura de carpetas objetivo

```
flag-master/
├── docs/
│   ├── FlagMaster.html             # prototipo jugable (referencia)
│   └── FlagMaster_Brief.html       # brief técnico (referencia)
├── public/
│   ├── favicon.svg
│   └── manifest.webmanifest
├── src/
│   ├── audio/
│   │   └── audioEngine.ts          # WebAudio API — sin ficheros de audio
│   ├── components/
│   │   ├── CompassRose.tsx          # SVG animado, spin-slow 40s
│   │   ├── FlagStage.tsx            # Zona de bandera con entrada elástica
│   │   ├── OptionsGrid.tsx          # Grid de opciones (2×2 o lista)
│   │   ├── TimerRing.tsx            # SVG circular, 10s, danger<3s
│   │   ├── ProgressBar.tsx          # Barra de progreso gold/teal
│   │   ├── StatCard.tsx             # Tarjeta de estadísticas con brackets
│   │   └── FeedbackBanner.tsx       # Acierto/error con animación slideUp
│   ├── data/
│   │   └── countries.ts             # FM_COUNTRIES: 70+ países con f,n,c,s,r
│   ├── engine/
│   │   └── questionEngine.ts        # Pool filtering, shuffle, makeHint, norm()
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── GameScreen.tsx
│   │   └── ResultScreen.tsx
│   ├── store/
│   │   └── gameStore.ts             # Zustand: stage, mode, session, persist
│   ├── styles/
│   │   └── tokens.css               # CSS custom properties (paleta atlas)
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .gitignore
├── CLAUDE.md                        # este fichero
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Datos: countries.ts

Extrae los países directamente de `docs/FlagMaster.html` (array `COUNTRIES` en el JS). Cada país tiene esta forma:

```typescript
export interface Country {
  f: string;   // emoji de bandera
  n: string;   // nombre en español
  c: string;   // capital
  s: 'easy' | 'medium' | 'hard';  // dificultad
  r: 'europe' | 'americas' | 'asia' | 'africa' | 'oceania';  // región (añadir)
}

export const FM_COUNTRIES: Country[] = [ /* extraído del prototipo */ ]
```

Añadir el campo `r` (región) a cada país — no existe en el prototipo pero lo necesitamos para el roadmap de continentes.

---

## Store: gameStore.ts

```typescript
// Estado de sesión (no persistido)
interface SessionState {
  questions: Country[];
  qIndex: number;
  score: number;
  streak: number;
  maxStreak: number;
  correct: number;
  answered: boolean;
  wrongList: Country[];
}

// Estado persistido en localStorage
interface PersistedState {
  bestStreak: number;
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
}

// Preferencias (persistidas)
interface PrefsState {
  stage: 'easy' | 'medium' | 'hard';
  mode: GameMode;
}

type GameMode = 'flag2country' | 'country2flag' | 'hint' | 'capital' | 'type' | 'lightning';
type Screen = 'home' | 'game' | 'results';
```

Usar Zustand con `persist` para `PersistedState` y `PrefsState`. `SessionState` no se persiste.

---

## Question Engine: questionEngine.ts

```typescript
// Pool filtrado por stage (acumulativo: hard incluye medium+easy)
export function getPool(stage: Stage, countries: Country[]): Country[]

// Shuffle Fisher-Yates
export function shuffle<T>(arr: T[]): T[]

// Pistas: revela primeras N letras por palabra según dificultad
// easy→2 letras, medium→1 letra, hard→1 letra; resto = '·'
// Lógica extraída de maskName() en el prototipo
export function makeHint(name: string, stage: Stage): string

// Normalización para modo 'type': elimina acentos, minúsculas, trim
export function norm(s: string): string

// Selecciona N distractores del pool excluyendo el país correcto
export function pickDistractors(correct: Country, pool: Country[], n: number): Country[]
```

La lógica exacta está en `docs/FlagMaster.html` — funciones `maskName`, `norm`, `shuffle`, `pickN`.

---

## Lógica de puntuación

Extraída del prototipo (`finalizeAnswer`):

```
PUNTOS_BASE = { easy: 10, medium: 15, hard: 20 }
puntos_ganados = PUNTOS_BASE[stage] + streak_actual * 2
```

Timer en modo Relámpago: 10 segundos con `setInterval` cada 80ms. Timeout = respuesta incorrecta.

---

## Modos de juego (6)

| ID | Nombre | Pregunta | Respuesta |
|----|--------|----------|-----------|
| `flag2country` | ¿Qué país? | Bandera grande | 4 botones con nombre + flag pequeña |
| `country2flag` | ¿Qué bandera? | Nombre del país | Grid 2×2 con emojis grandes |
| `hint` | Pistas | Bandera + letras enmascaradas | 4 botones con nombre |
| `capital` | Capitales | Bandera + nombre | 4 botones con capital |
| `type` | Escríbelo | Bandera | Input libre + Enter para confirmar |
| `lightning` | Relámpago | Bandera + TimerRing | 4 botones con nombre |

---

## Diseño — tokens CSS

```css
:root {
  --paper:      #f5edd6;
  --paper-2:    #efe4c4;
  --paper-3:    #e8d9b0;
  --ink:        #1a1209;
  --ink-2:      #3a2a18;
  --ink-soft:   #5c4528;
  --gold:       #b8872a;
  --gold-light: #d9b366;
  --ok-bg:      #0d3320;
  --ok:         #2d8c55;
  --err-bg:     #2d0a0a;
  --err:        #8b2222;
  --rule:       rgba(26,18,9,0.18);
  --shadow:     0 1px 0 rgba(26,18,9,0.06), 0 18px 30px -22px rgba(26,18,9,0.35);
}
```

Mapear en `tailwind.config.js` via `extend.colors` para usar `bg-paper`, `text-gold`, etc.

**Tipografías:** Playfair Display (títulos, italic 900) + Libre Baskerville (cuerpo) + DM Mono (labels). Cargar desde Google Fonts en `index.html`.

**Fondo body:** textura `feTurbulence` SVG inline en `background-image` + `radial-gradient` con `background-blend-mode: multiply`. El código exacto está en el prototipo.

**App shell:** `max-width: 430px`, centrado. En desktop (≥720px): body pergamino tostado, `.app` flota con `box-shadow` profunda y `border-radius: 4px`.

---

## Componentes clave

### CompassRose.tsx
- SVG 170×170px: anillo exterior dashed, 8 puntas (N/S `--ink`, E/O `--gold`), ticks, letras N/S/E/O en Playfair Display
- Framer Motion: `animate={{ rotate: 360 }}` con `transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}`
- Punto central: círculo dorado con `box-shadow: 0 0 0 3px var(--paper), 0 0 0 4px var(--ink)`

### FlagStage.tsx
- Fondo `var(--ink)` con `radial-gradient` dorado sutil centrado
- Bandera: Framer Motion `initial={{ scale: 0.6, rotate: -5 }} animate={{ scale: 1, rotate: 0 }}` spring `{ type: 'spring', stiffness: 300, damping: 18 }`
- En modo `lightning`: `<TimerRing>` superpuesto en esquina superior derecha

### TimerRing.tsx
- SVG circular `r=22`, `circumference=138.23`
- Arco vacía de 0→CIRC en 10s con `setInterval` cada 80ms
- `stroke: var(--gold)` → `stroke: var(--err)` cuando `timeLeft ≤ 3`
- Número centrado, también cambia a rojo en danger

### OptionsGrid.tsx
- Modo `country2flag`: grid 2×2, botones grandes con emoji (44px), sin texto
- Resto: lista columna única, flag pequeña (22px) + nombre, letra ABCD como `data-letter` + CSS `::before`
- Estados: default → `.correct` (fondo `--ok-bg`, borde `--ok`) / `.wrong` (fondo `--err-bg`, borde `--err`)
- Framer Motion: `whileTap={{ scale: 0.97 }}`

### FeedbackBanner.tsx
- Framer Motion `initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}`
- Ok: `--ok-bg` / `--ok` — muestra `¡Correcto! +N pts 🔥`
- Error: `--err-bg` / `--err` — muestra `flag + nombre correcto`

---

## Audio engine (audioEngine.ts)

WebAudio API pura, cero ficheros externos:

```typescript
export function playCorrect(): void   // ding suave, 880Hz, 0.15s
export function playWrong(): void     // buzz bajo, 220Hz, 0.2s
export function playStreak(): void    // acorde ascendente cuando streak ≥ 3
export function playTimeout(): void   // tick final, 110Hz
```

---

## PWA (manifest.webmanifest)

```json
{
  "name": "FlagMaster — Atlas de Banderas",
  "short_name": "FlagMaster",
  "theme_color": "#1a1209",
  "background_color": "#f5edd6",
  "display": "standalone",
  "start_url": "/"
}
```

`vite-plugin-pwa` con Workbox `GenerateSW`. Igual que nakama-words.

---

## GitHub Actions deploy

Push a `main` → `npm run build` → deploy a GitHub Pages. Mismo patrón que nakama-words.

---

## Tests (Vitest)

- `questionEngine.ts`: `getPool`, `shuffle`, `makeHint`, `norm`, `pickDistractors`
- `gameStore.ts`: transiciones de estado, puntuación, persistencia
- `countries.ts`: todos los campos presentes, ≥70 países, sin duplicados en `n`

---

## Orden de implementación

1. Scaffold — `npm create vite@latest . -- --template react-ts`, instalar deps
2. `tokens.css` + `tailwind.config.js`
3. `countries.ts` — extraer del prototipo, añadir campo `r`
4. `questionEngine.ts` + tests
5. `gameStore.ts` con Zustand + persist
6. Componentes: `CompassRose`, `FlagStage`, `TimerRing`, `OptionsGrid`, `FeedbackBanner`, `ProgressBar`, `StatCard`
7. `HomeScreen` → `GameScreen` → `ResultScreen`
8. `audioEngine.ts`
9. PWA config
10. GitHub Actions deploy

---

## Lo que NO hacer

- No usar `any` en TypeScript
- No usar `useEffect` para lógica de juego que pertenece al store
- No inventar dependencias fuera del stack definido
- No omitir los tests de `questionEngine`
- No inventar países — extraerlos de `docs/FlagMaster.html`
