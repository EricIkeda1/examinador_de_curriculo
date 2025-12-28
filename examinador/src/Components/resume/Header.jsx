import { FileScan } from 'lucide-react'

export default function Header() {
  return (
    <div className="text-center mb-12">
      <div className="mx-auto mb-6 w-12 h-12 rounded-2xl bg-indigo-600 grid place-items-center shadow-[0_18px_40px_-18px_rgba(79,70,229,0.7)]">
        <FileScan className="text-white" size={22} />
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
        Resume Scanner
      </h1>

      <p className="mt-3 text-zinc-500 leading-7">
        Envie um currículo em PDF e receba um JSON <br className="hidden md:block" />
        estruturado
      </p>
    </div>
  )
}
