import { useState, useEffect } from 'react'
import { X, Send, FileText, Smile } from 'lucide-react'
import type { SelectedAttachment } from './WhatsAppAttachMenu'
import { WhatsAppEmojiPicker } from './WhatsAppEmojiPicker'

export function WhatsAppMediaPreviewModal({
  attachment,
  onClose,
  onSend,
  isSending = false,
}: {
  attachment: SelectedAttachment | null
  onClose: () => void
  onSend: (attachment: SelectedAttachment, caption: string) => void
  isSending?: boolean
}) {
  const [caption, setCaption] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
    setCaption('')
    setShowEmojiPicker(false)
  }, [attachment])

  if (!attachment) return null

  const handleSend = () => {
    onSend(attachment, caption.trim())
  }

  const isImage = attachment.type === 'image'
  const isVideo = attachment.type === 'video'
  const isDocument = attachment.type === 'document'

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col bg-[#efeae2]/95 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setShowEmojiPicker(false)}
    >
      {/* WhatsApp Web Preview Header */}
      <header className="flex h-14 items-center justify-between border-b border-[#d1d7db] bg-[#f0f2f5] px-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-[#54656f] transition hover:bg-[#d1d7db] hover:text-[#111b21]"
            title="Fechar prévia"
          >
            <X className="size-5" />
          </button>
          <div>
            <h3 className="text-sm font-semibold text-[#111b21]">
              {isImage ? 'Enviar foto' : isVideo ? 'Enviar vídeo' : 'Enviar documento'}
            </h3>
            <p className="text-[11px] text-[#667781] truncate max-w-[280px] sm:max-w-md">
              {attachment.name} · {attachment.sizeFormatted}
            </p>
          </div>
        </div>
      </header>

      {/* Main Preview Center */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8 overflow-hidden">
        {isImage && (
          <div className="flex flex-col items-center">
            <img
              src={attachment.previewUrl}
              alt={attachment.name}
              className="max-h-[55vh] max-w-[85vw] sm:max-w-lg object-contain rounded-2xl shadow-xl border border-white/50"
            />
          </div>
        )}

        {isVideo && (
          <div className="flex flex-col items-center">
            <video
              src={attachment.previewUrl}
              controls
              className="max-h-[55vh] max-w-[85vw] sm:max-w-lg rounded-2xl shadow-xl border border-white/50"
            />
          </div>
        )}

        {isDocument && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-xl max-w-sm w-full text-center">
            <div className="mx-auto mb-4 grid size-20 place-items-center rounded-2xl bg-[#7f66ff]/15 text-[#7f66ff]">
              <FileText className="size-10" />
            </div>
            <p className="font-semibold text-[#111b21] text-sm break-all mb-1">
              {attachment.name}
            </p>
            <span className="inline-block rounded-full bg-[#f0f2f5] px-3 py-1 text-xs font-medium text-[#54656f]">
              {attachment.sizeFormatted}
            </span>
          </div>
        )}
      </div>

      {/* Emoji Picker Popover in Modal if opened */}
      {showEmojiPicker && (
        <div onClick={(e) => e.stopPropagation()}>
          <WhatsAppEmojiPicker
            onSelect={(emoji) => setCaption((prev) => prev + emoji)}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* WhatsApp Web Bottom Caption & Send Bar */}
      <footer className="border-t border-[#d1d7db] bg-[#f0f2f5] px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {/* Emoji Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowEmojiPicker(!showEmojiPicker)
            }}
            className="grid size-10 shrink-0 place-items-center rounded-full text-[#54656f] transition hover:bg-[#e9edef] hover:text-[#111b21]"
            title="Adicionar emoji na legenda"
          >
            <Smile className="size-6" />
          </button>

          {/* Caption Input Bar */}
          <div className="flex-1 rounded-xl bg-white px-3.5 py-2 shadow-xs focus-within:ring-1 focus-within:ring-[#00a884]">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Adicione uma legenda..."
              className="w-full bg-transparent text-sm text-[#111b21] outline-none placeholder:text-[#8696a0]"
              autoFocus
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-[#00a884] text-white shadow-md transition hover:bg-[#008f6f] active:scale-95 disabled:opacity-50"
            title="Enviar"
          >
            <Send className="size-5" />
          </button>
        </div>
      </footer>
    </div>
  )
}
