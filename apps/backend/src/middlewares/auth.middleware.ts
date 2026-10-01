import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '@/config/env'

export interface AuthRequest extends Request {
  usuarioId?: string
}

interface TokenPayload {
  sub: string
}

/** Exige um token válido (Bearer) — usado nas rotas de self-service (`/api/auth/me`, etc.). */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Não autenticado' })

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as TokenPayload
    req.usuarioId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'Sessão inválida ou expirada' })
  }
}

/** true se o pedido trouxer um token válido — usado na ficha pública para decidir se quem está
 *  lendo "conta como logado" o suficiente para ver campos marcados como privados. Nunca bloqueia
 *  a requisição: a ficha pública é sempre acessível, só muda o que ela mostra. */
export function leitorEstaAutenticado(req: Request): boolean {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return false
  try {
    jwt.verify(header.slice(7), config.jwtSecret)
    return true
  } catch {
    return false
  }
}
