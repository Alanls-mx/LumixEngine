import { useRef, type ChangeEvent } from 'react'
import {
  FileText,
  Image as ImageIcon,
  Camera,
  User,
  Bookmark,
  Sparkles,
} from 'lucide-react'

export type SelectedAttachment = {
  file: File
  type: 'image' | 'document' | 'video'
  previewUrl: string
  name: string
  sizeFormatted: string
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function WhatsAppAttachMenu({
  isOpen,
  onClose,
  onAttachmentSelected,
  onOpenTemplates,
  onOpenAiSuggestions,
  onShareContact,
}: {
  isOpen: boolean
  onClose: () => void
  onAttachmentSelected: (attachment: SelectedAttachment) => void
  onOpenTemplates: () => void
  onOpenAiSuggestions: () => void
  onShareContact?: () => void
}) {
  const docInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'document' | 'video') => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    const attachment: SelectedAttachment = {
      file,
      type: file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
        ? 'video'
        : type,
      previewUrl,
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
    }

    onAttachmentSelected(attachment)
    onClose()

    // Reset input so same file can be selected again
    e.target.value = ''
  }

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'document')}
      />
      <input
        ref={mediaInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'image')}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'image')}
      />

      {/* Floating Vertical Menu (Identical to WhatsApp Web) */}
      <div
        className="absolute bottom-14 left-0 z-40 flex flex-col gap-2 rounded-2xl bg-white p-2.5 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-3 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Documento */}
        <button
          type="button"
          onClick={() => docInputRef.current?.click()}
          className="group flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition hover:bg-[#f0f2f5]"
        >
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#7f66ff] text-white shadow-sm transition group-hover:scale-105 active:scale-95">
            <FileText className="size-5" />
          </div>
          <div className="pr-3">
            <p className="text-xs font-semibold text-[#111b21]">Documento</p>
            <p className="text-[10px] text-[#667781]">PDF, DOCX, XLSX, TXT</p>
          </div>
        </button>

        {/* Fotos e Vídeos */}
        <button
          type="button"
          onClick={() => mediaInputRef.current?.click()}
          className="group flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition hover:bg-[#f0f2f5]"
        >
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#007bfc] text-white shadow-sm transition group-hover:scale-105 active:scale-95">
            <ImageIcon className="size-5" />
          </div>
          <div className="pr-3">
            <p className="text-xs font-semibold text-[#111b21]">Fotos e vídeos</p>
            <p className="text-[10px] text-[#667781]">Galeria de imagens e vídeos</p>
          </div>
        </button>

        {/* Câmera */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="group flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition hover:bg-[#f0f2f5]"
        >
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#d3396d] text-white shadow-sm transition group-hover:scale-105 active:scale-95">
            <Camera className="size-5" />
          </div>
          <div className="pr-3">
            <p className="text-xs font-semibold text-[#111b21]">Câmera</p>
            <p className="text-[10px] text-[#667781]">Tirar foto agora</p>
          </div>
        </button>

        {/* Contato */}
        <button
          type="button"
          onClick={() => {
            onShareContact?.()
            onClose()
          }}
          className="group flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition hover:bg-[#f0f2f5]"
        >
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#02a698] text-white shadow-sm transition group-hover:scale-105 active:scale-95">
            <User className="size-5" />
          </div>
          <div className="pr-3">
            <p className="text-xs font-semibold text-[#111b21]">Contato</p>
            <p className="text-[10px] text-[#667781]">Compartilhar cartão de contato</p>
          </div>
        </button>

        <div className="my-0.5 border-t border-slate-100" />

        {/* Templates Rápidos */}
        <button
          type="button"
          onClick={() => {
            onOpenTemplates()
            onClose()
          }}
          className="group flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition hover:bg-[#f0f2f5]"
        >
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#00a884] text-white shadow-sm transition group-hover:scale-105 active:scale-95">
            <Bookmark className="size-5" />
          </div>
          <div className="pr-3">
            <p className="text-xs font-semibold text-[#111b21]">Modelos de resposta</p>
            <p className="text-[10px] text-[#667781]">Templates comerciais prontos</p>
          </div>
        </button>

        {/* Sugestão de IA */}
        <button
          type="button"
          onClick={() => {
            onOpenAiSuggestions()
            onClose()
          }}
          className="group flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition hover:bg-[#f0f2f5]"
        >
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#6366f1] text-white shadow-sm transition group-hover:scale-105 active:scale-95">
            <Sparkles className="size-5" />
          </div>
          <div className="pr-3">
            <p className="text-xs font-semibold text-[#111b21]">Assistente IA</p>
            <p className="text-[10px] text-[#667781]">Gerar sugestões inteligentes</p>
          </div>
        </button>
      </div>
    </>
  )
}
