export interface Country {
  f:  string
  n:  string   // nombre en español
  ne: string   // name in English
  c:  string   // capital
  s:  'easy' | 'medium' | 'hard'
  r:  'europe' | 'americas' | 'asia' | 'africa' | 'oceania'
}

export interface Region {
  id:    string
  name:  string
  nameEn: string
  order: number
  lock:  { region: string; mastery: number } | null
}

export const FM_REGIONS: Region[] = [
  { id: 'europe',   name: 'Europa',   nameEn: 'Europe',   order: 1, lock: null },
  { id: 'americas', name: 'Américas', nameEn: 'Americas', order: 2, lock: { region: 'europe',   mastery: 0.6 } },
  { id: 'asia',     name: 'Asia',     nameEn: 'Asia',     order: 3, lock: { region: 'americas', mastery: 0.6 } },
  { id: 'africa',   name: 'África',   nameEn: 'Africa',   order: 4, lock: { region: 'asia',     mastery: 0.5 } },
  { id: 'oceania',  name: 'Oceanía',  nameEn: 'Oceania',  order: 5, lock: { region: 'africa',   mastery: 0.5 } },
]

export const FM_COUNTRIES: Country[] = [
  // ── EASY (23) ──────────────────────────────────────────────────────────────────────────
  { f:'🇪🇸', n:'España',          ne:'Spain',               c:'Madrid',           s:'easy',   r:'europe'   },
  { f:'🇫🇷', n:'Francia',         ne:'France',              c:'París',            s:'easy',   r:'europe'   },
  { f:'🇩🇪', n:'Alemania',        ne:'Germany',             c:'Berlín',           s:'easy',   r:'europe'   },
  { f:'🇮🇹', n:'Italia',          ne:'Italy',               c:'Roma',             s:'easy',   r:'europe'   },
  { f:'🇵🇹', n:'Portugal',        ne:'Portugal',            c:'Lisboa',           s:'easy',   r:'europe'   },
  { f:'🇬🇧', n:'Reino Unido',     ne:'United Kingdom',      c:'Londres',          s:'easy',   r:'europe'   },
  { f:'🇮🇪', n:'Irlanda',         ne:'Ireland',             c:'Dublín',           s:'easy',   r:'europe'   },
  { f:'🇳🇱', n:'Países Bajos',    ne:'Netherlands',         c:'Ámsterdam',        s:'easy',   r:'europe'   },
  { f:'🇧🇪', n:'Bélgica',         ne:'Belgium',             c:'Bruselas',         s:'easy',   r:'europe'   },
  { f:'🇨🇭', n:'Suiza',           ne:'Switzerland',         c:'Berna',            s:'easy',   r:'europe'   },
  { f:'🇦🇹', n:'Austria',         ne:'Austria',             c:'Viena',            s:'easy',   r:'europe'   },
  { f:'🇸🇪', n:'Suecia',          ne:'Sweden',              c:'Estocolmo',        s:'easy',   r:'europe'   },
  { f:'🇳🇴', n:'Noruega',         ne:'Norway',              c:'Oslo',             s:'easy',   r:'europe'   },
  { f:'🇩🇰', n:'Dinamarca',       ne:'Denmark',             c:'Copenhague',       s:'easy',   r:'europe'   },
  { f:'🇫🇮', n:'Finlandia',       ne:'Finland',             c:'Helsinki',         s:'easy',   r:'europe'   },
  { f:'🇺🇸', n:'Estados Unidos',  ne:'United States',       c:'Washington D.C.',  s:'easy',   r:'americas' },
  { f:'🇨🇦', n:'Canadá',          ne:'Canada',              c:'Ottawa',           s:'easy',   r:'americas' },
  { f:'🇲🇽', n:'México',          ne:'Mexico',              c:'Ciudad de México', s:'easy',   r:'americas' },
  { f:'🇧🇷', n:'Brasil',          ne:'Brazil',              c:'Brasilia',         s:'easy',   r:'americas' },
  { f:'🇦🇷', n:'Argentina',       ne:'Argentina',           c:'Buenos Aires',     s:'easy',   r:'americas' },
  { f:'🇯🇵', n:'Japón',           ne:'Japan',               c:'Tokio',            s:'easy',   r:'asia'     },
  { f:'🇨🇳', n:'China',           ne:'China',               c:'Pekín',            s:'easy',   r:'asia'     },
  { f:'🇦🇺', n:'Australia',       ne:'Australia',           c:'Canberra',         s:'easy',   r:'oceania'  },

  // ── MEDIUM (28) ────────────────────────────────────────────────────────────────────────
  { f:'🇵🇱', n:'Polonia',                 ne:'Poland',              c:'Varsovia',     s:'medium', r:'europe'   },
  { f:'🇨🇿', n:'República Checa',         ne:'Czech Republic',      c:'Praga',        s:'medium', r:'europe'   },
  { f:'🇭🇺', n:'Hungría',                 ne:'Hungary',             c:'Budapest',     s:'medium', r:'europe'   },
  { f:'🇷🇴', n:'Rumanía',                 ne:'Romania',             c:'Bucarest',     s:'medium', r:'europe'   },
  { f:'🇬🇷', n:'Grecia',                  ne:'Greece',              c:'Atenas',       s:'medium', r:'europe'   },
  { f:'🇷🇺', n:'Rusia',                   ne:'Russia',              c:'Moscú',        s:'medium', r:'europe'   },
  { f:'🇺🇦', n:'Ucrania',                 ne:'Ukraine',             c:'Kiev',         s:'medium', r:'europe'   },
  { f:'🇹🇷', n:'Turquía',                 ne:'Turkey',              c:'Ankara',       s:'medium', r:'europe'   },
  { f:'🇮🇳', n:'India',                   ne:'India',               c:'Nueva Delhi',  s:'medium', r:'asia'     },
  { f:'🇰🇷', n:'Corea del Sur',           ne:'South Korea',         c:'Seúl',         s:'medium', r:'asia'     },
  { f:'🇹🇭', n:'Tailandia',               ne:'Thailand',            c:'Bangkok',      s:'medium', r:'asia'     },
  { f:'🇻🇳', n:'Vietnam',                 ne:'Vietnam',             c:'Hanói',        s:'medium', r:'asia'     },
  { f:'🇮🇩', n:'Indonesia',               ne:'Indonesia',           c:'Yakarta',      s:'medium', r:'asia'     },
  { f:'🇵🇭', n:'Filipinas',               ne:'Philippines',         c:'Manila',       s:'medium', r:'asia'     },
  { f:'🇮🇱', n:'Israel',                  ne:'Israel',              c:'Jerusalén',    s:'medium', r:'asia'     },
  { f:'🇸🇦', n:'Arabia Saudita',          ne:'Saudi Arabia',        c:'Riad',         s:'medium', r:'asia'     },
  { f:'🇦🇪', n:'Emiratos Árabes Unidos',  ne:'United Arab Emirates',c:'Abu Dabi',     s:'medium', r:'asia'     },
  { f:'🇪🇬', n:'Egipto',                  ne:'Egypt',               c:'El Cairo',     s:'medium', r:'africa'   },
  { f:'🇿🇦', n:'Sudáfrica',               ne:'South Africa',        c:'Pretoria',     s:'medium', r:'africa'   },
  { f:'🇲🇦', n:'Marruecos',               ne:'Morocco',             c:'Rabat',        s:'medium', r:'africa'   },
  { f:'🇳🇬', n:'Nigeria',                 ne:'Nigeria',             c:'Abuya',        s:'medium', r:'africa'   },
  { f:'🇰🇪', n:'Kenia',                   ne:'Kenya',               c:'Nairobi',      s:'medium', r:'africa'   },
  { f:'🇨🇱', n:'Chile',                   ne:'Chile',               c:'Santiago',     s:'medium', r:'americas' },
  { f:'🇨🇴', n:'Colombia',                ne:'Colombia',            c:'Bogotá',       s:'medium', r:'americas' },
  { f:'🇵🇪', n:'Perú',                    ne:'Peru',                c:'Lima',         s:'medium', r:'americas' },
  { f:'🇻🇪', n:'Venezuela',               ne:'Venezuela',           c:'Caracas',      s:'medium', r:'americas' },
  { f:'🇨🇺', n:'Cuba',                    ne:'Cuba',                c:'La Habana',    s:'medium', r:'americas' },
  { f:'🇳🇿', n:'Nueva Zelanda',           ne:'New Zealand',         c:'Wellington',   s:'medium', r:'oceania'  },

  // ── HARD (35) ──────────────────────────────────────────────────────────────────────────
  { f:'🇷🇸', n:'Serbia',                  ne:'Serbia',              c:'Belgrado',     s:'hard',   r:'europe'   },
  { f:'🇭🇷', n:'Croacia',                 ne:'Croatia',             c:'Zagreb',       s:'hard',   r:'europe'   },
  { f:'🇧🇦', n:'Bosnia y Herzegovina',    ne:'Bosnia and Herzegovina', c:'Sarajevo',  s:'hard',   r:'europe'   },
  { f:'🇸🇮', n:'Eslovenia',               ne:'Slovenia',            c:'Liubliana',    s:'hard',   r:'europe'   },
  { f:'🇲🇰', n:'Macedonia del Norte',     ne:'North Macedonia',     c:'Skopie',       s:'hard',   r:'europe'   },
  { f:'🇲🇪', n:'Montenegro',              ne:'Montenegro',          c:'Podgorica',    s:'hard',   r:'europe'   },
  { f:'🇦🇱', n:'Albania',                 ne:'Albania',             c:'Tirana',       s:'hard',   r:'europe'   },
  { f:'🇧🇬', n:'Bulgaria',                ne:'Bulgaria',            c:'Sofía',        s:'hard',   r:'europe'   },
  { f:'🇸🇰', n:'Eslovaquia',              ne:'Slovakia',            c:'Bratislava',   s:'hard',   r:'europe'   },
  { f:'🇪🇪', n:'Estonia',                 ne:'Estonia',             c:'Tallin',       s:'hard',   r:'europe'   },
  { f:'🇱🇻', n:'Letonia',                 ne:'Latvia',              c:'Riga',         s:'hard',   r:'europe'   },
  { f:'🇱🇹', n:'Lituania',                ne:'Lithuania',           c:'Vilna',        s:'hard',   r:'europe'   },
  { f:'🇧🇾', n:'Bielorrusia',             ne:'Belarus',             c:'Minsk',        s:'hard',   r:'europe'   },
  { f:'🇲🇩', n:'Moldavia',                ne:'Moldova',             c:'Chisináu',     s:'hard',   r:'europe'   },
  { f:'🇬🇪', n:'Georgia',                 ne:'Georgia',             c:'Tiflis',       s:'hard',   r:'europe'   },
  { f:'🇦🇲', n:'Armenia',                 ne:'Armenia',             c:'Ereván',       s:'hard',   r:'europe'   },
  { f:'🇦🇿', n:'Azerbaiyán',              ne:'Azerbaijan',          c:'Bakú',         s:'hard',   r:'asia'     },
  { f:'🇰🇿', n:'Kazajistán',              ne:'Kazakhstan',          c:'Astaná',       s:'hard',   r:'asia'     },
  { f:'🇺🇿', n:'Uzbekistán',              ne:'Uzbekistan',          c:'Taskent',      s:'hard',   r:'asia'     },
  { f:'🇰🇬', n:'Kirguistán',              ne:'Kyrgyzstan',          c:'Biskek',       s:'hard',   r:'asia'     },
  { f:'🇲🇳', n:'Mongolia',                ne:'Mongolia',            c:'Ulán Bator',   s:'hard',   r:'asia'     },
  { f:'🇵🇰', n:'Pakistán',                ne:'Pakistan',            c:'Islamabad',    s:'hard',   r:'asia'     },
  { f:'🇧🇩', n:'Bangladés',               ne:'Bangladesh',          c:'Daca',         s:'hard',   r:'asia'     },
  { f:'🇱🇰', n:'Sri Lanka',               ne:'Sri Lanka',           c:'Colombo',      s:'hard',   r:'asia'     },
  { f:'🇳🇵', n:'Nepal',                   ne:'Nepal',               c:'Katmandú',     s:'hard',   r:'asia'     },
  { f:'🇪🇹', n:'Etiopía',                 ne:'Ethiopia',            c:'Adís Abeba',   s:'hard',   r:'africa'   },
  { f:'🇬🇭', n:'Ghana',                   ne:'Ghana',               c:'Acra',         s:'hard',   r:'africa'   },
  { f:'🇸🇳', n:'Senegal',                 ne:'Senegal',             c:'Dakar',        s:'hard',   r:'africa'   },
  { f:'🇹🇿', n:'Tanzania',                ne:'Tanzania',            c:'Dodoma',       s:'hard',   r:'africa'   },
  { f:'🇺🇬', n:'Uganda',                  ne:'Uganda',              c:'Kampala',      s:'hard',   r:'africa'   },
  { f:'🇦🇴', n:'Angola',                  ne:'Angola',              c:'Luanda',       s:'hard',   r:'africa'   },
  { f:'🇩🇿', n:'Argelia',                 ne:'Algeria',             c:'Argel',        s:'hard',   r:'africa'   },
  { f:'🇹🇳', n:'Túnez',                   ne:'Tunisia',             c:'Túnez',        s:'hard',   r:'africa'   },
  { f:'🇨🇲', n:'Camerún',                 ne:'Cameroon',            c:'Yaundé',       s:'hard',   r:'africa'   },
  { f:'🇨🇮', n:'Costa de Marfil',         ne:'Ivory Coast',         c:'Yamusukro',    s:'hard',   r:'africa'   },
]
