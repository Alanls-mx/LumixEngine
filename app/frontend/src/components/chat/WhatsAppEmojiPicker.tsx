import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Search,
  Smile,
  Dog,
  Utensils,
  Trophy,
  Car,
  Lightbulb,
  Heart,
  Flag,
  Clock,
  X,
} from 'lucide-react'

type EmojiCategory = {
  id: string
  name: string
  icon: typeof Smile
  emojis: Array<{ char: string; name: string; keywords: string[] }>
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Carinhas e Pessoas',
    icon: Smile,
    emojis: [
      { char: '😀', name: 'Rosto sorridente', keywords: ['sorriso', 'feliz', 'alegria'] },
      { char: '😃', name: 'Rosto sorridente com olhos bem abertos', keywords: ['sorriso', 'feliz'] },
      { char: '😄', name: 'Rosto sorridente com olhos sorridentes', keywords: ['sorriso', 'feliz', 'olhos'] },
      { char: '😁', name: 'Rosto radiante', keywords: ['dentes', 'radiante', 'feliz'] },
      { char: '😆', name: 'Rosto sorridente de olhos fechados', keywords: ['gargalhada', 'engraçado'] },
      { char: '😅', name: 'Rosto sorridente com suor', keywords: ['suor', 'alívio', 'ufa'] },
      { char: '😂', name: 'Chorando de rir', keywords: ['rir', 'choro', 'engraçado', 'kkk', 'haha'] },
      { char: '🤣', name: 'Rolando de rir', keywords: ['rolando', 'rir', 'engraçado', 'kkk'] },
      { char: '😊', name: 'Rosto sorridente com bochechas coradas', keywords: ['timido', 'fofo', 'meigo'] },
      { char: '😇', name: 'Rosto com auréola', keywords: ['anjo', 'inocente', 'santo'] },
      { char: '🙂', name: 'Rosto com leve sorriso', keywords: ['leve', 'tranquilo', 'ok'] },
      { char: '😉', name: 'Rosto piscando', keywords: ['piscar', 'piscadela', 'brincadeira'] },
      { char: '😌', name: 'Rosto aliviado', keywords: ['alívio', 'paz', 'tranquilo'] },
      { char: '😍', name: 'Olhos de coração', keywords: ['amor', 'apaixonado', 'amei', 'lindo'] },
      { char: '🥰', name: 'Rosto com corações', keywords: ['amor', 'carinho', 'fofo'] },
      { char: '😘', name: 'Mandando beijo', keywords: ['beijo', 'beijinho', 'amor'] },
      { char: '😋', name: 'Rosto saboreando comida', keywords: ['gostoso', 'delícia', 'fome'] },
      { char: '😛', name: 'Rosto mostrando a língua', keywords: ['língua', 'brincadeira'] },
      { char: '😜', name: 'Piscando e mostrando a língua', keywords: ['língua', 'piscar', 'zoeira'] },
      { char: '🤪', name: 'Rosto doidinho', keywords: ['doido', 'maluco', 'louco'] },
      { char: '🤑', name: 'Rosto de dinheiro', keywords: ['dinheiro', 'rico', 'grana', 'venda'] },
      { char: '🤗', name: 'Rosto abraçando', keywords: ['abraço', 'carinho'] },
      { char: '🤫', name: 'Rosto pedindo silêncio', keywords: ['silêncio', 'segredo', 'psiu'] },
      { char: '🤔', name: 'Rosto pensativo', keywords: ['pensando', 'dúvida', 'hmm'] },
      { char: '🤐', name: 'Boca de zíper', keywords: ['ziper', 'segredo', 'calado'] },
      { char: '😏', name: 'Rosto com sorriso maroto', keywords: ['espertinho', 'malicioso'] },
      { char: '😒', name: 'Rosto desanimado', keywords: ['desânimo', 'chato', 'aff'] },
      { char: '🙄', name: 'Revirando os olhos', keywords: ['olhos', 'revirando', 'sério'] },
      { char: '😬', name: 'Rosto fazendo careta', keywords: ['careta', 'tensão', 'eita'] },
      { char: '🤥', name: 'Rosto mentiroso', keywords: ['mentira', 'pinóquio'] },
      { char: '😴', name: 'Rosto dormindo', keywords: ['sono', 'dormir', 'zzz'] },
      { char: '😷', name: 'Rosto com máscara', keywords: ['máscara', 'doente', 'hospital'] },
      { char: '🤒', name: 'Rosto com termômetro', keywords: ['febre', 'doente'] },
      { char: '🥵', name: 'Rosto morrendo de calor', keywords: ['calor', 'quente', 'fogo'] },
      { char: '🥶', name: 'Rosto congelando de frio', keywords: ['frio', 'gelo', 'neve'] },
      { char: '🤯', name: 'Cabeça explodindo', keywords: ['choque', 'uau', 'explodir'] },
      { char: '🥳', name: 'Rosto festivo', keywords: ['festa', 'parabéns', 'comemoração'] },
      { char: '😎', name: 'Rosto com óculos escuros', keywords: ['legal', 'top', 'estiloso'] },
      { char: '🤓', name: 'Rosto nerd', keywords: ['nerd', 'óculos', 'inteligente'] },
      { char: '🧐', name: 'Rosto com monóculo', keywords: ['analisando', 'investigando'] },
      { char: '😕', name: 'Rosto confuso', keywords: ['confuso', 'dúvida'] },
      { char: '🥺', name: 'Rosto pidão', keywords: ['implorando', 'por favor', 'olhinhos'] },
      { char: '😢', name: 'Rosto chorando', keywords: ['triste', 'lágrima', 'choro'] },
      { char: '😭', name: 'Rosto chorando alto', keywords: ['choro', 'tristeza', 'desespero'] },
      { char: '😱', name: 'Gritando de medo', keywords: ['medo', 'susto', 'choque'] },
      { char: '😡', name: 'Rosto muito bravo', keywords: ['raiva', 'bravo', 'ódio'] },
      { char: '👍', name: 'Polegar para cima', keywords: ['joinha', 'positivo', 'curti', 'ok', 'beleza', 'valeu'] },
      { char: '👎', name: 'Polegar para baixo', keywords: ['negativo', 'descurtir', 'ruim'] },
      { char: '👏', name: 'Palmas aplaudindo', keywords: ['palmas', 'parabéns', 'aplausos'] },
      { char: '🙌', name: 'Mãos para cima celebrando', keywords: ['comemoração', 'glória', 'sucesso'] },
      { char: '🤝', name: 'Aperto de mãos', keywords: ['acordo', 'negócio', 'parceria', 'fechado'] },
      { char: '🙏', name: 'Mãos postas em oração / gratidão', keywords: ['obrigado', 'por favor', 'gratidão', 'amém'] },
      { char: '✌️', name: 'Sinal de vitória / paz', keywords: ['paz', 'dois', 'vitória'] },
      { char: '🤞', name: 'Dedos cruzados', keywords: ['sorte', 'torcida'] },
      { char: '👋', name: 'Mão acenando', keywords: ['olá', 'oi', 'tchau', 'acenando'] },
      { char: '💪', name: 'Braço forte', keywords: ['força', 'musculo', 'foco'] },
      { char: '👀', name: 'Olhos atentos', keywords: ['olhando', 'atento', 'veja'] },
      { char: '🔥', name: 'Fogo / Em chamas', keywords: ['fogo', 'quente', 'top', 'destaque'] },
      { char: '✨', name: 'Brilhos', keywords: ['brilho', 'mágica', 'especial'] },
      { char: '💯', name: 'Cem pontos', keywords: ['cem', 'perfeito', 'top'] },
    ],
  },
  {
    id: 'animals',
    name: 'Animais e Natureza',
    icon: Dog,
    emojis: [
      { char: '🐶', name: 'Cachorro', keywords: ['cão', 'pet', 'animal'] },
      { char: '🐱', name: 'Gato', keywords: ['gatinho', 'pet'] },
      { char: '🐭', name: 'Rato', keywords: ['camundongo'] },
      { char: '🐹', name: 'Hamster', keywords: ['pet', 'roedor'] },
      { char: '🐰', name: 'Coelho', keywords: ['coelhinho', 'páscoa'] },
      { char: '🦊', name: 'Raposa', keywords: ['esperta'] },
      { char: '🐻', name: 'Urso', keywords: ['urso'] },
      { char: '🐼', name: 'Panda', keywords: ['urso panda'] },
      { char: '🦁', name: 'Leão', keywords: ['rei', 'selva'] },
      { char: '🐮', name: 'Vaca', keywords: ['fazenda'] },
      { char: '🐷', name: 'Porco', keywords: ['porquinho'] },
      { char: '🐸', name: 'Sapo', keywords: ['natureza'] },
      { char: '🐵', name: 'Macaco', keywords: ['macaquinho'] },
      { char: '🐔', name: 'Galinha', keywords: ['ave'] },
      { char: '🐧', name: 'Pinguim', keywords: ['gelo'] },
      { char: '🐦', name: 'Pássaro', keywords: ['ave', 'natureza'] },
      { char: '🦆', name: 'Pato', keywords: ['lago'] },
      { char: '🦅', name: 'Águia', keywords: ['ave', 'visão'] },
      { char: '🦉', name: 'Coruja', keywords: ['sabedoria'] },
      { char: '🐝', name: 'Abelha', keywords: ['mel', 'inseto'] },
      { char: '🦋', name: 'Borboleta', keywords: ['transformação'] },
      { char: '🐢', name: 'Tartaruga', keywords: ['devagar'] },
      { char: '🐬', name: 'Golfinho', keywords: ['mar'] },
      { char: '🐳', name: 'Baleia', keywords: ['oceano'] },
      { char: '🦈', name: 'Tubarão', keywords: ['mar', 'predador'] },
      { char: '🌸', name: 'Flor de cerejeira', keywords: ['flor', 'primavera'] },
      { char: '🌹', name: 'Rosa vermelha', keywords: ['flor', 'amor', 'romance'] },
      { char: '🌻', name: 'Girassol', keywords: ['flor', 'sol'] },
      { char: '🍀', name: 'Trevo de 4 folhas', keywords: ['sorte', 'verde'] },
      { char: '🌱', name: 'Broto de planta', keywords: ['planta', 'crescimento'] },
      { char: '🌲', name: 'Pinheiro', keywords: ['árvore', 'natureza'] },
      { char: '🌴', name: 'Palmeira', keywords: ['praia', 'verão'] },
    ],
  },
  {
    id: 'food',
    name: 'Comida e Bebida',
    icon: Utensils,
    emojis: [
      { char: '🍏', name: 'Maçã verde', keywords: ['fruta', 'saudável'] },
      { char: '🍎', name: 'Maçã vermelha', keywords: ['fruta'] },
      { char: '🍐', name: 'Pera', keywords: ['fruta'] },
      { char: '🍊', name: 'Laranja', keywords: ['fruta', 'suco'] },
      { char: '🍋', name: 'Limão', keywords: ['fruta', 'azedo'] },
      { char: '🍌', name: 'Banana', keywords: ['fruta'] },
      { char: '🍉', name: 'Melancia', keywords: ['fruta', 'verão'] },
      { char: '🍇', name: 'Uva', keywords: ['fruta', 'vinho'] },
      { char: '🍓', name: 'Morango', keywords: ['fruta', 'doce'] },
      { char: '🥑', name: 'Abacate', keywords: ['fruta', 'saudável'] },
      { char: '🍕', name: 'Pizza', keywords: ['comida', 'lanche', 'queijo'] },
      { char: '🍔', name: 'Hambúrguer', keywords: ['comida', 'lanche', 'burguer'] },
      { char: '🍟', name: 'Batata frita', keywords: ['lanche', 'porção'] },
      { char: '🌭', name: 'Cachorro quente', keywords: ['lanche'] },
      { char: '🍿', name: 'Pipoca', keywords: ['cinema', 'filme'] },
      { char: '🥩', name: 'Carne', keywords: ['churrasco'] },
      { char: '🥪', name: 'Sanduíche', keywords: ['lanche', 'comida'] },
      { char: '🍝', name: 'Espaguete', keywords: ['massa', 'comida'] },
      { char: '🍣', name: 'Sushi', keywords: ['comida japonesa'] },
      { char: '🍰', name: 'Bolo fatia', keywords: ['doce', 'sobremesa'] },
      { char: '🎂', name: 'Bolo de aniversário', keywords: ['festa', 'parabéns'] },
      { char: '🍫', name: 'Chocolate', keywords: ['doce'] },
      { char: '☕', name: 'Café quente', keywords: ['café', 'bebida', 'manhã'] },
      { char: '🧃', name: 'Caixinha de suco', keywords: ['suco', 'bebida'] },
      { char: '🥤', name: 'Copo com canudo', keywords: ['refrigerante', 'bebida'] },
      { char: '🍺', name: 'Caneca de cerveja', keywords: ['cerveja', 'brinde', 'happy hour'] },
      { char: '🍻', name: 'Canecas brindando', keywords: ['brinde', 'cerveja', 'comemoração'] },
      { char: '🍷', name: 'Taça de vinho', keywords: ['vinho', 'jantar'] },
      { char: '🥂', name: 'Taças de espumante', keywords: ['brinde', 'champanhe'] },
    ],
  },
  {
    id: 'activities',
    name: 'Atividades e Esportes',
    icon: Trophy,
    emojis: [
      { char: '⚽', name: 'Bola de futebol', keywords: ['futebol', 'jogo', 'esporte'] },
      { char: '🏀', name: 'Bola de basquete', keywords: ['basquete', 'esporte'] },
      { char: '🏈', name: 'Bola de futebol americano', keywords: ['esporte'] },
      { char: '⚾', name: 'Bola de beisebol', keywords: ['esporte'] },
      { char: '🎾', name: 'Bola de tênis', keywords: ['tênis', 'esporte'] },
      { char: '🏐', name: 'Bola de vôlei', keywords: ['vôlei', 'esporte'] },
      { char: '🏆', name: 'Troféu dourado', keywords: ['vitória', 'campeão', 'sucesso', 'prêmio'] },
      { char: '🥇', name: 'Medalha de ouro', keywords: ['primeiro', 'ouro', 'campeão'] },
      { char: '🎯', name: 'Alvo com dardo', keywords: ['meta', 'foco', 'objetivo', 'acerto'] },
      { char: '🎮', name: 'Controle de videogame', keywords: ['jogo', 'game', 'play'] },
      { char: '🎲', name: 'Dado de jogo', keywords: ['sorte', 'jogo'] },
      { char: '🎸', name: 'Guitarra', keywords: ['música', 'rock'] },
      { char: '🎧', name: 'Fones de ouvido', keywords: ['música', 'áudio'] },
      { char: '🎬', name: 'Claquete de cinema', keywords: ['filme', 'vídeo', 'ação'] },
    ],
  },
  {
    id: 'travel',
    name: 'Viagens e Lugares',
    icon: Car,
    emojis: [
      { char: '🚗', name: 'Carro vermelho', keywords: ['carro', 'viagem', 'trânsito'] },
      { char: '🚕', name: 'Táxi', keywords: ['táxi', 'transporte'] },
      { char: '🚌', name: 'Ônibus', keywords: ['transporte', 'viagem'] },
      { char: '🚀', name: 'Foguete decolando', keywords: ['foguete', 'lançamento', 'rápido', 'crescimento'] },
      { char: '✈️', name: 'Avião', keywords: ['viagem', 'voo', 'férias'] },
      { char: '🏖️', name: 'Praia com guarda-sol', keywords: ['praia', 'férias', 'mar'] },
      { char: '🏙️', name: 'Cidade com arranha-céus', keywords: ['cidade', 'prédios'] },
      { char: '🏠', name: 'Casa', keywords: ['lar', 'moradia', 'casa'] },
      { char: '🏢', name: 'Prédio comercial', keywords: ['escritório', 'empresa', 'trabalho'] },
    ],
  },
  {
    id: 'objects',
    name: 'Objetos e Negócios',
    icon: Lightbulb,
    emojis: [
      { char: '💡', name: 'Lâmpada acesa', keywords: ['ideia', 'dica', 'insight', 'luz'] },
      { char: '📱', name: 'Celular smartphone', keywords: ['celular', 'telefone', 'zap', 'whatsapp'] },
      { char: '💻', name: 'Notebook computador', keywords: ['computador', 'trabalho', 'ti'] },
      { char: '💰', name: 'Saco de dinheiro', keywords: ['dinheiro', 'lucro', 'pagamento'] },
      { char: '💵', name: 'Nota de dólar', keywords: ['dinheiro', 'dólar', 'grana'] },
      { char: '💳', name: 'Cartão de crédito', keywords: ['cartão', 'pagamento', 'compra'] },
      { char: '📦', name: 'Caixa de encomenda', keywords: ['entrega', 'produto', 'envio'] },
      { char: '📊', name: 'Gráfico de barras', keywords: ['estatística', 'relatório', 'dados'] },
      { char: '📈', name: 'Gráfico com tendência de alta', keywords: ['alta', 'crescimento', 'vendas'] },
      { char: '📋', name: 'Prancheta com lista', keywords: ['tarefa', 'lista', 'checklist'] },
      { char: '📁', name: 'Pasta de arquivos', keywords: ['pasta', 'documento'] },
      { char: '📄', name: 'Folha de documento', keywords: ['documento', 'contrato', 'arquivo'] },
      { char: '✉️', name: 'Envelope de e-mail', keywords: ['email', 'mensagem', 'carta'] },
      { char: '🔔', name: 'Sino de notificação', keywords: ['alerta', 'aviso', 'atenção'] },
      { char: '🔑', name: 'Chave dourada', keywords: ['chave', 'acesso', 'segurança'] },
      { char: '🔒', name: 'Cadeado fechado', keywords: ['segurança', 'protegido'] },
    ],
  },
  {
    id: 'symbols',
    name: 'Símbolos e Corações',
    icon: Heart,
    emojis: [
      { char: '❤️', name: 'Coração vermelho', keywords: ['amor', 'coração', 'amei', 'paixão'] },
      { char: '💚', name: 'Coração verde', keywords: ['verde', 'esperança', 'whatsapp'] },
      { char: '💙', name: 'Coração azul', keywords: ['azul', 'confiança'] },
      { char: '💜', name: 'Coração roxo', keywords: ['roxo'] },
      { char: '🖤', name: 'Coração preto', keywords: ['preto'] },
      { char: '🤍', name: 'Coração branco', keywords: ['branco', 'paz'] },
      { char: '💔', name: 'Coração partido', keywords: ['triste', 'rompimento'] },
      { char: '✅', name: 'Check verde', keywords: ['certo', 'concluído', 'ok', 'aprovado'] },
      { char: '❌', name: 'Xis vermelho', keywords: ['erro', 'não', 'cancelado'] },
      { char: '⚠️', name: 'Aviso de atenção', keywords: ['atenção', 'cuidado', 'alerta'] },
      { char: '⚡', name: 'Raio de energia', keywords: ['rápido', 'energia', 'velocidade'] },
      { char: '⭐', name: 'Estrela amarela', keywords: ['estrela', 'avaliação', 'favorito'] },
      { char: '🌟', name: 'Estrela brilhante', keywords: ['brilho', 'destaque'] },
      { char: '📍', name: 'Pino de localização', keywords: ['local', 'mapa', 'endereço'] },
    ],
  },
  {
    id: 'flags',
    name: 'Bandeiras',
    icon: Flag,
    emojis: [
      { char: '🇧🇷', name: 'Bandeira do Brasil', keywords: ['brasil', 'brasileiro', 'br'] },
      { char: '🇺🇸', name: 'Bandeira dos Estados Unidos', keywords: ['eua', 'usa'] },
      { char: '🇵🇹', name: 'Bandeira de Portugal', keywords: ['portugal'] },
      { char: '🇦🇷', name: 'Bandeira da Argentina', keywords: ['argentina'] },
      { char: '🇪🇸', name: 'Bandeira da Espanha', keywords: ['espanha'] },
      { char: '🏁', name: 'Bandeira quadriculada', keywords: ['corrida', 'chegada'] },
    ],
  },
]

const STORAGE_KEY = 'lumix_recent_emojis'

export function WhatsAppEmojiPicker({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void
  onClose: () => void
}) {
  const [activeCategory, setActiveCategory] = useState<string>('smileys')
  const [search, setSearch] = useState<string>('')
  const [hoveredEmoji, setHoveredEmoji] = useState<{ char: string; name: string } | null>(null)
  const [recentEmojis, setRecentEmojis] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setRecentEmojis(JSON.parse(saved))
      }
    } catch {
      // ignore
    }
  }, [])

  const handleSelectEmoji = (char: string) => {
    onSelect(char)

    // Save to recents
    try {
      const updated = [char, ...recentEmojis.filter((e) => e !== char)].slice(0, 24)
      setRecentEmojis(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  // Filtered emojis based on search
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return null

    const matches: Array<{ char: string; name: string }> = []
    const seen = new Set<string>()

    for (const cat of EMOJI_CATEGORIES) {
      for (const emoji of cat.emojis) {
        if (
          emoji.name.toLowerCase().includes(q) ||
          emoji.keywords.some((k) => k.toLowerCase().includes(q))
        ) {
          if (!seen.has(emoji.char)) {
            seen.add(emoji.char)
            matches.push(emoji)
          }
        }
      }
    }

    return matches
  }, [search])

  return (
    <div
      ref={containerRef}
      className="absolute bottom-14 left-2 z-40 flex h-[350px] w-[360px] sm:w-[400px] flex-col rounded-2xl border border-[#d1d7db] bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Search Bar */}
      <div className="border-b border-[#e9edef] p-2.5">
        <div className="flex items-center rounded-lg bg-[#f0f2f5] px-3 py-1.5 focus-within:bg-white focus-within:ring-1 focus-within:ring-[#00a884]">
          <Search className="mr-2 size-4 text-[#54656f]" />
          <input
            type="text"
            placeholder="Pesquisar emoji..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-[#111b21] outline-none placeholder:text-[#8696a0]"
            autoFocus
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-[#8696a0] hover:text-[#111b21]"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Emoji Grid */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {searchResults !== null ? (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#667781]">
              Resultados ({searchResults.length})
            </p>
            {searchResults.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#667781]">
                Nenhum emoji encontrado para "{search}"
              </p>
            ) : (
              <div className="grid grid-cols-8 gap-1">
                {searchResults.map((emoji) => (
                  <button
                    key={emoji.char}
                    type="button"
                    onClick={() => handleSelectEmoji(emoji.char)}
                    onMouseEnter={() => setHoveredEmoji(emoji)}
                    className="grid size-9 place-items-center rounded-lg text-2xl transition hover:scale-115 hover:bg-[#f0f2f5] active:scale-95"
                  >
                    {emoji.char}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recents section if any */}
            {recentEmojis.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#667781]">
                  <Clock className="size-3.5" /> Mais Usados
                </p>
                <div className="grid grid-cols-8 gap-1">
                  {recentEmojis.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => handleSelectEmoji(char)}
                      onMouseEnter={() => setHoveredEmoji({ char, name: 'Emoji recente' })}
                      className="grid size-9 place-items-center rounded-lg text-2xl transition hover:scale-115 hover:bg-[#f0f2f5] active:scale-95"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Display categories */}
            {EMOJI_CATEGORIES.filter(
              (cat) => !activeCategory || activeCategory === cat.id,
            ).map((cat) => (
              <div key={cat.id} id={`emoji-cat-${cat.id}`}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#667781]">
                  {cat.name}
                </p>
                <div className="grid grid-cols-8 gap-1">
                  {cat.emojis.map((emoji) => (
                    <button
                      key={emoji.char}
                      type="button"
                      onClick={() => handleSelectEmoji(emoji.char)}
                      onMouseEnter={() => setHoveredEmoji(emoji)}
                      className="grid size-9 place-items-center rounded-lg text-2xl transition hover:scale-115 hover:bg-[#f0f2f5] active:scale-95"
                    >
                      {emoji.char}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hovered Emoji Preview Footer (WhatsApp Web style) */}
      <div className="flex h-10 items-center justify-between border-t border-[#e9edef] bg-[#f0f2f5] px-3 text-xs text-[#54656f]">
        <div className="flex items-center gap-2 truncate">
          {hoveredEmoji ? (
            <>
              <span className="text-xl">{hoveredEmoji.char}</span>
              <span className="truncate text-xs font-medium text-[#111b21]">
                {hoveredEmoji.name}
              </span>
            </>
          ) : (
            <span className="text-[11px] text-[#8696a0]">
              Passe o cursor sobre um emoji
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-[#00a884] hover:underline"
        >
          Fechar
        </button>
      </div>

      {/* Category Tabs Bar (Bottom Docked) */}
      <div className="flex items-center justify-around border-t border-[#e9edef] bg-white py-1.5">
        {EMOJI_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id)
                setSearch('')
              }}
              title={cat.name}
              className={`grid size-8 place-items-center rounded-lg transition ${
                isActive
                  ? 'border-b-2 border-[#00a884] text-[#00a884]'
                  : 'text-[#54656f] hover:bg-[#f0f2f5] hover:text-[#111b21]'
              }`}
            >
              <Icon className="size-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
