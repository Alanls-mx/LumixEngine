# LumixEngine | Landing Page & API

Landing page de alta conversão e API REST para a **LumixEngine**, focada em captação de clientes e apresentação de soluções digitais sob medida: sites, lojas virtuais, sistemas web, dashboards, CRMs, automações e integrações para negócios locais.

---

## Tecnologias

- **React 18** (Interface declarativa e componentes modulares)
- **TypeScript** (Tipagem estática e segurança)
- **Vite 6** (Build rápido e HMR para desenvolvimento ágil)
- **Tailwind CSS 3.4** (Estilização moderna com paleta escura e efeitos de brilho)
- **Framer Motion 11** (Animações fluidas e micro-interações)
- **Lucide React** (Ícones modernos e consistentes)

---

## Estrutura do Projeto

```text
LumixEngine/
├── public/
│   └── favicon.svg             # Favicon vetorial da aplicação
├── src/
│   ├── assets/                 # Imagens, mídias e vetores locais
│   │   └── README.md
│   ├── components/             # Componentes modulares da landing page
│   │   ├── Hero.tsx            # Seção principal com copy e CTAs
│   │   ├── MockChat.tsx        # Simulação animada do WhatsApp
│   │   ├── Solucoes.tsx        # Grid de serviços e soluções
│   │   ├── Testimonials.tsx    # Depoimentos e prova social
│   │   └── FAQ.tsx             # Accordion de perguntas frequentes
│   ├── constants/
│   │   └── content.ts          # Central de textos, contatos e links de WhatsApp
│   ├── App.tsx                 # Componente orquestrador da página
│   ├── index.css               # Estilos globais e utilitários Tailwind
│   ├── main.tsx                # Ponto de entrada (Entrypoint) React
│   └── vite-env.d.ts           # Tipagens de ambiente do Vite
├── index.html                  # HTML base da aplicação
├── package.json                # Dependências e scripts do projeto
├── postcss.config.js           # Configuração do PostCSS
├── tailwind.config.ts          # Configuração de tema e cores do Tailwind
├── tsconfig.json               # Configuração raiz do TypeScript
└── vite.config.ts              # Configuração do bundler Vite
```

---

## Arquivo Principal e Ponto de Entrada

1. **HTML**: [`index.html`](file:///c:/Users/alanl/Downloads/LumixEngine/index.html) carrega as fontes e monta o elemento `#root`.
2. **Entrypoint React**: [`src/main.tsx`](file:///c:/Users/alanl/Downloads/LumixEngine/src/main.tsx) inicializa o React no elemento `#root` e importa o [`src/index.css`](file:///c:/Users/alanl/Downloads/LumixEngine/src/index.css).
3. **Página Principal**: [`src/App.tsx`](file:///c:/Users/alanl/Downloads/LumixEngine/src/App.tsx) orquestra todas as seções da landing page na ordem correta:
   - `<Hero />` (incluindo `<MockChat />`)
   - `<Solucoes />`
   - `<Testimonials />`
   - `<FAQ />`

---

## Como Personalizar Links e Textos

Para alterar números de WhatsApp, mensagens personalizadas de contato, serviços, depoimentos ou perguntas do FAQ, edite diretamente o arquivo:

**[`src/constants/content.ts`](file:///c:/Users/alanl/Downloads/LumixEngine/src/constants/content.ts)**

- **Número de Telefone**: Edite `company.phone` (formato DDI + DDD + Número, ex: `'5511999999999'`).
- **Mensagens dos Botões**: Edite o objeto `whatsappMessages`.
- **Serviços & Itens**: Edite `servicesContent.items`.
- **Perguntas do FAQ**: Edite o array `faqItems` em [`src/components/FAQ.tsx`](file:///c:/Users/alanl/Downloads/LumixEngine/src/components/FAQ.tsx).

---

## Comandos para Execução Local

No terminal do projeto (ou via Antigravity):

### 1. Iniciar em Modo de Desenvolvimento
```bash
npm run dev
```
O servidor estará disponível em `http://localhost:5173`.

### 2. Gerar Build de Produção
```bash
npm run build
```
O frontend otimizado será gerado no diretório `/dist` e o backend compilado em `/server/dist`.

### 3. Pré-visualizar o Build de Produção
```bash
npm run preview
```

### 4. Rodar a API compilada
```bash
npm run start:server:prod
```

---

## Deploy no Render

O projeto inclui um `render.yaml` na raiz para provisionar dois serviços:

- `lumixengine-frontend`: Static Site com publish path `./dist`.
- `lumixengine-api`: Web Service Node com health check em `/api/health`.

No Render:

1. Acesse **New > Blueprint**.
2. Conecte o repositório GitHub.
3. Selecione o arquivo `render.yaml`.
4. Preencha `VITE_GA_ID` e `VITE_META_PIXEL_ID` se for usar analytics.
5. Aponte o domínio `lumixengine.com` para o serviço `lumixengine-frontend`.

Comandos usados pelo Render:

```bash
npm run build:frontend
npm run build:server
npm run start:server:prod
```
