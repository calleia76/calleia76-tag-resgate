# TAG Resgate

Identificação de emergência por NFC/QR — cadastro livre, autoatendimento (login próprio por
e-mail/senha), ficha de saúde/contato de emergência e leitura pública sem login.

Projeto **independente** do SAER SISTEMA: código, backend e banco de dados próprios, sem
nenhuma dependência de arquivos, API ou banco daquele sistema.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind + React Router + TanStack Query.
- **Backend:** Node.js + Express + TypeScript + Prisma.
- **Banco:** SQLite local por padrão (zero configuração). Para produção, troque o `provider` em
  `apps/backend/prisma/schema.prisma` para `postgresql` e aponte `DATABASE_URL` para um Postgres
  próprio (ex.: um projeto Supabase novo, só desta aplicação).
- **Fotos:** salvas em disco local (`apps/backend/uploads/`), servidas em `/uploads`. Para
  produção numa VPS, basta manter essa pasta persistida fora do processo de deploy.
- **"Esqueci minha senha":** código de 6 dígitos por e-mail (SMTP, configurável em `.env`). Sem
  SMTP configurado, o código só aparece no log do backend — útil para testar sem precisar de um
  provedor real (ver `apps/backend/src/modules/auth/notificador.ts`).

## Como rodar

```bash
npm install
cp .env.example apps/backend/.env
npm run db:generate
npm run db:migrate
npm run dev
```

- Frontend: http://localhost:5174
- Backend: http://localhost:4001 (health check em `/api/health`)

## Fluxo

1. `/` — landing pública, explica o produto.
2. `/cadastro` — cadastro livre (nome, e-mail/senha, dados de saúde e contato de emergência).
3. `/entrar` — login por e-mail/senha; "esqueci minha senha" por código enviado por e-mail.
4. `/painel` — self-service: edita a própria ficha, marca campos como privados, troca a foto e a
   senha, e vê o **QR code/link da própria tag** (gerado automaticamente no cadastro).
5. `/ficha/:token` — página pública (sem login), aberta ao aproximar o celular de uma tag NFC ou
   ler o QR code. Mostra só saúde e contato de emergência; campos marcados como privados só
   aparecem para quem acessa logado.

## Pendências conhecidas antes de produção

- Trocar `JWT_SECRET` por um segredo forte.
- Configurar SMTP real (`SMTP_*` no `.env`) para o "esqueci minha senha" funcionar fora do
  ambiente de desenvolvimento.
- Decidir o armazenamento de fotos em produção (disco persistente na VPS é suficiente para
  começar; um bucket S3-compatível é mais robusto a longo prazo).
- Migrar de SQLite para Postgres antes de qualquer uso com mais de um usuário simultâneo
  gravando dados (SQLite não foi pensado para concorrência de escrita).
