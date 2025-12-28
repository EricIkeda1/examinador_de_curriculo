import { motion } from 'framer-motion'

export default function LoadingState({ progress = 0, stage = 'Processando...' }) {
  const clamped = Math.max(0, Math.min(100, progress))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto rounded-3xl bg-white/70 backdrop-blur-md border border-zinc-100 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.35)]"
    >
      <div className="p-10 md:p-12 text-center">
        <div className="mx-auto mb-7 w-28 h-28 grid place-items-center">
          <motion.div
            className="relative w-20 h-20"
            animate={{ rotate: [0, 8, -8, 0], y: [0, -6, 0] }}
            transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
          >
            <motion.div
              className="absolute inset-0 rounded-[22px] bg-indigo-500/10"
              animate={{ rotate: [0, 18, 0], scale: [1, 1.03, 1] }}
              transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
            />
            <div className="absolute inset-2 rounded-[18px] bg-white shadow-sm border border-zinc-100 grid place-items-center">
              <div className="w-8 h-1.5 bg-indigo-600 rounded-full" />
            </div>
          </motion.div>
        </div>

        <p className="font-semibold text-zinc-900">{stage}</p>
        <p className="text-sm text-zinc-500 mt-1">Isso pode levar alguns segundos...</p>

        <div className="mt-9 text-left">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Progresso</span>
            <span>{clamped}%</span>
          </div>

          <div className="h-2.5 rounded-full bg-zinc-100 overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0 bg-indigo-200/40 rounded-full"
              style={{ width: `${clamped}%` }}
            />
            <motion.div
              className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-indigo-500/0 via-indigo-600 to-indigo-500/0"
              animate={{ x: ['-40%', '140%'] }}
              transition={{ duration: 1.1, ease: 'linear', repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
