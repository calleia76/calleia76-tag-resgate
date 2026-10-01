import 'dotenv/config'

function obrigatoria(nome: string, padrao?: string): string {
  const valor = process.env[nome] ?? padrao
  if (valor === undefined) throw new Error(`Variável de ambiente ausente: ${nome}`)
  return valor
}

export const config = {
  port: Number(process.env.PORT ?? 4001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  frontendUrl: obrigatoria('FRONTEND_URL', 'http://localhost:5174'),
  jwtSecret: obrigatoria('JWT_SECRET', 'dev-secret-troque-em-producao'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  smtp: {
    host: process.env.SMTP_HOST || null,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER || null,
    pass: process.env.SMTP_PASS || null,
    from: process.env.SMTP_FROM || 'TAG Resgate <nao-responda@exemplo.com>',
  },
}
