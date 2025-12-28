import { cn } from '@/lib/utils'

export function Button({ className, variant = 'default', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none'

  const variants = {
    default: 'text-white bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800',
    outline: 'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50',
    ghost: 'bg-transparent text-zinc-900 hover:bg-zinc-100',
  }

  return <button className={cn(base, variants[variant], className)} {...props} />
}
