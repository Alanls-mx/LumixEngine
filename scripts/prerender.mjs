import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectRoot, 'dist');
const templatePath = path.join(distDir, 'index.html');
const siteUrl = 'https://lumixengine.com';

const sharedHeader = `
  <header class="prerender-header">
    <a href="/" class="prerender-brand" aria-label="LumixEngine, página inicial">Lumix<span>Engine</span></a>
    <nav aria-label="Navegação principal">
      <a href="/portfolio">Portfólio</a>
      <a href="/#contato">Contato</a>
    </nav>
    <a href="/#contato" class="prerender-cta">Solicitar proposta</a>
  </header>`;

const sharedFooter = `
  <footer class="prerender-footer">
    <strong>LumixEngine</strong>
    <p>Soluções digitais sob medida para operações reais.</p>
    <nav aria-label="Links institucionais">
      <a href="/politica-de-privacidade">Política de Privacidade</a>
      <a href="/termos-de-uso">Termos de Uso</a>
    </nav>
  </footer>`;

const routes = [
  {
    path: '/',
    output: 'index.html',
    title: 'LumixEngine | Soluções digitais sob medida',
    description:
      'LumixEngine desenvolve sites, landing pages, lojas virtuais, sistemas web, automações e integrações sob medida para negócios locais.',
    image: '/og-image.png',
    type: 'WebSite',
    content: `
      ${sharedHeader}
      <main>
        <section class="prerender-hero">
          <p class="prerender-eyebrow">Projetos digitais para operações reais</p>
          <h1>Tecnologia construída em torno do seu negócio.</h1>
          <p>Sites, lojas virtuais, sistemas, automações e integrações desenvolvidos de acordo com o que sua operação realmente precisa.</p>
          <a class="prerender-cta" href="#contato">Solicitar proposta</a>
        </section>
        <section>
          <p class="prerender-eyebrow">Construção digital para a rotina</p>
          <h2>Soluções digitais para o que sua operação precisa</h2>
          <div class="prerender-grid">
            <article><h3>Sites, landing pages e lojas virtuais</h3><p>Páginas responsivas para apresentar o negócio, captar clientes, organizar catálogos e vender.</p></article>
            <article><h3>Sistemas web sob medida</h3><p>Dashboards, portais, CRMs e painéis desenvolvidos em torno da rotina da equipe.</p></article>
            <article><h3>Automações e integrações</h3><p>Fluxos que conectam atendimento, dados, pagamentos, APIs e serviços sem retrabalho manual.</p></article>
          </div>
        </section>
        <section>
          <h2>Projetos pensados da experiência à operação</h2>
          <p>Conheça soluções digitais documentadas por dentro, incluindo a experiência do público e as ferramentas de gestão.</p>
          <a href="/portfolio">Explorar o portfólio</a>
        </section>
        <section id="contato">
          <h2>Conte o que sua operação precisa resolver</h2>
          <p>A LumixEngine transforma processos, necessidades e oportunidades em um projeto digital próprio.</p>
        </section>
      </main>
      ${sharedFooter}`,
  },
  {
    path: '/portfolio',
    output: 'portfolio/index.html',
    title: 'Portfólio | LumixEngine',
    description:
      'Conheça projetos digitais desenvolvidos pela LumixEngine e explore cada experiência diretamente na página.',
    image: '/assets/portfolio/portfolio-hero.webp',
    type: 'CollectionPage',
    content: `
      ${sharedHeader}
      <main>
        <section class="prerender-hero">
          <h1>Produtos digitais construídos para operações reais</h1>
          <p>Sites, lojas virtuais, sistemas, automações e integrações desenvolvidos pela LumixEngine para transformar processos em experiências digitais completas.</p>
          <a class="prerender-cta" href="#cases">Ver cases</a>
        </section>
        <section>
          <h2>Soluções que assumem a forma do negócio</h2>
          <p>Cada projeto começa pelo problema operacional. A tecnologia, a interface e as integrações são definidas depois.</p>
          <div class="prerender-grid">
            <article><h3>Sites e comércio digital</h3><p>Experiências responsivas para apresentar, captar clientes, organizar catálogos e vender.</p></article>
            <article><h3>Sistemas web sob medida</h3><p>Painéis, portais e ferramentas internas desenhados em torno de cada operação.</p></article>
            <article><h3>Automações e integrações</h3><p>Atendimento, dados, pagamentos e serviços conectados em um único fluxo.</p></article>
          </div>
        </section>
        <section id="cases">
          <h2>Cases em destaque</h2>
          <article>
            <h3>Plataforma para cinemas</h3>
            <p>Ecossistema que conecta catálogo, venda, bilheteria, ingressos, bomboniere, clube, campanhas e gestão financeira.</p>
            <a href="/portfolio/plataforma-para-cinemas">Explorar o case completo</a>
          </article>
        </section>
        <section id="contato"><h2>A próxima solução começa pela sua operação.</h2><p>Conte o que precisa organizar, vender ou conectar.</p></section>
      </main>
      ${sharedFooter}`,
  },
  {
    path: '/portfolio/plataforma-para-cinemas',
    output: 'portfolio/plataforma-para-cinemas/index.html',
    title: 'Plataforma para cinemas | Portfólio LumixEngine',
    description:
      'Case de uma plataforma completa para cinemas, da descoberta de filmes à venda, operação e relacionamento.',
    image: '/assets/portfolio/cinemas/cinema-hero.webp',
    type: 'CreativeWork',
    content: `
      ${sharedHeader}
      <main>
        <section class="prerender-hero">
          <p class="prerender-eyebrow">Case de plataforma digital</p>
          <h1>Sites e sistemas para cinemas, da compra à operação</h1>
          <p>Projeto desenvolvido pela LumixEngine para reunir a experiência do público e as rotinas administrativas em uma plataforma sob medida.</p>
        </section>
        <section class="prerender-grid">
          <article><h2>O Desafio</h2><p>A jornada atravessa programação, escolha de assento, pagamento, bilheteria, bomboniere, acesso à sala, clube e comunicação. Canais isolados aumentam o atrito e reduzem a visibilidade da operação.</p></article>
          <article><h2>A Solução</h2><p>Um ecossistema único, responsivo e orientado aos dados reais acompanha a compra online, a venda no balcão, a emissão do ingresso, a entrega dos extras e a gestão financeira.</p></article>
        </section>
        <section>
          <h2>O que a plataforma conecta</h2>
          <ul>
            <li>Catálogo, sessões e selos editoriais</li><li>Assentos e reservas temporárias</li>
            <li>Pix, cartão, cupons e reembolsos</li><li>Ingresso digital, PDF e carteira</li>
            <li>Bomboniere, estoque e entrega</li><li>Clube, créditos e benefícios</li>
            <li>Campanhas e modelos de e-mail</li><li>Dashboard financeiro e operacional</li>
          </ul>
        </section>
        <section><h2>Uma jornada, vista em contexto</h2><p>Interfaces e simulações ilustrativas mostram como cada etapa reduz atrito sem esconder informações importantes da equipe.</p></section>
        <section><h2>Conheça outros projetos</h2><a href="/portfolio">Ver portfólio</a></section>
      </main>
      ${sharedFooter}`,
  },
  {
    path: '/politica-de-privacidade',
    output: 'politica-de-privacidade/index.html',
    title: 'Política de Privacidade | LumixEngine',
    description: 'Saiba quais dados a LumixEngine trata, para quais finalidades, como funcionam os cookies opcionais e como exercer seus direitos pela LGPD.',
    image: '/og-image.png',
    type: 'WebPage',
    content: `
      ${sharedHeader}
      <main><section class="prerender-hero"><h1>Política de Privacidade</h1><p>Este documento explica quais dados a LumixEngine trata quando você navega pelo site, solicita um orçamento ou inicia uma conversa pelos canais indicados.</p><p>Atualizada em 13 de setembro de 2026.</p></section>
      <section><h2>1. Controlador e escopo</h2><p>A LumixEngine é operada por 68.685.237 Alan Luiz da Silva, CNPJ 68.685.237/0001-97. Esta política abrange lumixengine.com, seus formulários comerciais e os dados encaminhados ao LumixEngine App.</p>
      <h2>2. Dados que podem ser tratados</h2><p>Podemos tratar nome, e-mail, telefone, mensagem, solução de interesse, faixa de investimento, contexto da página, navegador, idioma, fuso horário, parâmetros de campanha, endereço IP e dados técnicos de segurança.</p>
      <h2>3. Finalidades e bases legais</h2><p>Os dados são usados para responder solicitações, preparar propostas, organizar o relacionamento comercial, proteger os serviços e cumprir obrigações aplicáveis. A medição opcional depende de consentimento.</p>
      <h2>4. Compartilhamento e operadores</h2><p>Fornecedores de hospedagem, segurança, comunicação, CRM e análise podem processar apenas os dados necessários à sua função. Links externos passam a observar também as políticas das plataformas acessadas.</p>
      <h2>5. Cookies, armazenamento local e medição</h2><p>A escolha de consentimento é armazenada localmente. Google Analytics e Meta Pixel não são carregados antes do aceite e podem ser recusados ou revogados nas Configurações de Cookies.</p>
      <h2>6. Retenção e segurança</h2><p>Dados são mantidos enquanto necessários às finalidades informadas, à relação comercial e às obrigações legais. Aplicamos HTTPS, validação, limitação de requisições e acesso administrativo autenticado.</p>
      <h2>7. Processamento em outros países</h2><p>Fornecedores globais podem processar dados fora do Brasil mediante medidas adequadas ao tratamento.</p>
      <h2>8. Seus direitos</h2><p>Você pode solicitar confirmação, acesso, correção, informação sobre compartilhamento, portabilidade, bloqueio, anonimização ou eliminação quando aplicável, além de revogar consentimento.</p>
      <h2>9. Crianças e dados sensíveis</h2><p>O site é destinado a contatos profissionais e não solicita intencionalmente dados de crianças, adolescentes ou dados pessoais sensíveis.</p>
      <h2>10. Contato e atualizações</h2><p>Solicitações sobre privacidade podem ser enviadas para contact@lumixengine.com.</p></section></main>
      ${sharedFooter}`,
  },
  {
    path: '/termos-de-uso',
    output: 'termos-de-uso/index.html',
    title: 'Termos de Uso | LumixEngine',
    description: 'Confira as condições de uso do site, do portfólio, das demonstrações e dos canais comerciais da LumixEngine.',
    image: '/og-image.png',
    type: 'WebPage',
    content: `
      ${sharedHeader}
      <main><section class="prerender-hero"><h1>Termos de Uso</h1><p>Estes termos regulam a navegação no site institucional da LumixEngine, o acesso ao portfólio e o uso dos canais de contato comercial.</p><p>Atualizados em 13 de setembro de 2026.</p></section>
      <section><h2>1. Identificação e aceite</h2><p>O site é mantido pela LumixEngine, operada por 68.685.237 Alan Luiz da Silva, CNPJ 68.685.237/0001-97. A Política de Privacidade complementa estes Termos.</p>
      <h2>2. Finalidade do site</h2><p>O site apresenta capacidades, projetos e formas de contato. Formulários e diagnósticos iniciais não constituem contratação automática ou garantia de resultado.</p>
      <h2>3. Portfólio, demonstrações e resultados</h2><p>Cases, telas, fluxos e métricas podem usar dados fictícios, imagens ilustrativas ou informações anonimizadas. Cada novo projeto depende de escopo próprio.</p>
      <h2>4. Uso permitido e condutas vedadas</h2><p>Não é permitido explorar vulnerabilidades, contornar limites, enviar conteúdo ilícito, extrair conteúdo em massa ou usar a marca de modo enganoso.</p>
      <h2>5. Propriedade intelectual</h2><p>Marca, textos, layout, componentes, código e materiais próprios são protegidos. Direitos de terceiros permanecem com seus titulares.</p>
      <h2>6. Links e serviços externos</h2><p>WhatsApp, redes sociais e outros serviços externos possuem termos e políticas próprios.</p>
      <h2>7. Disponibilidade e responsabilidade</h2><p>O site pode passar por manutenção e depender de terceiros. Informações pontualmente imprecisas serão corrigidas quando identificadas.</p>
      <h2>8. Privacidade e comunicações</h2><p>Dados pessoais seguem a Política de Privacidade. O envio de formulário autoriza o retorno relacionado à solicitação informada.</p>
      <h2>9. Alterações e legislação aplicável</h2><p>Aplicam-se as leis brasileiras, preservados os direitos do consumidor quando cabíveis.</p>
      <h2>10. Contato</h2><p>Dúvidas podem ser enviadas para contact@lumixengine.com.</p></section></main>
      ${sharedFooter}`,
  },
];

const prerenderStyles = `<style id="prerender-styles">
  .prerender-only{min-height:100vh;background:#070b13;color:#e2e8f0;font-family:"Plus Jakarta Sans",system-ui,sans-serif}
  .prerender-header,.prerender-footer,.prerender-only main>section{box-sizing:border-box;width:min(100% - 2.5rem,80rem);margin-inline:auto}
  .prerender-header{min-height:5rem;display:flex;align-items:center;gap:2rem;border-bottom:1px solid #1e293b}
  .prerender-header nav{display:flex;gap:1.5rem;margin-left:auto}.prerender-header a,.prerender-footer a,.prerender-only main a{color:#a7f3d0}
  .prerender-brand{font-size:1.5rem;font-weight:800;text-decoration:none;color:#fff!important}.prerender-brand span{color:#60a5fa}
  .prerender-cta{display:inline-block;width:max-content;border-radius:.5rem;background:#34d399!important;color:#07130f!important;padding:.75rem 1.25rem;font-weight:800;text-decoration:none}
  .prerender-only main>section{padding-block:4.5rem;border-bottom:1px solid #1e293b}.prerender-hero{min-height:32rem;display:flex;flex-direction:column;justify-content:center}
  .prerender-only h1{max-width:15ch;margin:.5rem 0 1.5rem;color:#fff;font-size:clamp(2.5rem,7vw,5rem);line-height:1.05}.prerender-only h2{color:#fff;font-size:2rem}.prerender-only h3{color:#fff;font-size:1.2rem}
  .prerender-only p,.prerender-only li{max-width:68ch;line-height:1.75}.prerender-eyebrow{color:#6ee7b7;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
  .prerender-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:2rem}.prerender-footer{padding-block:3rem}.prerender-footer nav{display:flex;flex-wrap:wrap;gap:1rem}
  @media(max-width:640px){.prerender-header{gap:1rem}.prerender-header nav{display:none}.prerender-header .prerender-cta{margin-left:auto;font-size:.75rem}.prerender-only main>section{padding-block:3rem}}
</style>`;

function replaceMeta(html, selector, value) {
  const escaped = value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  const pattern = new RegExp(`(<meta\\s+${selector}\\s+content=")[^"]*("\\s*\\/?>)`, 'i');
  return html.replace(pattern, `$1${escaped}$2`);
}

function renderRoute(template, route) {
  const canonical = `${siteUrl}${route.path === '/' ? '/' : route.path}`;
  const image = `${siteUrl}${route.image}`;
  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': route.type,
    name: route.title,
    description: route.description,
    url: canonical,
    publisher: { '@type': 'Organization', name: 'LumixEngine', url: siteUrl },
  }).replaceAll('<', '\\u003c');

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${route.title}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`)
    .replace('</head>', `${prerenderStyles}<script type="application/ld+json">${structuredData}</script></head>`)
    .replace('<div id="root"></div>', `<div id="root"><div class="prerender-only">${route.content}</div></div>`);

  html = replaceMeta(html, 'name="description"', route.description);
  html = replaceMeta(html, 'name="robots"', 'index, follow');
  html = replaceMeta(html, 'property="og:title"', route.title);
  html = replaceMeta(html, 'property="og:description"', route.description);
  html = replaceMeta(html, 'property="og:url"', canonical);
  html = replaceMeta(html, 'property="og:image"', image);
  html = replaceMeta(html, 'property="og:image:secure_url"', image);
  html = replaceMeta(html, 'name="twitter:title"', route.title);
  html = replaceMeta(html, 'name="twitter:description"', route.description);
  html = replaceMeta(html, 'name="twitter:image"', image);

  return html;
}

const template = await readFile(templatePath, 'utf8');

for (const route of routes) {
  const outputPath = path.join(distDir, route.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderRoute(template, route), 'utf8');
}

const notFound = renderRoute(template, {
  path: '/404',
  title: 'Página não encontrada | LumixEngine',
  description: 'A página solicitada não foi encontrada. Volte para a LumixEngine e conheça nossas soluções digitais.',
  image: '/og-image.png',
  type: 'WebPage',
  content: `${sharedHeader}<main><section class="prerender-hero"><p class="prerender-eyebrow">Erro 404</p><h1>Página não encontrada</h1><p>O endereço informado não existe ou foi alterado.</p><a class="prerender-cta" href="/">Voltar para o início</a></section></main>${sharedFooter}`,
}).replace('<meta name="robots" content="index, follow"', '<meta name="robots" content="noindex, follow"');

await writeFile(path.join(distDir, '404.html'), notFound, 'utf8');

console.log(`Pre-rendered ${routes.length} public routes and the 404 fallback.`);
