'use client'

const PATH = 'M44.444,94.164l42.268,42.317,58.87-54.823-32.514,88.243h71.651V25.491L44.444,94.164Z'
const VB = '0 0 229.163 195.391'

export function FPLogo({ variant = 'light', size = 'md' }: { variant?: 'light' | 'dark'; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 18 : size === 'lg' ? 28 : 22
  const h = Math.round(s * 195.391 / 229.163)
  const textColor = variant === 'light' ? '#fff8e6' : '#0f2e4a'
  const accentColor = variant === 'light' ? '#6486ac' : '#6486ac'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={s} height={h} viewBox={VB}><path fill="#64ade0" d={PATH}/></svg>
      <span style={{ fontSize: size === 'lg' ? 16 : size === 'sm' ? 12 : 13, fontWeight: 500, color: textColor, letterSpacing: 0.4, fontFamily: 'DM Sans, sans-serif' }}>
        FIRST <span style={{ color: accentColor }}>PRINCIPLES</span>
      </span>
    </div>
  )
}

export function FPMark({ size = 16, fill = '#64ade0' }: { size?: number; fill?: string }) {
  const h = Math.round(size * 195.391 / 229.163)
  return <svg width={size} height={h} viewBox={VB}><path fill={fill} d={PATH}/></svg>
}
