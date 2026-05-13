export interface Country {
  f: string
  n: string
  c: string
  s: 'easy' | 'medium' | 'hard'
  r: 'europe' | 'americas' | 'asia' | 'africa' | 'oceania'
}

export interface Region {
  id:    string
  name:  string
  order: number
  lock:  { region: string; mastery: number } | null
}

export const FM_REGIONS: Region[] = [
  { id: 'europe',   name: 'Europa',   order: 1, lock: null },
  { id: 'americas', name: 'Américas', order: 2, lock: { region: 'europe',   mastery: 0.6 } },
  { id: 'asia',     name: 'Asia',     order: 3, lock: { region: 'americas', mastery: 0.6 } },
  { id: 'africa',   name: 'África',   order: 4, lock: { region: 'asia',     mastery: 0.5 } },
  { id: 'oceania',  name: 'Oceanía',  order: 5, lock: { region: 'africa',   mastery: 0.5 } },
]

export const FM_COUNTRIES: Country[] = [
  // ── EASY (23) ──────────────────────────────────────────────────────
  { f: '🇪🇸', n: 'España',          c: 'Madrid',            s: 'easy',   r: 'europe'   },
  { f: '🇫🇷', n: 'Francia',         c: 'París',             s: 'easy',   r: 'europe'   },
  { f: '🇩🇪', n: 'Alemania',        c: 'Berlín',            s: 'easy',   r: 'europe'   },
  { f: '🇮🇹', n: 'Italia',          c: 'Roma',              s: 'easy',   r: 'europe'   },
  { f: '🇵🇹', n: 'Portugal',        c: 'Lisboa',            s: 'easy',   r: 'europe'   },
  { f: '🇬🇧', n: 'Reino Unido',     c: 'Londres',           s: 'easy',   r: 'europe'   },
  { f: '🇮🇪', n: 'Irlanda',         c: 'Dublín',            s: 'easy',   r: 'europe'   },
  { f: '🇳🇱', n: 'Países Bajos',    c: 'Ámsterdam',         s: 'easy',   r: 'europe'   },
  { f: '🇧🇪', n: 'Bélgica',         c: 'Bruselas',          s: 'easy',   r: 'europe'   },
  { f: '🇨🇭', n: 'Suiza',           c: 'Berna',             s: 'easy',   r: 'europe'   },
  { f: '🇦🇹', n: 'Austria',         c: 'Viena',             s: 'easy',   r: 'europe'   },
  { f: '🇸🇪', n: 'Suecia',          c: 'Estocolmo',         s: 'easy',   r: 'europe'   },
  { f: '🇳🇴', n: 'Noruega',         c: 'Oslo',              s: 'easy',   r: 'europe'   },
  { f: '🇩🇰', n: 'Dinamarca',       c: 'Copenhague',        s: 'easy',   r: 'europe'   },
  { f: '🇫🇮', n: 'Finlandia',       c: 'Helsinki',          s: 'easy',   r: 'europe'   },
  { f: '🇺🇸', n: 'Estados Unidos',  c: 'Washington D.C.',   s: 'easy',   r: 'americas' },
  { f: '🇨🇦', n: 'Canadá',          c: 'Ottawa',            s: 'easy',   r: 'americas' },
  { f: '🇲🇽', n: 'México',          c: 'Ciudad de México',  s: 'easy',   r: 'americas' },
  { f: '🇧🇷', n: 'Brasil',          c: 'Brasilia',          s: 'easy',   r: 'americas' },
  { f: '🇦🇷', n: 'Argentina',       c: 'Buenos Aires',      s: 'easy',   r: 'americas' },
  { f: '🇯🇵', n: 'Japón',           c: 'Tokio',             s: 'easy',   r: 'asia'     },
  { f: '🇨🇳', n: 'China',           c: 'Pekín',             s: 'easy',   r: 'asia'     },
  { f: '🇦🇺', n: 'Australia',       c: 'Canberra',          s: 'easy',   r: 'oceania'  },

  // ── MEDIUM (28) ────────────────────────────────────────────────────
  { f: '🇵🇱', n: 'Polonia',                c: 'Varsovia',    s: 'medium', r: 'europe'   },
  { f: '🇨🇿', n: 'República Checa',        c: 'Praga',       s: 'medium', r: 'europe'   },
  { f: '🇭🇺', n: 'Hungría',                c: 'Budapest',    s: 'medium', r: 'europe'   },
  { f: '🇷🇴', n: 'Rumanía',                c: 'Bucarest',    s: 'medium', r: 'europe'   },
  { f: '🇬🇷', n: 'Grecia',                 c: 'Atenas',      s: 'medium', r: 'europe'   },
  { f: '🇷🇺', n: 'Rusia',                  c: 'Moscú',       s: 'medium', r: 'europe'   },
  { f: '🇺🇦', n: 'Ucrania',                c: 'Kiev',        s: 'medium', r: 'europe'   },
  { f: '🇹🇷', n: 'Turquía',                c: 'Ankara',      s: 'medium', r: 'europe'   },
  { f: '🇮🇳', n: 'India',                  c: 'Nueva Delhi', s: 'medium', r: 'asia'     },
  { f: '🇰🇷', n: 'Corea del Sur',          c: 'Seúl',        s: 'medium', r: 'asia'     },
  { f: '🇹🇭', n: 'Tailandia',              c: 'Bangkok',     s: 'medium', r: 'asia'     },
  { f: '🇻🇳', n: 'Vietnam',                c: 'Hanói',       s: 'medium', r: 'asia'     },
  { f: '🇮🇩', n: 'Indonesia',              c: 'Yakarta',     s: 'medium', r: 'asia'     },
  { f: '🇵🇭', n: 'Filipinas',              c: 'Manila',      s: 'medium', r: 'asia'     },
  { f: '🇮🇱', n: 'Israel',                 c: 'Jerusalén',   s: 'medium', r: 'asia'     },
  { f: '🇸🇦', n: 'Arabia Saudita',         c: 'Riad',        s: 'medium', r: 'asia'     },
  { f: '🇦🇪', n: 'Emiratos Árabes Unidos', c: 'Abu Dabi',    s: 'medium', r: 'asia'     },
  { f: '🇪🇬', n: 'Egipto',                 c: 'El Cairo',    s: 'medium', r: 'africa'   },
  { f: '🇿🇦', n: 'Sudáfrica',              c: 'Pretoria',    s: 'medium', r: 'africa'   },
  { f: '🇲🇦', n: 'Marruecos',              c: 'Rabat',       s: 'medium', r: 'africa'   },
  { f: '🇳🇬', n: 'Nigeria',                c: 'Abuya',       s: 'medium', r: 'africa'   },
  { f: '🇰🇪', n: 'Kenia',                  c: 'Nairobi',     s: 'medium', r: 'africa'   },
  { f: '🇨🇱', n: 'Chile',                  c: 'Santiago',    s: 'medium', r: 'americas' },
  { f: '🇨🇴', n: 'Colombia',               c: 'Bogotá',      s: 'medium', r: 'americas' },
  { f: '🇵🇪', n: 'Perú',                   c: 'Lima',        s: 'medium', r: 'americas' },
  { f: '🇻🇪', n: 'Venezuela',              c: 'Caracas',     s: 'medium', r: 'americas' },
  { f: '🇨🇺', n: 'Cuba',                   c: 'La Habana',   s: 'medium', r: 'americas' },
  { f: '🇳🇿', n: 'Nueva Zelanda',          c: 'Wellington',  s: 'medium', r: 'oceania'  },

  // ── HARD (35) ──────────────────────────────────────────────────────
  { f: '🇷🇸', n: 'Serbia',               c: 'Belgrado',   s: 'hard',   r: 'europe'   },
  { f: '🇭🇷', n: 'Croacia',              c: 'Zagreb',     s: 'hard',   r: 'europe'   },
  { f: '🇧🇦', n: 'Bosnia y Herzegovina', c: 'Sarajevo',   s: 'hard',   r: 'europe'   },
  { f: '🇸🇮', n: 'Eslovenia',            c: 'Liubliana',  s: 'hard',   r: 'europe'   },
  { f: '🇲🇰', n: 'Macedonia del Norte',  c: 'Skopie',     s: 'hard',   r: 'europe'   },
  { f: '🇲🇪', n: 'Montenegro',           c: 'Podgorica',  s: 'hard',   r: 'europe'   },
  { f: '🇦🇱', n: 'Albania',              c: 'Tirana',     s: 'hard',   r: 'europe'   },
  { f: '🇧🇬', n: 'Bulgaria',             c: 'Sofía',      s: 'hard',   r: 'europe'   },
  { f: '🇸🇰', n: 'Eslovaquia',           c: 'Bratislava', s: 'hard',   r: 'europe'   },
  { f: '🇪🇪', n: 'Estonia',              c: 'Tallin',     s: 'hard',   r: 'europe'   },
  { f: '🇱🇻', n: 'Letonia',              c: 'Riga',       s: 'hard',   r: 'europe'   },
  { f: '🇱🇹', n: 'Lituania',             c: 'Vilna',      s: 'hard',   r: 'europe'   },
  { f: '🇧🇾', n: 'Bielorrusia',          c: 'Minsk',      s: 'hard',   r: 'europe'   },
  { f: '🇲🇩', n: 'Moldavia',             c: 'Chisináu',   s: 'hard',   r: 'europe'   },
  { f: '🇬🇪', n: 'Georgia',              c: 'Tiflis',     s: 'hard',   r: 'europe'   },
  { f: '🇦🇲', n: 'Armenia',              c: 'Ereván',     s: 'hard',   r: 'europe'   },
  { f: '🇦🇿', n: 'Azerbaiyán',           c: 'Bakú',       s: 'hard',   r: 'asia'     },
  { f: '🇰🇿', n: 'Kazajistán',           c: 'Astaná',     s: 'hard',   r: 'asia'     },
  { f: '🇺🇿', n: 'Uzbekistán',           c: 'Taskent',    s: 'hard',   r: 'asia'     },
  { f: '🇰🇬', n: 'Kirguistán',           c: 'Biskek',     s: 'hard',   r: 'asia'     },
  { f: '🇲🇳', n: 'Mongolia',             c: 'Ulán Bator', s: 'hard',   r: 'asia'     },
  { f: '🇵🇰', n: 'Pakistán',             c: 'Islamabad',  s: 'hard',   r: 'asia'     },
  { f: '🇧🇩', n: 'Bangladés',            c: 'Daca',       s: 'hard',   r: 'asia'     },
  { f: '🇱🇰', n: 'Sri Lanka',            c: 'Colombo',    s: 'hard',   r: 'asia'     },
  { f: '🇳🇵', n: 'Nepal',                c: 'Katmandú',   s: 'hard',   r: 'asia'     },
  { f: '🇪🇹', n: 'Etiopía',              c: 'Adís Abeba', s: 'hard',   r: 'africa'   },
  { f: '🇬🇭', n: 'Ghana',                c: 'Acra',       s: 'hard',   r: 'africa'   },
  { f: '🇸🇳', n: 'Senegal',              c: 'Dakar',      s: 'hard',   r: 'africa'   },
  { f: '🇹🇿', n: 'Tanzania',             c: 'Dodoma',     s: 'hard',   r: 'africa'   },
  { f: '🇺🇬', n: 'Uganda',               c: 'Kampala',    s: 'hard',   r: 'africa'   },
  { f: '🇦🇴', n: 'Angola',               c: 'Luanda',     s: 'hard',   r: 'africa'   },
  { f: '🇩🇿', n: 'Argelia',              c: 'Argel',      s: 'hard',   r: 'africa'   },
  { f: '🇹🇳', n: 'Túnez',               c: 'Túnez',      s: 'hard',   r: 'africa'   },
  { f: '🇨🇲', n: 'Camerún',              c: 'Yaundé',     s: 'hard',   r: 'africa'   },
  { f: '🇨🇮', n: 'Costa de Marfil',      c: 'Yamusukro',  s: 'hard',   r: 'africa'   },
]
