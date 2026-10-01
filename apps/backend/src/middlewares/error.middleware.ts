import { NextFunction, Request, Response } from 'express'
import { logger } from '@/utils/logger'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err, 'Erro não tratado')
  res.status(500).json({ error: 'Erro interno. Tente novamente em instantes.' })
}
