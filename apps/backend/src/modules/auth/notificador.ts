import nodemailer from 'nodemailer'
import { config } from '@/config/env'
import { logger } from '@/utils/logger'

/** Canal único de envio do código de "esqueci minha senha" — por e-mail (SMTP), configurável
 *  por variável de ambiente. Sem SMTP configurado (padrão em desenvolvimento), o código só é
 *  registrado no log do backend, para dar pra testar o fluxo sem precisar de um provedor real.
 *  Trocar de provedor (SMTP próprio, SES, Resend etc.) é só reimplementar esta função — nada
 *  mais no sistema depende de como o código chega até a pessoa. */
export async function enviarCodigoReset(email: string, codigo: string): Promise<void> {
  if (!config.smtp.host) {
    logger.warn(`[DEV] SMTP não configurado — código de redefinição de senha para ${email}: ${codigo}`)
    return
  }

  const transportador = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass ?? undefined } : undefined,
  })

  await transportador.sendMail({
    from: config.smtp.from,
    to: email,
    subject: 'TAG Resgate — Código para redefinir sua senha',
    text: `Seu código para redefinir a senha é: ${codigo}\n\nVálido por 10 minutos. Se não foi você quem pediu, ignore esta mensagem.`,
  })
}
