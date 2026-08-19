import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import {
  corsOptions,
  createRateLimiter,
  rejectUnknownOrigin,
  requireTrustedBrowserOrigin,
  securityHeaders,
} from './middleware/security.js';
import { leadsRouter } from './routes/leads.js';
import { scenariosRouter } from './routes/scenarios.js';
import { webhookLeadsRouter } from './routes/webhookLeads.js';
import { whatsappRouter } from './routes/whatsapp.js';

const app = express();
const port = Number(process.env.PORT ?? 3001);
const host = process.env.API_HOST ?? '127.0.0.1';

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.use(securityHeaders);
app.use(rejectUnknownOrigin);
app.use(cors(corsOptions));
app.use(express.json({ limit: '16kb', strict: true, type: 'application/json' }));

const apiRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 120,
  message: 'Muitas requisições em pouco tempo. Aguarde um instante e tente novamente.',
});

const scenarioRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 80,
  message: 'Muitas consultas ao simulador. Aguarde um instante e tente novamente.',
});

const leadRateLimiter = createRateLimiter({
  windowMs: 10 * 60_000,
  maxRequests: 5,
  message: 'Muitas tentativas de envio. Aguarde alguns minutos antes de tentar novamente.',
});

const whatsappRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
  message: 'Muitos redirecionamentos em pouco tempo. Aguarde um instante e tente novamente.',
});

app.use('/api', apiRateLimiter);
app.use('/api/scenarios', scenarioRateLimiter, scenariosRouter);
app.use(
  '/api/leads',
  leadRateLimiter,
  requireTrustedBrowserOrigin(),
  (request, response, next) => {
    if (request.method === 'POST' && !request.is('application/json')) {
      response.status(415).json({
        ok: false,
        message: 'Envie os dados do formulário em JSON.',
      });
      return;
    }

    next();
  },
  leadsRouter,
);
app.use(
  '/api/webhooks',
  leadRateLimiter,
  requireTrustedBrowserOrigin(),
  (request, response, next) => {
    if (request.method === 'POST' && !request.is('application/json')) {
      response.status(415).json({
        ok: false,
        message: 'Envie os dados do formulário em JSON.',
      });
      return;
    }

    next();
  },
  webhookLeadsRouter,
);
app.use('/api/whatsapp', whatsappRateLimiter, whatsappRouter);

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'lumixengine-api' });
});

const jsonErrorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({
      ok: false,
      message: 'Não foi possível ler os dados enviados. Verifique o formulário e tente novamente.',
    });
    return;
  }

  next(error);
};

app.use(jsonErrorHandler);

app.use('/api', (_request, response) => {
  response.status(404).json({
    ok: false,
    message: 'Endpoint não encontrado.',
  });
});

const server = app.listen(port, host, () => {
  console.log(`LumixEngine API running at http://${host}:${port}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${port} is already in use. Stop the existing LumixEngine dev server or set PORT to another value.`,
    );
    process.exit(1);
  }

  throw error;
});
