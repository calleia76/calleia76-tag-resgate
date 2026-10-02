import 'dotenv/config'
import path from 'node:path'

function obrigatoria(nome: string, padrao?: string): string {
  const valor = process.env[nome] ?? padrao
  if (valor === undefined) throw new Error(`Variável de ambiente ausente: ${nome}`)
  return valor
}

const SEGREDOS_FRACOS = [
  'dev-secret-troque-em-producao',
  'troque-por-um-segredo-forte-antes-de-ir-para-producao',
]

function validarProducao(): void {
  if (process.env.NODE_ENV !== 'production') return
  const segredo = process.env.JWT_SECRET
  if (!segredo || SEGREDOS_FRACOS.includes(segredo) || segredo.length < 32) {
    throw new Error(
      'JWT_SECRET ausente, padrão ou com menos de 32 caracteres. Defina um segredo forte em produção.',
    )
  }
}

validarProducao()

/** Em produção o código de "esqueci minha senha" só chega por e-mail; sem SMTP ele iria para o
 *  log do servidor, então melhor falhar na subida do que descobrir isso depois. */
function validarSmtpProducao(): void {
  if (process.env.NODE_ENV === 'production' && !process.env.SMTP_HOST) {
    throw new Error('SMTP_HOST ausente. Configure o SMTP_* para o "esqueci minha senha" em produção.')
  }
}

validarSmtpProducao()

export const config = {
  port: Number(process.env.PORT ?? 4001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  frontendUrl: obrigatoria('FRONTEND_URL', 'http://localhost:5174'),
  jwtSecret: obrigatoria('JWT_SECRET', 'dev-secret-troque-em-producao'),
  uploadsDir: process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(__dirname, '../../uploads'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  smtp: {
    host: process.env.SMTP_HOST || null,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER || null,
    pass: process.env.SMTP_PASS || null,
    from: process.env.SMTP_FROM || 'TAG Resgate <nao-responda@exemplo.com>',
  },
}
