// Aplica as migrations no banco de teste (tagresgate_test, ver docker-compose.yml) e roda o vitest.
import { spawnSync } from 'node:child_process'

const URL_TESTE = 'postgresql://tagresgate:tagresgate@localhost:5433/tagresgate_test'
const env = { ...process.env, DATABASE_URL: URL_TESTE, DIRECT_URL: URL_TESTE }
const rodar = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit', env, shell: true }).status ?? 1

if (rodar('npx', ['prisma', 'migrate', 'deploy']) !== 0) process.exit(1)
process.exit(rodar('npx', ['vitest', 'run', ...process.argv.slice(2)]))
