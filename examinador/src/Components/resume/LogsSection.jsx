import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, CheckCircle2 } from "lucide-react"

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 last:border-b-0">
      <div className="flex items-center gap-2 text-sm text-zinc-200">
        <CheckCircle2 size={16} className="text-emerald-400" />
        <span>{label}</span>
      </div>
      <div className="text-sm text-zinc-200 tabular-nums">{value}</div>
    </div>
  )
}

export default function LogsSection({ logs }) {
  const [open, setOpen] = useState(true)
  if (!logs) return null

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between rounded-2xl bg-white/70 backdrop-blur-md border border-zinc-100 px-4 py-3 text-sm text-zinc-700"
      >
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-zinc-100 grid place-items-center text-zinc-600">
            ≡
          </span>
          <span className="font-medium">Logs de Processamento</span>
        </div>

        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-[0_30px_80px_-45px_rgba(0,0,0,0.55)]"
          >
            <Row label="Extração de texto (OCR)" value={logs.extraction} />
            <Row label="Parser de dados" value={logs.parsing} />

            <div className="px-4 py-3 flex items-center justify-between bg-zinc-950/60">
              <div className="flex items-center gap-2 text-sm text-zinc-200">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Tempo total</span>
              </div>
              <div className="text-sm text-zinc-200 tabular-nums">
                {logs.total}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
