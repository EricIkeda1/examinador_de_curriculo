import * as pdfjsLib from 'pdfjs-dist'
import { createWorker } from 'tesseract.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString()

async function readFileAsArrayBuffer(file) {
  return await file.arrayBuffer()
}

async function extractTextFromPdf(pdf) {
  let fullText = ''
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((it) => it.str).join(' ')
    fullText += pageText + '\n'
  }
  return fullText.trim()
}

async function ocrPdfPages(pdf, { onProgress } = {}) {
  const worker = await createWorker('por', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof onProgress === 'function') {
        onProgress(m.progress)
      }
    },
  })

  let text = ''

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({ canvasContext: context, viewport }).promise
    const { data } = await worker.recognize(canvas)

    text += (data?.text || '') + '\n'
  }

  await worker.terminate()
  return text.trim()
}

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/
const LINKEDIN_RE = /https?:\/\/(www\.)?linkedin\.com\/[^\s]+/i
const GITHUB_RE = /https?:\/\/(www\.)?github\.com\/[^\s]+/i

// Ex.: "(43) 99636 - 9387" com espaços soltos. [web:548]
const PHONE_BR_FLEX =
  /\b(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4,5}\s*[-\s.]*\s*\d{4}\b/

function normalizeText(input) {
  return String(input || '')
    .replace(/\r/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeSpaces(s) {
  return String(s || '').replace(/\s+/g, ' ').trim()
}

function normalizePhone(raw) {
  if (!raw) return null
  let digits = String(raw).replace(/[^\d]/g, '')

  if (digits.startsWith('55') && digits.length >= 12) digits = digits.slice(2)

  if (digits.length === 11) return digits.replace(/(\d{2})(\d)(\d{4})(\d{4})/, '($1) $2 $3-$4')
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')

  return normalizeSpaces(raw)
}

function extractTelefone(text) {
  const t = normalizeText(text)
  const raw = t.match(PHONE_BR_FLEX)?.[0] || null
  return normalizePhone(raw)
}

/**
 * Nome SEM cidade:
 * 1) pega header (primeiros ~260 chars)
 * 2) corta antes de Tel/Email/LinkedIn/Portfólio
 * 3) corta antes do padrão " - UF" (ex: "- PR") se existir
 * 4) se ainda sobrar cidade grudada, mantém só as primeiras 2-4 palavras (nome)
 */
function extractNome(text) {
  const t = normalizeText(text)
  const head = t.slice(0, 260)

  // corta no primeiro marcador de contato
  const beforeContact = head.split(
    /\b(?:tel\.?|telefone|e-?mail|email|linkedin|github|portf[oó]lio)\b/i,
  )[0]

  // remove " - PR" / " - SP" etc (UF)
  const withoutUF = beforeContact.replace(/\s*-\s*[A-Z]{2}\b/g, ' ')

  const cleaned = normalizeSpaces(withoutUF)

  // pega só as primeiras palavras do header (nome normalmente vem primeiro)
  const words = cleaned.split(' ').filter(Boolean)

  // regra prática: 2 a 4 palavras para nome (evita puxar cidade)
  if (words.length >= 2) return words.slice(0, Math.min(4, words.length)).join(' ')

  return null
}

function detectSeniority(text) {
  const t = normalizeText(text).toLowerCase()
  if (/\b(s[eê]nior|sr\.?)\b/.test(t)) return 'Sênior'
  if (/\b(pleno|pl\.?)\b/.test(t)) return 'Pleno'
  if (/\b(j[uú]nior|jr\.?|estagi[aá]rio|est[aá]gio)\b/.test(t)) return 'Júnior'
  return null
}

function extractSkills(text) {
  const t = String(text || '')
  const keywords = [
    'flutter',
    'dart',
    'react',
    'python',
    'sql',
    'sqlite',
    'supabase',
    'git',
    'github',
    'typescript',
    'javascript',
  ]

  const found = keywords
    .filter((k) => new RegExp(`\\b${k}\\b`, 'i').test(t))
    .map((k) => {
      if (k === 'sql') return 'SQL'
      if (k === 'sqlite') return 'SQLite'
      if (k === 'github') return 'GitHub'
      if (k === 'typescript') return 'Typescript'
      return k[0].toUpperCase() + k.slice(1)
    })

  return [...new Set(found)]
}

function buildJsonFromText(rawText) {
  const text = normalizeText(rawText)

  const nome = extractNome(text)
  const telefone = extractTelefone(text)
  const email = text.match(EMAIL_RE)?.[0] || null
  const linkedin = text.match(LINKEDIN_RE)?.[0] || null
  const github = text.match(GITHUB_RE)?.[0] || null
  const senioridade = detectSeniority(text)
  const skills = extractSkills(text)

  return {
    nome: nome || null,
    email,
    telefone: telefone || null,
    linkedin,
    github,
    senioridade: senioridade || null,
    skills,
    experiencia: [],
    formacao: [],
    idiomas: [],
    resumo: null,
    _debug: {
      rawTextPreview: text.slice(0, 2000),
      headerPreview: text.slice(0, 260),
      matches: {
        nome,
        telefoneRaw: text.match(PHONE_BR_FLEX)?.[0] || null,
        telefone,
      },
    },
  }
}

export async function extractResume(file, { onStage, onProgress } = {}) {
  const startTime = Date.now()

  const setStage = (s) => typeof onStage === 'function' && onStage(s)
  const setProgress = (p) => typeof onProgress === 'function' && onProgress(p)

  setStage('Lendo PDF...')
  setProgress(0.05)

  const buffer = await readFileAsArrayBuffer(file)
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  setStage('Extraindo texto do PDF...')
  setProgress(0.2)

  const t0 = Date.now()
  let text = await extractTextFromPdf(pdf)
  const textExtractTime = Date.now() - t0

  let ocrTime = 0
  if (!text || text.length < 30) {
    setStage('Extraindo texto com OCR...')
    setProgress(0.3)

    const o0 = Date.now()
    text = await ocrPdfPages(pdf, {
      onProgress: (p) => setProgress(0.3 + p * 0.55),
    })
    ocrTime = Date.now() - o0
  }

  setStage('Gerando JSON...')
  setProgress(0.9)

  const json = buildJsonFromText(text)

  const totalTime = Date.now() - startTime
  setProgress(1)

  return {
    json,
    logs: {
      pdfTextExtraction: `${(textExtractTime / 1000).toFixed(2)}s`,
      ocr: ocrTime ? `${(ocrTime / 1000).toFixed(2)}s` : '0.00s',
      total: `${(totalTime / 1000).toFixed(2)}s`,
    },
  }
}
