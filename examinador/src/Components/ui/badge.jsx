import { cn } from '@/lib/utils'

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700',
        className,
      )}
      {...props}
    />
  )
}
