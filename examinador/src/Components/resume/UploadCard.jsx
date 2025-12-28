import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function UploadCard({ file, setFile, onAnalyze, isLoading, error }) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)

  const setPickedFile = (f) => {
    // valida PDF
    if (f && f.type && f.type !== 'application/pdf') {
      setFile(null)
      return
    }
    setFile(f)
  }

  const onPick = (e) => {
    const f = e.target.files?.[0] || null
    setPickedFile(f)

    // permite selecionar o mesmo arquivo novamente e disparar onChange
    e.target.value = ''
  }

  const clear = () => {
    setFile(null)
    setDragActive(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  // Drag events
  const onDragOver = (e) => {
    // necessário para permitir drop
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const onDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const onDrop = (e) => {
    // impede o browser de abrir o arquivo
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const dropped = e.dataTransfer?.files?.[0] || null
    setPickedFile(dropped)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto rounded-3xl bg-white/70 backdrop-blur-md border border-zinc-100 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.35)]"
    >
      <div className="p-8 md:p-10">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            'rounded-2xl border-2 border-dashed bg-white px-6 py-10 text-center transition-colors',
            file ? 'border-emerald-200 bg-emerald-50/50' : 'border-zinc-200',
            dragActive && !file && 'border-indigo-300 bg-indigo-50/40',
          )}
        >
          {!file ? (
            <>
              <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-zinc-100 grid place-items-center">
                <Upload className="text-zinc-500" size={22} />
              </div>

              <p className="font-semibold text-zinc-900">Arraste seu currículo aqui</p>
              <p className="text-sm text-zinc-500 mt-1">ou clique para selecionar</p>

              <div className="mt-6">
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={onPick}
                />

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl px-6"
                  onClick={() => inputRef.current?.click()}
                >
                  Selecionar arquivo
                </Button>
              </div>

              <p className="text-xs text-zinc-400 mt-4">Formatos: PDF (máx 5MB)</p>
            </>
          ) : (
            <div className="flex items-center gap-4 justify-between rounded-2xl bg-emerald-50 px-5 py-5 border border-emerald-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 grid place-items-center">
                  <FileText className="text-emerald-700" size={18} />
                </div>

                <div className="min-w-0 text-left">
                  <p className="font-semibold text-zinc-900 truncate">{file.name}</p>
                  <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              <button
                type="button"
                className="p-2 rounded-xl hover:bg-emerald-100 text-emerald-800"
                onClick={clear}
                title="Remover"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 text-sm text-red-600">
            <AlertCircle size={18} className="mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-7">
          <Button
            type="button"
            onClick={onAnalyze}
            disabled={!file || isLoading}
            className="w-full py-4 rounded-2xl text-base font-semibold shadow-[0_22px_50px_-25px_rgba(79,70,229,0.9)]"
          >
            Analisar currículo
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
