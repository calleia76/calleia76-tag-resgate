// Pergunta a senha do banco Supabase e grava DATABASE_URL/DIRECT_URL em .env.production,
// sem colchetes, sem linhas duplicadas e sem que a senha passe por chat/histórico.
// Uso (dentro de apps/backend): node scripts/configurar-banco-producao.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { Writable } from 'node:stream'

const REF = 'qinesvycyhoizznduqcq'
const HOST = 'aws-0-sa-east-1.pooler.supabase.com'
const ARQUIVO = new URL('../.env.production', import.meta.url)

let mudo = false
const saida = new Writable({
  write(chunk, _enc, cb) {
    if (!mudo) process.stdout.write(chunk)
    cb()
  },
})
const rl = createInterface({ input: process.stdin, output: saida, terminal: true })

process.stdout.write('Senha do banco Supabase (não aparece enquanto você digita): ')
mudo = true
rl.question('', (senha) => {
  mudo = false
  rl.close()
  process.stdout.write('\n')

  senha = senha.trim()
  if (!senha) return sair('Senha vazia. Nada foi alterado.')
  if (/[\[\]\s"]/.test(senha)) return sair('A senha tem colchetes, espaços ou aspas. Gere uma só com letras e números.')
  if (!/^[A-Za-z0-9]+$/.test(senha)) {
    console.log('Aviso: a senha tem símbolos; eles serão codificados na URL.')
  }
  const s = encodeURIComponent(senha)

  const linhas = existsSync(ARQUIVO) ? readFileSync(ARQUIVO, 'utf8').split(/\r?\n/) : []
  const resto = linhas.filter((l) => !/^(DATABASE_URL|DIRECT_URL)=/.test(l))
  const novas = [
    `DATABASE_URL="postgresql://postgres.${REF}:${s}@${HOST}:6543/postgres?pgbouncer=true"`,
    `DIRECT_URL="postgresql://postgres.${REF}:${s}@${HOST}:5432/postgres"`,
  ]
  // Mantém o resto do arquivo; coloca as duas linhas no lugar da primeira variável de banco.
  const idx = linhas.findIndex((l) => /^(DATABASE_URL|DIRECT_URL)=/.test(l))
  const saidaLinhas = idx === -1 ? [...resto, ...novas] : [...resto.slice(0, idx), ...novas, ...resto.slice(idx)]
  writeFileSync(ARQUIVO, saidaLinhas.join('\n').replace(/\n*$/, '\n'))
  console.log('Pronto: DATABASE_URL e DIRECT_URL gravadas em apps/backend/.env.production.')
})

function sair(msg) {
  console.log(msg)
  process.exit(1)
}
