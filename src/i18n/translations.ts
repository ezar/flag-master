export type Lang = 'es' | 'en'

export const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  es: {
    // ── App ──────────────────────────────────────────────────────
    'app.eyebrow':   'Compendium · MMXXVI',
    'app.subtitle':  'Un atlas ilustrado para jóvenes exploradores',

    // ── Home ─────────────────────────────────────────────────────
    'home.logbook':  'Bitácora del navegante',
    'home.bestStreak':  'Mejor\nRacha',
    'home.games':    'Partidas',
    'home.correct':  'Aciertos',
    'home.accuracy': 'Precisión',
    'home.difficulty':   'Dificultad',
    'home.countries':    '{{n}} países',
    'home.modes':        'Modos de juego',
    'home.chooseOne':    'Elige uno',
    'home.sail':     'Zarpar →',
    'home.footer':   '✦ Septentrionem · Meridiem · Orientem · Occidentem ✦',

    // Difficulties
    'diff.easy.name':  'Fácil',
    'diff.easy.sub':   'Iniciado',
    'diff.medium.name':'Medio',
    'diff.medium.sub': 'Navegante',
    'diff.hard.name':  'Experto',
    'diff.hard.sub':   'Cartógrafo',

    // Game modes
    'mode.flag2country.title': '🏳️ ¿Qué país?',
    'mode.flag2country.desc':  'Ves la bandera, eliges el nombre',
    'mode.country2flag.title': '🔍 ¿Qué bandera?',
    'mode.country2flag.desc':  'Ves el nombre, eliges la bandera',
    'mode.hint.title':         '🔤 Pistas',
    'mode.hint.desc':          'Letras ocultas — descifra el nombre',
    'mode.capital.title':      '🏛️ Capitales',
    'mode.capital.desc':       'Identifica la capital correcta',
    'mode.type.title':         '✍️ Escríbelo',
    'mode.type.desc':          'Sin opciones — solo tu memoria',
    'mode.lightning.title':    '⚡ Relámpago',
    'mode.lightning.desc':     '10 segundos por bandera',

    // ── Game screen ──────────────────────────────────────────────
    'game.back':         '‹ Menú',
    'game.points':       'Puntos',
    'game.streak':       'Racha',
    'game.question':     'Pregunta',
    'game.questionOf':   'Pregunta {{n}} de {{total}}',
    'game.lightning.suffix': '· ⚡ Reloj de arena',
    'game.type.suffix':      '· Sin opciones',
    'game.capital.prompt':   '¿Cuál es su capital?',
    'game.type.placeholder': 'Nombre del país…',
    'game.type.submit':      'Confirmar',
    'game.type.correct':     '✓ ¡Correcto! {{name}}',
    'game.type.wrong':       '✗ Era {{name}}',
    'game.type.wrongTyped':  '✗ Era {{name}} · escribiste "{{typed}}"',
    'game.next':         'Siguiente ›',

    // Mode HUD labels
    'mode.label.flag2country': 'I · ¿Qué país?',
    'mode.label.country2flag': 'II · ¿Qué bandera?',
    'mode.label.hint':         'III · Pistas',
    'mode.label.capital':      'IV · Capitales',
    'mode.label.type':         'V · Escríbelo',
    'mode.label.lightning':    'VI · Relámpago',

    // ── Feedback ─────────────────────────────────────────────────
    'feedback.correct':  '¡Correcto!',
    'feedback.wrong':    '✗ Era:',

    // ── Results ──────────────────────────────────────────────────
    'result.points':     'Puntos',
    'result.correct':    'Aciertos',
    'result.streak':     'Mejor Racha',
    'result.review':     '✦ Banderas para repasar',
    'result.capital':    'Capital:',
    'result.menu':       'Menú',
    'result.again':      'Repetir',

    // Tiers
    'tier.perfect.title':   'Perfecto',
    'tier.perfect.sub':     'Has dominado los siete mares.',
    'tier.great.title':     'Magnífico',
    'tier.great.sub':       'Tu brújula apenas vacila.',
    'tier.good.title':      'Buen viaje',
    'tier.good.sub':        'Buen rumbo, capitán.',
    'tier.ok.title':        'Travesía',
    'tier.ok.sub':          'Aún quedan costas por descubrir.',
    'tier.poor.title':      'Encallado',
    'tier.poor.sub':        'Endereza el timón y vuelve a zarpar.',
    'tier.bad.title':       'Naufragio',
    'tier.bad.sub':         'Vuelve a embarcar y traza una nueva ruta.',

    // ── Settings ─────────────────────────────────────────────────
    'settings.title':        'Ajustes',
    'settings.close':        'Cerrar ✕',
    'settings.audio':        'Sonido',
    'settings.audio.desc':   'Efectos de audio en partida',
    'settings.language':     'Idioma',
    'settings.difficulty':   'Dificultad por defecto',
    'settings.reset':        'Reiniciar progreso',
    'settings.reset.desc':   'Borra estadísticas, racha y maestría de banderas. No se puede deshacer.',
    'settings.reset.btn':    'Reiniciar progreso',
    'settings.reset.confirm':'⚠ Confirmar reinicio',
    'settings.reset.cancel': 'Cancelar',
    'settings.footer':       'FlagMaster · Atlas de Banderas · Sprint I · MMXXVI',

    // ── World Map ─────────────────────────────────────────────────
    'map.title':      'Atlas del explorador',
    'map.subtitle':   'Conquista el mundo',
    'map.countries':  '{{n}} países',
    'map.mastered':   '{{m}}/{{t}} dominados',
    'map.cleared':    '✦ Expedición completa',
    'map.locked':     '🔒 {{req}} {{pct}}%',
    'map.legend.available':   'Disponible',
    'map.legend.progress':    'En progreso',
    'map.legend.mastered':    'Dominado',
    'map.legend.locked':      'Bloqueado',
  },

  en: {
    // ── App ──────────────────────────────────────────────────────
    'app.eyebrow':   'Compendium · MMXXVI',
    'app.subtitle':  'An illustrated atlas for young explorers',

    // ── Home ─────────────────────────────────────────────────────
    'home.logbook':  "Navigator's Log",
    'home.bestStreak':  'Best\nStreak',
    'home.games':    'Games',
    'home.correct':  'Correct',
    'home.accuracy': 'Accuracy',
    'home.difficulty':   'Difficulty',
    'home.countries':    '{{n}} countries',
    'home.modes':        'Game Modes',
    'home.chooseOne':    'Choose one',
    'home.sail':     'Set Sail →',
    'home.footer':   '✦ Septentrionem · Meridiem · Orientem · Occidentem ✦',

    // Difficulties
    'diff.easy.name':  'Easy',
    'diff.easy.sub':   'Beginner',
    'diff.medium.name':'Medium',
    'diff.medium.sub': 'Navigator',
    'diff.hard.name':  'Expert',
    'diff.hard.sub':   'Cartographer',

    // Game modes
    'mode.flag2country.title': '🏳️ Which country?',
    'mode.flag2country.desc':  'See the flag, choose the country name',
    'mode.country2flag.title': '🔍 Which flag?',
    'mode.country2flag.desc':  'See the name, choose the flag',
    'mode.hint.title':         '🔤 Hints',
    'mode.hint.desc':          'Hidden letters — decipher the name',
    'mode.capital.title':      '🏛️ Capitals',
    'mode.capital.desc':       'Identify the correct capital city',
    'mode.type.title':         '✍️ Type It',
    'mode.type.desc':          'No options — just your memory',
    'mode.lightning.title':    '⚡ Lightning',
    'mode.lightning.desc':     '10 seconds per flag',

    // ── Game screen ──────────────────────────────────────────────
    'game.back':         '‹ Menu',
    'game.points':       'Points',
    'game.streak':       'Streak',
    'game.question':     'Question',
    'game.questionOf':   'Question {{n}} of {{total}}',
    'game.lightning.suffix': '· ⚡ Time pressure',
    'game.type.suffix':      '· No hints',
    'game.capital.prompt':   'What is its capital?',
    'game.type.placeholder': 'Country name…',
    'game.type.submit':      'Confirm',
    'game.type.correct':     '✓ Correct! {{name}}',
    'game.type.wrong':       '✗ It was {{name}}',
    'game.type.wrongTyped':  '✗ It was {{name}} · you typed "{{typed}}"',
    'game.next':         'Next ›',

    // Mode HUD labels
    'mode.label.flag2country': 'I · Which country?',
    'mode.label.country2flag': 'II · Which flag?',
    'mode.label.hint':         'III · Hints',
    'mode.label.capital':      'IV · Capitals',
    'mode.label.type':         'V · Type It',
    'mode.label.lightning':    'VI · Lightning',

    // ── Feedback ─────────────────────────────────────────────────
    'feedback.correct':  'Correct!',
    'feedback.wrong':    '✗ It was:',

    // ── Results ──────────────────────────────────────────────────
    'result.points':     'Points',
    'result.correct':    'Correct',
    'result.streak':     'Best Streak',
    'result.review':     '✦ Flags to review',
    'result.capital':    'Capital:',
    'result.menu':       'Menu',
    'result.again':      'Play again',

    // Tiers
    'tier.perfect.title':   'Perfect',
    'tier.perfect.sub':     'You have mastered the seven seas.',
    'tier.great.title':     'Magnificent',
    'tier.great.sub':       'Your compass barely wavers.',
    'tier.good.title':      'Smooth sailing',
    'tier.good.sub':        'Good heading, captain.',
    'tier.ok.title':        'Voyage',
    'tier.ok.sub':          'There are still shores to discover.',
    'tier.poor.title':      'Aground',
    'tier.poor.sub':        'Correct your course and set sail again.',
    'tier.bad.title':       'Shipwreck',
    'tier.bad.sub':         'Embark again and chart a new route.',

    // ── Settings ─────────────────────────────────────────────────
    'settings.title':        'Settings',
    'settings.close':        'Close ✕',
    'settings.audio':        'Sound',
    'settings.audio.desc':   'Audio effects during gameplay',
    'settings.language':     'Language',
    'settings.difficulty':   'Default difficulty',
    'settings.reset':        'Reset progress',
    'settings.reset.desc':   'Clears stats, streak and flag mastery. Cannot be undone.',
    'settings.reset.btn':    'Reset progress',
    'settings.reset.confirm':'⚠ Confirm reset',
    'settings.reset.cancel': 'Cancel',
    'settings.footer':       'FlagMaster · Atlas of Flags · Sprint I · MMXXVI',

    // ── World Map ─────────────────────────────────────────────────
    'map.title':      "Explorer's Atlas",
    'map.subtitle':   'Conquer the world',
    'map.countries':  '{{n}} countries',
    'map.mastered':   '{{m}}/{{t}} mastered',
    'map.cleared':    '✦ Expedition complete',
    'map.locked':     '🔒 {{req}} {{pct}}%',
    'map.legend.available':   'Available',
    'map.legend.progress':    'In progress',
    'map.legend.mastered':    'Mastered',
    'map.legend.locked':      'Locked',
  },
}

/** Translate a key with optional {{param}} substitution */
export function tr(
  lang: Lang,
  key: string,
  params?: Record<string, string | number>,
): string {
  let str = TRANSLATIONS[lang][key] ?? TRANSLATIONS['es'][key] ?? key
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
    })
  }
  return str
}
