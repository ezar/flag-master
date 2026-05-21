# FlagMaster — Atlas de Banderas

> Un juego educativo de banderas del mundo para aprender en familia. Mobile-first, PWA, sin servidor.

**[▶ Jugar](https://ezar.github.io/flag-master/)**

---

## Modos de juego

| # | Modo | Descripción |
|---|------|-------------|
| I | ¿Qué país? | Ves la bandera, eliges el nombre |
| II | ¿Qué bandera? | Ves el nombre, eliges la bandera |
| III | Pistas | Bandera con letras enmascaradas |
| IV | Capitales | Identifica la capital correcta |
| V | Escríbelo | Sin opciones — solo tu memoria |
| VI | Relámpago | 10 segundos por bandera |
| VII | Monedas | Identifica la moneda del país |
| VIII | Idiomas | Identifica el idioma oficial |
| ∞ | Maratón | 3 vidas — ¿hasta dónde llegas? |
| — | Modo Estudio | Flash cards — lo sé / no lo sé |

## Características

- **147 países** con bandera, capital, moneda e idioma
- **3 niveles**: Fácil (Europa/Américas principales) · Medio · Experto (global)
- **Desafío Diario** — una bandera al día, 6 intentos, grid tipo Wordle
- **Perfiles** — múltiples usuarios con progreso independiente
- **Logros** — 10 medallas desbloqueables
- **Aprendizaje adaptativo** — los países con peor tasa de acierto aparecen más
- **Estadísticas** por región y dificultad
- **Revista** — navega las 147 banderas con datos curiosos
- **PWA** — instalable, funciona offline
- **Dark mode** · Audio · Notificaciones · Bilingüe ES/EN

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite 5 |
| State | Zustand 5 + persist |
| Animaciones | Framer Motion 11 |
| PWA | vite-plugin-pwa + Workbox |
| Tests | Vitest 2 — 57 tests |
| Deploy | GitHub Actions → GitHub Pages |

## Desarrollo local

```bash
npm install
npm run dev       # http://localhost:5173
npm run test      # Vitest (57 tests)
npm run build     # Build de producción
```

## Despliegue

Push a `main` → GitHub Actions construye y despliega en GitHub Pages automáticamente.

## Estructura

```
src/
├── audio/          # WebAudio API (sin ficheros externos)
├── components/     # FlagStage, OptionsGrid, FeedbackBanner, TimerRing…
├── data/           # countries.ts (147 países), achievements.ts
├── engine/         # questionEngine — pool, shuffle, hint, adaptive
├── hooks/          # useDesktop, useT
├── i18n/           # Traducciones ES/EN
├── screens/        # Home, Game, Result, Stats, Daily, Study, Profiles…
├── store/          # gameStore (Zustand)
└── styles/         # tokens.css — paleta atlas + dark mode
```

---

Diseño: estética de atlas náutico · paleta pergamino · tipografías Playfair Display + Libre Baskerville + DM Mono
