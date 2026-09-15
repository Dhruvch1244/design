import { useState, type ButtonHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy } from '@phosphor-icons/react'

const spring = { type: 'spring', stiffness: 400, damping: 28 } as const

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.75rem] bg-glass p-1.5 ring-1 ring-glass-strong ${className}`}>
      <div className="h-full rounded-[calc(1.75rem-0.375rem)] border border-rule-soft bg-surface">
        {children}
      </div>
    </div>
  )
}

export function Button({
  variant = 'default',
  className = '',
  children,
  disabled,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' | 'ghost' }) {
  const base =
    'relative inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium tracking-tight transition-colors disabled:opacity-35 disabled:cursor-not-allowed'
  const variants: Record<string, string> = {
    default: 'bg-glass text-ink ring-1 ring-glass-strong hover:ring-glass-strong hover:bg-glass-strong',
    primary: 'bg-cyan text-void shadow-[0_0_0_1px_rgba(47,230,242,0.4),0_8px_24px_-6px_rgba(47,230,242,0.55)] hover:brightness-110',
    ghost: 'text-ink-soft hover:text-ink hover:bg-glass',
  }
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={spring}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  )
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      spellCheck={false}
      className="w-full flex-1 resize-none rounded-2xl border border-rule bg-panel p-4 font-mono text-[13px] leading-relaxed text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] outline-none transition-shadow focus:border-cyan/50 focus:shadow-[0_0_0_3px_rgba(47,230,242,0.12)]"
      {...props}
    />
  )
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
      disabled={!text}
    >
      <motion.span
        key={copied ? 'check' : 'copy'}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        className="inline-flex items-center gap-1.5"
      >
        {copied ? <Check size={14} weight="bold" className="text-emerald" /> : <Copy size={14} weight="light" />}
        {copied ? 'Copied' : label}
      </motion.span>
    </Button>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="rounded-2xl border border-rose/25 bg-rose/[0.08] px-3.5 py-2.5 text-sm text-rose"
    >
      {message}
    </motion.div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
      {children}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-xs text-ink-soft">
      <span
        onClick={() => onChange(!checked)}
        className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${checked ? 'bg-cyan' : 'bg-white/10'}`}
      >
        <motion.span
          layout
          transition={spring}
          className="absolute top-0.5 h-3 w-3 rounded-full bg-void shadow"
          style={{ left: checked ? '14px' : '2px' }}
        />
      </span>
      {label}
    </label>
  )
}
