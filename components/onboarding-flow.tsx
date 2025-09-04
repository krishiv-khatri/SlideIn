"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CheckCircle2, Upload, ChevronLeft, ChevronRight } from "lucide-react"

type Purpose = "career" | "freelance" | "sales"

interface ResumeSection {
  id: string
  title: string
  content: string
}

interface ParsedResumeData {
  fullName?: string
  email?: string
  sections: ResumeSection[]
  work?: WorkItem[]
  education?: EducationItem[]
  skills?: string[]
}

interface WorkItem {
  company?: string
  role?: string
  dates?: string
  bullets: string[]
}

interface EducationItem {
  school?: string
  degree?: string
  dates?: string
  details?: string[]
}

const purposeLabels: Record<Purpose, string> = {
  career: "Career / Professional",
  freelance: "Freelance / Creator / Small Business",
  sales: "Sales / Campaign",
}

export type OnboardingSubmission = {
  purpose: Purpose | null
  career?: { resumeFileName?: string | null, parsed: ParsedResumeData, goal: string }
  other?: { files: string[]; freeText: string; goal: string }
}

export function OnboardingFlow({
  initial,
  onFinish,
}: {
  initial?: Partial<{
    purpose: Purpose
    career: { parsed: ParsedResumeData; goal: string }
    other: { freeText: string; goal: string }
  }>
  onFinish?: (data: OnboardingSubmission) => Promise<void> | void
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [purpose, setPurpose] = useState<Purpose | null>(initial?.purpose ?? null)

  // Career state
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parsed, setParsed] = useState<ParsedResumeData>(initial?.career?.parsed ?? { sections: [] })
  const [goal, setGoal] = useState(initial?.career?.goal ?? initial?.other?.goal ?? "")
  const [parseError, setParseError] = useState<string | null>(null)

  // Other purposes state
  const [generalFiles, setGeneralFiles] = useState<File[]>([])
  const [freeText, setFreeText] = useState(initial?.other?.freeText ?? "")

  const canContinueStep1 = useMemo(() => !!purpose, [purpose])

  const handleSelectPurpose = (p: Purpose) => {
    setPurpose(p)
  }

  const goNext = () => {
    if (step === 1 && !purpose) {
      toast.error("Please select a purpose to continue")
      return
    }
    setStep(2)
  }

  const goBack = () => setStep(1)

  // Backend resume parsing
  const handleResumeChange = async (file: File | null) => {
    if (!file) return
    setResumeFile(file)
    setIsParsing(true)
    setParseError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to parse resume")
      }
      
      const result = await response.json()
      
      // Convert backend response to our format
      const sections: ResumeSection[] = []
      const base = `${Date.now()}`
      
      if (result.work && result.work.length > 0) {
        const content = result.work
          .map((w: any) => [
            `${w.company || "Company"} • ${w.role || "Role"}${w.dates ? ` • ${w.dates}` : ""}`,
            ...(w.bullets || []).map((b: string) => `- ${b}`),
          ].join("\n"))
          .join("\n\n")
        sections.push({ id: `${base}-work`, title: "Experience", content })
      }
      
      if (result.education && result.education.length > 0) {
        const content = result.education
          .map((e: any) => [
            `${e.school || "School"} • ${e.degree || "Degree"}${e.dates ? ` • ${e.dates}` : ""}`,
            ...(e.details || []).map((d: string) => `- ${d}`),
          ].join("\n"))
          .join("\n\n")
        sections.push({ id: `${base}-edu`, title: "Education", content })
      }
      
      if (result.skills && result.skills.length > 0) {
        const content = result.skills.join(", ")
        sections.push({ id: `${base}-skills`, title: "Skills", content })
      }
      
      // Ensure at least one section
      if (sections.length === 0) {
        sections.push({ id: `${base}-summary`, title: "Summary", content: result.summary || "" })
      }
      
      setParsed({ 
        fullName: result.fullName,
        email: result.email,
        work: result.work,
        education: result.education,
        skills: result.skills,
        sections 
      })
      toast.success("Resume parsed successfully")
    } catch (e) {
      console.error("Resume parse error", e)
      const message = e instanceof Error ? e.message : "Unknown error"
      setParseError(message)
      // Fallback: scaffold empty sections so the user can proceed
      const base = `${Date.now()}`
      setParsed({
        sections: [
          { id: `${base}-summary`, title: "Summary", content: "" },
          { id: `${base}-experience`, title: "Experience", content: "" },
          { id: `${base}-education`, title: "Education", content: "" },
          { id: `${base}-skills`, title: "Skills", content: "" },
        ],
      })
      toast.warning("Couldn't auto-parse. You can paste or edit sections manually.")
    } finally {
      setIsParsing(false)
    }
  }

  const addSection = () => {
    const id = `${Date.now()}`
    setParsed((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { id, title: "New Section", content: "Describe details here" },
      ],
    }))
  }

  const updateSection = (id: string, updates: Partial<ResumeSection>) => {
    setParsed((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }))
  }

  const removeSection = (id: string) => {
    setParsed((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }))
  }

  const handleGeneralFiles = (files: FileList | null) => {
    if (!files) return
    const next = Array.from(files)
    setGeneralFiles(next)
    toast.success(`${next.length} file(s) added (placeholder)`)
  }

  const handleFinish = async () => {
    const submission: OnboardingSubmission = {
      purpose,
      career: purpose === "career" ? { resumeFileName: resumeFile?.name ?? null, parsed, goal } : undefined,
      other: purpose !== "career" ? { files: generalFiles.map((f) => f.name), freeText, goal } : undefined,
    }
    try {
      if (onFinish) {
        await onFinish(submission)
      }
      toast.success("Onboarding saved")
    } catch (err) {
      toast.error("Failed to save onboarding")
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Welcome to SlideIn</h1>
        <p className="text-gray-500">Let’s tailor your experience with context-aware onboarding.</p>
      </div>

      <Stepper step={step} />

      {step === 1 ? (
        <PurposeSelection purpose={purpose} onSelect={handleSelectPurpose} />
      ) : null}

      {step === 2 && purpose === "career" ? (
        <CareerInputs
          resumeFile={resumeFile}
          isParsing={isParsing}
          parsed={parsed}
          onResumeChange={handleResumeChange}
          onAddSection={addSection}
          onUpdateSection={updateSection}
          onRemoveSection={removeSection}
          goal={goal}
          setGoal={setGoal}
          parseError={parseError}
        />
      ) : null}

      {step === 2 && (purpose === "freelance" || purpose === "sales") ? (
        <OtherInputs
          purpose={purpose}
          files={generalFiles}
          onFilesChange={handleGeneralFiles}
          freeText={freeText}
          setFreeText={setFreeText}
          goal={goal}
          setGoal={setGoal}
        />
      ) : null}

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={goBack} disabled={step === 1} className="rounded-full">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {step === 1 ? (
          <Button onClick={goNext} disabled={!canContinueStep1} className="rounded-full">
            Continue <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="rounded-full">Edit Purpose</Button>
            <Button onClick={handleFinish} className="rounded-full">
              Save and Finish
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function Stepper({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${step >= 1 ? "border-pink-300 bg-pink-50 text-pink-700" : "border-gray-200 bg-white text-gray-500"}`}>
        <span className="font-medium">1</span>
        <span>Purpose</span>
      </div>
      <span className="text-gray-300">/</span>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${step >= 2 ? "border-pink-300 bg-pink-50 text-pink-700" : "border-gray-200 bg-white text-gray-500"}`}>
        <span className="font-medium">2</span>
        <span>Context</span>
      </div>
    </div>
  )
}

function PurposeSelection({ purpose, onSelect }: { purpose: Purpose | null, onSelect: (p: Purpose) => void }) {
  const cards: { key: Purpose, title: string, description: string }[] = [
    { key: "career", title: purposeLabels.career, description: "Personalized outreach with resume-driven context and goals." },
    { key: "freelance", title: purposeLabels.freelance, description: "Share portfolio, services, or pitch to prospective clients." },
    { key: "sales", title: purposeLabels.sales, description: "Provide campaign assets and messaging for leads and sequences." },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const isActive = purpose === card.key
        return (
          <Card key={card.key} className={`border ${isActive ? "border-pink-300 shadow-sm" : "border-gray-200"} rounded-xl cursor-pointer`} onClick={() => onSelect(card.key)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{card.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                </div>
                {isActive ? <CheckCircle2 className="h-5 w-5 text-pink-500" /> : null}
              </div>
              {isActive ? (
                <div className="mt-4">
                  <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">Selected</Badge>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function CareerInputs(
  {
    resumeFile,
    isParsing,
    parsed,
    onResumeChange,
    onAddSection,
    onUpdateSection,
    onRemoveSection,
    goal,
    setGoal,
    parseError,
  }: {
    resumeFile: File | null
    isParsing: boolean
    parsed: ParsedResumeData
    onResumeChange: (file: File | null) => void
    onAddSection: () => void
    onUpdateSection: (id: string, updates: Partial<ResumeSection>) => void
    onRemoveSection: (id: string) => void
    goal: string
    setGoal: (v: string) => void
    parseError?: string | null
  }
) {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 rounded-xl">
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Upload Resume</h3>
            <p className="text-sm text-gray-500">PDF, DOCX, or TXT. We'll parse it into editable sections using our backend.</p>
          </div>
          <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:bg-gray-50">
            <Upload className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-700">{resumeFile ? resumeFile.name : "Click to choose a file"}</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={(e) => onResumeChange(e.target.files?.[0] ?? null)}
            />
          </label>
          {isParsing ? (
            <div className="text-sm text-gray-500">Parsing resume...</div>
          ) : null}
          {parseError && !isParsing ? (
            <div className="text-sm text-red-600">Parsing failed: {parseError}</div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border border-gray-200 rounded-xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Parsed Sections</h3>
              <p className="text-sm text-gray-500">Edit or add more details.</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full" onClick={onAddSection}>Add Section</Button>
          </div>

          <div className="space-y-4">
            {parsed.sections.length === 0 ? (
              <p className="text-sm text-gray-500">No sections yet. Upload a resume to parse, or add sections manually.</p>
            ) : null}

            {parsed.sections.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-center gap-2">
                  <Input
                    value={section.title}
                    onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
                    placeholder="Section title (e.g., Experience)"
                  />
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => onRemoveSection(section.id)}>Remove</Button>
                </div>
                <Textarea
                  value={section.content}
                  onChange={(e) => onUpdateSection(section.id, { content: e.target.value })}
                  rows={5}
                  placeholder="Details..."
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 rounded-xl">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Your Goal</h3>
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Looking for SWE Internship Summer 2026"
          />
        </CardContent>
      </Card>
    </div>
  )
}

function OtherInputs(
  {
    purpose,
    files,
    onFilesChange,
    freeText,
    setFreeText,
    goal,
    setGoal,
  }: {
    purpose: Exclude<Purpose, "career">
    files: File[]
    onFilesChange: (files: FileList | null) => void
    freeText: string
    setFreeText: (v: string) => void
    goal: string
    setGoal: (v: string) => void
  }
) {
  const title = purpose === "freelance" ? purposeLabels.freelance : purposeLabels.sales

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 rounded-xl">
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Upload Files</h3>
            <p className="text-sm text-gray-500">Add portfolio, pitch deck, brief, or any relevant assets (placeholder only).</p>
          </div>
          <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:bg-gray-50">
            <Upload className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-700">Click to choose files</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => onFilesChange(e.target.files)}
            />
          </label>

          {files.length > 0 ? (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Selected:</span> {files.map((f) => f.name).join(", ")}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border border-gray-200 rounded-xl">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Context / Notes</h3>
          <Textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={6}
            placeholder={`Describe your ${title.toLowerCase()} context, offerings, or campaign details...`}
          />
        </CardContent>
      </Card>

      <Card className="border border-gray-200 rounded-xl">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Your Goal</h3>
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Book 10 intro calls this month"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default OnboardingFlow
// -------- Structured extraction --------

function extractStructuredData(text: string): {
  work?: WorkItem[]
  education?: EducationItem[]
  skills?: string[]
} {
  const lower = text.toLowerCase()
  const sectionMap = splitBySections(text)

  // Work experience
  const workRaw = sectionMap.get("experience") || sectionMap.get("work experience") || sectionMap.get("professional experience") || ""
  const work = parseWorkItems(workRaw)

  // Education
  const eduRaw = sectionMap.get("education") || ""
  const education = parseEducationItems(eduRaw)

  // Skills
  const skillsRaw = sectionMap.get("skills") || ""
  const skills = parseSkills(skillsRaw)

  return {
    work: work.length ? work : undefined,
    education: education.length ? education : undefined,
    skills: skills.length ? skills : undefined,
  }
}

function structuredToSections(data: { work?: WorkItem[]; education?: EducationItem[]; skills?: string[] }): ResumeSection[] {
  const sections: ResumeSection[] = []
  const base = `${Date.now()}`
  if (data.work && data.work.length) {
    const content = data.work
      .map(w => [
        `${w.company || "Company"} • ${w.role || "Role"}${w.dates ? ` • ${w.dates}` : ""}`,
        ...w.bullets.map(b => `- ${b}`),
      ].join("\n"))
      .join("\n\n")
    sections.push({ id: `${base}-work`, title: "Experience", content })
  }
  if (data.education && data.education.length) {
    const content = data.education
      .map(e => [
        `${e.school || "School"} • ${e.degree || "Degree"}${e.dates ? ` • ${e.dates}` : ""}`,
        ...(e.details || []).map(d => `- ${d}`),
      ].join("\n"))
      .join("\n\n")
    sections.push({ id: `${base}-edu`, title: "Education", content })
  }
  if (data.skills && data.skills.length) {
    const content = data.skills.join(", ")
    sections.push({ id: `${base}-skills`, title: "Skills", content })
  }

  // Ensure at least one section
  if (sections.length === 0) {
    sections.push({ id: `${base}-summary`, title: "Summary", content: "" })
  }
  return sections
}

function splitBySections(text: string): Map<string, string> {
  const lines = text.split(/\n+/)
  const map = new Map<string, string>()
  let current = "summary"
  const buf: string[] = []
  const flush = () => {
    if (!buf.length) return
    map.set(current, (map.get(current) || "") + (map.get(current) ? "\n" : "") + buf.join("\n").trim())
    buf.length = 0
  }
  for (const raw of lines) {
    const line = raw.trim()
    const key = detectHeading(line)
    if (key) {
      flush()
      current = key
    } else {
      buf.push(line)
    }
  }
  flush()
  return map
}

function detectHeading(line: string): string | null {
  const candidate = line.trim().toLowerCase()
  for (const key of SECTION_KEYWORDS) {
    if (candidate === key || candidate.startsWith(key + ":") || candidate === key.toUpperCase()) {
      return key
    }
  }
  // Uppercase heuristic
  if (line === line.toUpperCase() && line.length < 60 && /[A-Z]/.test(line)) {
    for (const k of SECTION_KEYWORDS) {
      if (candidate.includes(k)) return k
    }
  }
  return null
}

const DATE_RANGE = /((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4})(\s*[–-]\s*|(\s+to\s+))(Present|\d{4}|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{4})/i

function parseWorkItems(text: string): WorkItem[] {
  if (!text.trim()) return []
  const blocks = text.split(/\n\n+/)
  const items: WorkItem[] = []
  for (const block of blocks) {
    const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean)
    if (!lines.length) continue
    const header = lines[0]
    const m = header.match(DATE_RANGE)
    const dates = m ? m[0] : undefined
    const headerClean = dates ? header.replace(DATE_RANGE, "").replace(/[•|\-–]+/g, " ").trim() : header
    const [company, roleCandidate] = headerClean.split(/\s+[•|\-–]\s+|\s{2,}/)
    const role = roleCandidate || undefined
    const bullets = lines.slice(1).map(l => l.replace(/^[-•]\s*/, "").trim()).filter(Boolean)
    items.push({ company, role, dates, bullets })
  }
  return items
}

function parseEducationItems(text: string): EducationItem[] {
  if (!text.trim()) return []
  const blocks = text.split(/\n\n+/)
  const items: EducationItem[] = []
  for (const block of blocks) {
    const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean)
    if (!lines.length) continue
    const header = lines[0]
    const m = header.match(DATE_RANGE)
    const dates = m ? m[0] : undefined
    const headerClean = dates ? header.replace(DATE_RANGE, "").replace(/[•|\-–]+/g, " ").trim() : header
    const [school, degreeCandidate] = headerClean.split(/\s+[•|\-–]\s+|\s{2,}/)
    const degree = degreeCandidate || undefined
    const details = lines.slice(1).map(l => l.replace(/^[-•]\s*/, "").trim()).filter(Boolean)
    items.push({ school, degree, dates, details })
  }
  return items
}

function parseSkills(text: string): string[] {
  if (!text.trim()) return []
  // Split by commas or bullets
  const parts = text
    .split(/\n|,|•|\u2022/)
    .map(s => s.trim())
    .filter(Boolean)
  // Deduplicate and normalize casing
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of parts) {
    const key = p.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      out.push(p)
    }
  }
  return out
}

// -------- Parsing helpers --------

function normalizeText(text: string): string {
  return text
    .replace(/\r\n|\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

async function extractTextFromResume(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return await extractTextFromPdf(file)
  }
  if (name.endsWith(".docx")) {
    return await extractTextFromDocx(file)
  }
  if (name.endsWith(".txt") || file.type.startsWith("text/")) {
    return normalizeText(await file.text())
  }
  // Unsupported: try text()
  try {
    return normalizeText(await file.text())
  } catch {
    return name
  }
}

async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const pdfjsLib = await loadPdfJs()
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer, disableWorker: true }).promise
    let fullText = ""
    const maxPages = Math.min(pdf.numPages || 1, 20)
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const content = await page.getTextContent()
      const strings = content.items.map((item: any) => (item.str || ""))
      fullText += strings.join(" ") + "\n"
    }
    return normalizeText(fullText)
  } catch (e) {
    // Fallback: use pdf-parse-like Web API (not OCR) by trying to read as text; if it fails, inform caller
    throw e
  }
}

async function loadPdfJs(): Promise<any> {
  // Use a fixed ESM entry to avoid context/dynamic import issues
  const mod = await import('pdfjs-dist/build/pdf')
  return (mod as any)?.default ?? mod
}

async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = (await import("mammoth")).default
  const arrayBuffer = await file.arrayBuffer()
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer })
  // Convert HTML to text with newlines preserved between paragraphs and headings
  const tmp = document.createElement("div")
  tmp.innerHTML = html
  const walker = document.createTreeWalker(tmp, NodeFilter.SHOW_TEXT)
  let text = ""
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    const t = node.nodeValue?.trim() || ""
    if (t) {
      text += t + "\n"
    }
  }
  return normalizeText(text)
}

const SECTION_KEYWORDS = [
  "summary",
  "objective",
  "experience",
  "work experience",
  "professional experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "publications",
  "awards",
]

function segmentTextIntoSections(text: string): ResumeSection[] {
  if (!text) return []
  const lines = text.split(/\n+/)
  const sections: ResumeSection[] = []
  let currentTitle = "Summary"
  let buffer: string[] = []

  const pushSection = () => {
    const content = buffer.join("\n").trim()
    if (content) {
      sections.push({ id: `${Date.now()}-${sections.length}`, title: capitalize(currentTitle), content })
    }
    buffer = []
  }

  const isHeading = (line: string): string | null => {
    const candidate = line.trim().toLowerCase()
    for (const key of SECTION_KEYWORDS) {
      if (candidate === key || candidate.startsWith(key + ":") || candidate === key.toUpperCase()) {
        return key
      }
      // Uppercase heuristic
      if (line === line.toUpperCase() && line.length < 60 && /[A-Z]/.test(line)) {
        // treat as heading if contains keyword hint
        for (const k of SECTION_KEYWORDS) {
          if (candidate.includes(k)) return k
        }
      }
    }
    return null
  }

  for (const line of lines) {
    const heading = isHeading(line)
    if (heading) {
      pushSection()
      currentTitle = heading
    } else {
      buffer.push(line)
    }
  }
  pushSection()

  // Ensure common sections exist with empty scaffolds if missing
  const have = new Set(sections.map((s) => s.title.toLowerCase()))
  const ensure = ["Experience", "Education", "Skills", "Projects"]
  for (const t of ensure) {
    if (!have.has(t.toLowerCase())) {
      sections.push({ id: `${Date.now()}-${sections.length}`, title: t, content: "" })
    }
  }
  return sections
}

function capitalize(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}


