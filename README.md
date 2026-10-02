# TAG Resgate

Identificação de emergência por NFC/QR — cadastro livre, autoatendimento (login próprio por
e-mail/senha), ficha de saúde/contato de emergência e leitura pública sem login.

Projeto **independente** do SAER SISTEMA: código, backend e banco de dados próprios, sem
nenhuma dependência de arquivos, API ou banco daquele sistema.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind + React Router + TanStack Query.
- **Backend:** Node.js + Express + TypeScript + Prisma.
- **Banco:** Postgres. Local via `docker compose up -d` (porta 5433, ver `docker-compose.yml`); em
  produção, um Postgres próprio apontado por `DATABASE_URL`.
- **Fotos:** salvas em disco (`UPLOADS_DIR`, padrão `apps/backend/uploads/`), servidas em
  `/uploads`. Em produção, aponte `UPLOADS_DIR` para um volume persistente fora da pasta de deploy.
- **"Esqueci minha senha":** código de 6 dígitos por e-mail (SMTP, configurável em `.env`). Em
  desenvolvimento, sem SMTP, o código aparece no log do backend; em produção o backend exige
  `SMTP_HOST` para iniciar (ver `apps/backend/src/modules/auth/notificador.ts`).

## Como rodar

```bash
npm install
docker compose up -d
cp .env.example apps/backend/.env
npm run db:generate
npm run db:migrate
npm run dev
```

- Frontend: http://localhost:5174
- Backend: http://localhost:4001 (health check em `/api/health`)
- Testes do backend: `npm test --workspace=apps/backend` (usa o banco `tagresgate_test`; crie-o
  uma vez com `docker compose exec db psql -U tagresgate -c "CREATE DATABASE tagresgate_test"`).

## Fluxo

1. `/` — landing pública, explica o produto.
2. `/cadastro` — cadastro livre (nome, e-mail/senha, dados de saúde e contato de emergência).
3. `/entrar` — login por e-mail/senha; "esqueci minha senha" por código enviado por e-mail.
4. `/painel` — self-service: edita a própria ficha, marca campos como privados, troca a foto e a
   senha, e vê o **QR code/link da própria tag** (gerado automaticamente no cadastro).
5. `/ficha/:token` — página pública (sem login), aberta ao aproximar o celular de uma tag NFC ou
   ler o QR code. Mostra só saúde e contato de emergência; campos marcados como privados só
   aparecem para quem acessa logado.

## Antes de subir em produção

- `NODE_ENV=production` com `JWT_SECRET` forte (mín. 32 caracteres, ex.: `openssl rand -hex 32`)
  e `SMTP_*` configurado — o backend se recusa a iniciar sem eles.
- `DATABASE_URL` de um Postgres de produção e `npm run db:migrate:prod` no deploy.
- `UPLOADS_DIR` num volume persistente (ou migrar as fotos para um bucket S3-compatível).
