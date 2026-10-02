# Deploy — Hostinger (Node.js Web App)

O app roda como **um único processo Node**: o backend Express entrega a API (`/api`), as fotos
(`/uploads`) e o site (build do Vite). Um domínio, um deploy.

## Pré-requisitos
- Plano de hospedagem Hostinger com **Node.js Web App** (Business/Cloud) apontando para
  `tagresgate.com.br`.
- Banco: Supabase (já criado, tabela `Usuario` aplicada). Ver `apps/backend/.env.production`.
- Código no GitHub (`calleia76/calleia76-tag-resgate`) — a Hostinger importa por Git.

## Configuração do Node.js Web App
| Campo | Valor |
|---|---|
| Framework | Express.js / Other |
| Versão do Node | 20 ou 22 |
| Diretório raiz | `/` (raiz do repositório) |
| Install command | `npm install` |
| Build command | `npm run build` |
| Start command | `npm run start` |
| Arquivo de entrada (se pedir) | `apps/backend/dist/server.js` |

## Variáveis de ambiente (painel do app)
Copie cada linha de `apps/backend/.env.production` (não suba o arquivo para o Git):
`NODE_ENV`, `FRONTEND_URL`, `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `UPLOADS_DIR`.

- `PORT`: normalmente a Hostinger define sozinha; só preencha se o painel pedir.
- `UPLOADS_DIR`: pasta **fora** da pasta do app, para as fotos sobreviverem a novos deploys
  (ex.: `/home/<usuario>/tagresgate-uploads`). Crie a pasta antes. Confirme o caminho real do
  seu usuário no painel/terminal da Hostinger.

## Migrations
Já aplicadas no Supabase (`init`). Para mudanças futuras no schema, com `DIRECT_URL` definido:
`npm run db:migrate:prod`.

## DNS
Com o plano criado e o domínio associado, a Hostinger configura os registros sozinha se o
domínio usar os nameservers dela. Hoje os nameservers são `*.dns-parking.com` (padrão da
Hostinger), então basta associar o domínio ao app no painel.

## Conferência pós-deploy
1. `https://tagresgate.com.br/api/health` retorna `{"status":"ok",...}`.
2. `/` abre a landing; `/cadastro` abre sem 404 ao recarregar a página.
3. Cadastre uma conta de teste, abra `/painel` e a ficha pública `/ficha/<token>`.
4. "Esqueci minha senha": o código chega por e-mail.
5. Suba uma foto, faça um novo deploy e confirme que a foto continua lá (testa o `UPLOADS_DIR`).
