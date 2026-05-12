/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper:     'var(--paper)',
        'paper-2': 'var(--paper-2)',
        'paper-3': 'var(--paper-3)',
        ink:       'var(--ink)',
        'ink-2':   'var(--ink-2)',
        'ink-soft':'var(--ink-soft)',
        gold:      'var(--gold)',
        'gold-light': 'var(--gold-light)',
        'ok-bg':   'var(--ok-bg)',
        ok:        'var(--ok)',
        'err-bg':  'var(--err-bg)',
        err:       'var(--err)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"Libre Baskerville"', 'serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
