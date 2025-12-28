import { useMemo } from "react"
import { toast } from "sonner"
import { Button } from "@/Components/ui/button"

export default function JsonViewer({ data }) {
  const pretty = useMemo(() => (
    data ? JSON.stringify(data, null, 2) : ""
  ), [data])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pretty)
      toast.success("JSON copiado!")
    } catch {
      toast.error("Não foi possível copiar o JSON")
    }
  }

  if (!data) return null

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-emerald-500" />
          <h3 className="font-semibold text-zinc-900">JSON</h3>
        </div>

        <Button
          variant="outline"
          className="rounded-xl"
          onClick={copy}
          type="button"
        >
          Copiar JSON
        </Button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-50 shadow-sm overflow-hidden">
        <div className="px-4 py-2 text-xs text-zinc-400 border-b border-zinc-800">
          response.json
        </div>

        <pre className="p-4 text-xs leading-5 overflow-auto max-h-[520px]">
          <code>{pretty}</code>
        </pre>
      </div>
    </div>
  )
}
