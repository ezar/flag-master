import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, PROFILE_AVATARS, type Profile } from '../store/gameStore'
import { useT } from '../i18n/useT'
import { useDesktop } from '../hooks/useDesktop'

// ── Profile card ───────────────────────────────────────────────────────────
function ProfileCard({ profile, onSelect, onDelete }: {
  profile:  Profile
  onSelect: () => void
  onDelete: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const t = useT()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        border:      '1px solid var(--rule)',
        background:  'var(--surface-hi)',
        padding:     '24px 20px 20px',
        display:     'flex',
        flexDirection:'column',
        alignItems:  'center',
        gap:         10,
        cursor:      'pointer',
        position:    'relative',
        boxShadow:   'var(--shadow)',
        transition:  'border-color .15s, box-shadow .15s',
      }}
      onClick={() => { if (!confirmDelete) onSelect() }}
      whileHover={{ boxShadow: '0 0 0 2px var(--gold)' } as never}
    >
      {/* Delete button */}
      <button
        onClick={e => { e.stopPropagation(); setConfirmDelete(c => !c) }}
        style={{ position:'absolute', top:8, right:10, background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Mono', monospace", fontSize:11, color:'var(--ink-soft)', padding:'2px 4px', lineHeight:1 }}
      >
        ✕
      </button>

      {/* Avatar */}
      <div style={{ fontSize: 52, lineHeight: 1 }}>{profile.avatar}</div>

      {/* Name */}
      <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:20, color:'var(--ink)', textAlign:'center' }}>
        {profile.name}
      </div>

      {/* Stats summary */}
      <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.18em', color:'var(--ink-soft)', textTransform:'uppercase', textAlign:'center' }}>
        {profile.totalGames > 0
          ? `${profile.totalGames} ${t('home.games').toLowerCase()} · 🔥${profile.dailyStreak}`
          : t('profile.noGames')
        }
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ width:'100%', overflow:'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onDelete}
              style={{ display:'block', width:'100%', marginTop:4, background:'var(--err-bg)', color:'var(--err)', border:'1px solid var(--err)', padding:'8px 6px', cursor:'pointer', fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase' }}
            >
              {t('profile.deleteConfirm')}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ display:'block', width:'100%', marginTop:4, background:'transparent', color:'var(--ink-soft)', border:'1px solid var(--rule)', padding:'7px 6px', cursor:'pointer', fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase' }}
            >
              {t('settings.reset.cancel')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Create form ────────────────────────────────────────────────────────────
function CreateProfileForm({ onCancel }: { onCancel?: () => void }) {
  const { createProfile } = useGameStore()
  const t = useT()
  const [name,   setName]   = useState('')
  const [avatar, setAvatar] = useState(PROFILE_AVATARS[0])

  function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    createProfile(trimmed, avatar)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display:'flex', flexDirection:'column', gap:20 }}
    >
      <h2 style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontWeight:700, fontSize:24, color:'var(--ink)', textAlign:'center' }}>
        {t('profile.create')}
      </h2>

      {/* Avatar picker */}
      <div>
        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.24em', color:'var(--ink-soft)', textTransform:'uppercase', marginBottom:10, textAlign:'center' }}>
          {t('profile.avatar')}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:8 }}>
          {PROFILE_AVATARS.map(em => (
            <button
              key={em}
              onClick={() => setAvatar(em)}
              style={{
                fontSize:    30,
                lineHeight:  1,
                padding:     '10px 4px',
                border:      avatar === em ? '2px solid var(--gold)' : '1px solid var(--rule)',
                background:  avatar === em ? 'rgba(184,135,42,0.12)' : 'var(--surface)',
                cursor:      'pointer',
                borderRadius:2,
                transition:  'all .12s',
              }}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      {/* Name input */}
      <div>
        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.24em', color:'var(--ink-soft)', textTransform:'uppercase', marginBottom:8 }}>
          {t('profile.name')}
        </div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
          placeholder={t('profile.namePlaceholder')}
          autoFocus
          maxLength={20}
          style={{
            width:        '100%',
            background:   'var(--surface-input)',
            border:       '1px solid var(--rule)',
            borderBottom: '2px solid var(--gold)',
            padding:      '12px 14px',
            fontFamily:   "'Playfair Display', serif",
            fontWeight:   700,
            fontSize:     20,
            color:        'var(--ink)',
            outline:      'none',
          }}
        />
      </div>

      {/* Buttons */}
      <div style={{ display:'grid', gridTemplateColumns: onCancel ? '1fr 1fr' : '1fr', gap:10 }}>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{ padding:'14px', border:'1px solid var(--rule)', background:'transparent', color:'var(--ink-soft)', fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.24em', textTransform:'uppercase', cursor:'pointer' }}
          >
            {t('settings.reset.cancel')}
          </button>
        )}
        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          style={{ padding:'14px', background: name.trim() ? 'var(--chrome-bg)' : 'var(--rule)', color: name.trim() ? 'var(--gold)' : 'var(--ink-soft)', border:'none', fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase', cursor: name.trim() ? 'pointer' : 'default', transition:'all .15s' }}
        >
          {t('profile.create')} →
        </button>
      </div>
    </motion.div>
  )
}

// ── Main screen ────────────────────────────────────────────────────────────
export function ProfileScreen() {
  const { profiles, selectProfile, deleteProfile } = useGameStore()
  const t         = useT()
  const isDesktop = useDesktop()
  const [creating, setCreating] = useState(false)

  const showCreate = profiles.length === 0 || creating

  return (
    <div style={{
      minHeight:      '100dvh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        isDesktop ? '40px 32px' : '32px 20px',
      background:     'var(--paper)',
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.10 0 0 0 0 0.07 0 0 0 0 0.04 0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"), radial-gradient(140% 90% at 20% 0%, var(--paper) 0%, var(--paper) 38%, var(--paper-2) 100%)`,
      backgroundBlendMode: 'multiply, normal',
    }}>
      <div style={{ width:'100%', maxWidth: isDesktop ? 860 : 500 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🧭</div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', fontWeight:900, fontSize: isDesktop ? 40 : 32, color:'var(--ink)', margin:'0 0 6px' }}>
            Flag<span style={{ color:'var(--gold)', fontWeight:400 }}>·</span>Master
          </h1>
          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:'0.32em', color:'var(--ink-soft)', textTransform:'uppercase' }}>
            {showCreate ? t('profile.create') : t('profile.select')}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showCreate ? (
            <motion.div key="create" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <CreateProfileForm onCancel={profiles.length > 0 ? () => setCreating(false) : undefined} />
            </motion.div>
          ) : (
            <motion.div key="select" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              {/* Profile grid */}
              <div style={{ display:'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap:14 }}>
                {profiles.map(profile => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onSelect={() => selectProfile(profile.id)}
                    onDelete={() => deleteProfile(profile.id)}
                  />
                ))}

                {/* Add new profile card */}
                <motion.button
                  whileHover={{ borderColor: 'var(--gold)' } as never}
                  onClick={() => setCreating(true)}
                  style={{
                    border:      '1px dashed var(--rule)',
                    background:  'transparent',
                    padding:     '24px 20px',
                    cursor:      'pointer',
                    display:     'flex',
                    flexDirection:'column',
                    alignItems:  'center',
                    gap:         10,
                    color:       'var(--ink-soft)',
                    transition:  'border-color .15s',
                  }}
                >
                  <div style={{ fontSize:36, lineHeight:1, opacity:0.5 }}>+</div>
                  <div style={{ fontFamily:"'DM Mono', monospace", fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase' }}>
                    {t('profile.add')}
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div style={{ marginTop:32, textAlign:'center', fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:'0.28em', color:'var(--ink-soft)', textTransform:'uppercase', opacity:0.6 }}>
          ✦ Septentrionem · Meridiem · Orientem · Occidentem ✦
        </div>
      </div>
    </div>
  )
}
