import { useRef, useState } from 'react'

import Header from '@/Components/resume/Header'
import UploadCard from '@/Components/resume/UploadCard'
import ResultSummary from '@/Components/resume/ResultSummary'
import JsonViewer from '@/Components/resume/JsonViewer'
import LogsSection from '@/Components/resume/LogsSection'
import LoadingState from '@/Components/resume/LoadingState'

import { extractResume } from '@/api/resumeExtractor'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const withTimeout = (promise, ms, message) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ])

export default function ResumeScanner() {
  const [view, setView] = useState('upload') // upload | loading | result

  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  const [result, setResult] = useState(null)
  const [logs, setLogs] = useState(null)

  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')

  const runIdRef = useRef(0)

  const reset = () => {
    runIdRef.current += 1
    setView('upload')
    setFile(null)
    setError(null)
    setResult(null)
    setLogs(null)
    setProgress(0)
    setStage('')
  }

  const analyzeResume = async () => {
    if (view === 'loading') return
    if (!file) return

    const runId = ++runIdRef.current

    setError(null)
    setResult(null)
    setLogs(null)

    setProgress(0)
    setStage('Extraindo texto com OCR...')
    setView('loading')

    const startedAt = Date.now()

    try {
      const { json, logs: extractorLogs } = await withTimeout(
        extractResume(file, {
          onStage: (s) => {
            if (runIdRef.current !== runId) return
            setStage(s)
          },
          onProgress: (p01) => {
            if (runIdRef.current !== runId) return
            setProgress(Math.max(0, Math.min(100, Math.round(p01 * 100))))
          },
        }),
        60_000,
        'Tempo limite excedido no OCR/PDF',
      )

      const totalMs = Date.now() - startedAt

      const nextLogs = {
        extraction: extractorLogs?.ocr ?? '0.00s',
        extractionStatus: 'success',
        parsing: extractorLogs?.pdfTextExtraction ?? '0.00s',
        parsingStatus: 'success',
        total: `${(totalMs / 1000).toFixed(2)}s`,
      }

      if (runIdRef.current !== runId) return

      setStage('Finalizando...')
      await sleep(10_000)

      if (runIdRef.current !== runId) return

      setResult(json)
      setLogs(nextLogs)
      setView('result')
    } catch (err) {
      if (runIdRef.current !== runId) return
      setError(err?.message || 'Falha ao processar o PDF')
      setView('upload')
    } finally {
      if (runIdRef.current !== runId) return
      setProgress(0)
      setStage('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <Header />

        {view === 'upload' && (
          <UploadCard
            file={file}
            setFile={setFile}
            onAnalyze={analyzeResume}
            isLoading={false}
            error={error}
          />
        )}

        {view === 'loading' && <LoadingState progress={progress} stage={stage} />}

        {view === 'result' && result && (
          <div className="w-full max-w-5xl mx-auto">
            <div className="mb-10 text-center">
              <button
                onClick={reset}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm inline-flex items-center gap-2 hover:underline"
              >
                ← Analisar outro currículo
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <ResultSummary data={result} />
              <JsonViewer data={result} />
            </div>

            {logs && <LogsSection logs={logs} />}
          </div>
        )}
      </div>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl" />
      </div>
    </div>
  )
}
