import { Badge } from '@/Components/ui/badge'
import { cn } from '@/lib/utils'
import { Mail, Phone, Linkedin, User2, Sparkles, Briefcase } from 'lucide-react'

function safeText(v) {
  if (v === null || v === undefined) return '-'
  const s = String(v).trim()
  return s.length ? s : '-'
}

function ValueText({ children }) {
  return (
    <p className="text-sm font-medium text-zinc-900 break-words whitespace-normal leading-snug">
      {children}
    </p>
  )
}

function Card({ icon: Icon, label, value, className }) {
  return (
    <div className={cn('rounded-2xl bg-white/70 backdrop-blur-md border border-zinc-100 p-4', className)}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 grid place-items-center text-zinc-600 shrink-0">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</p>
          <ValueText>{safeText(value)}</ValueText>
        </div>
      </div>
    </div>
  )
}

export default function ResultSummary({ data }) {
  if (!data) return null

  const nome = data?.nome
  const email = data?.email
  const telefone = data?.telefone
  const linkedin = data?.linkedin
  const senioridade = data?.senioridade
  const skills = Array.isArray(data?.skills) ? data.skills : []

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-5 rounded-full bg-indigo-500" />
        <h3 className="font-semibold text-zinc-900">Resumo</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* IMPORTANTE: aqui só mostra nome, sem subtítulo/cidade */}
        <Card icon={User2} label="Nome" value={nome} />
        <Card icon={Mail} label="Email" value={email} />

        <Card icon={Phone} label="Telefone" value={telefone} />
        <Card icon={Linkedin} label="LinkedIn" value={linkedin} />

        <Card
          icon={Briefcase}
          label="Senioridade estimada"
          value={senioridade}
          className="sm:col-span-2"
        />

        <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-zinc-100 p-4 sm:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 grid place-items-center text-indigo-600">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">Top skills</p>
            </div>
          </div>

          {skills.length ? (
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 12).map((s, idx) => (
                <Badge key={`${s}-${idx}`} className="bg-zinc-100 text-zinc-700">
                  {String(s)}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">-</p>
          )}
        </div>
      </div>
    </div>
  )
}
