import { Request, Response } from 'express'
import { fichaService } from './ficha.service'
import { leitorEstaAutenticado } from '@/middlewares/auth.middleware'

export const fichaController = {
  async buscar(req: Request, res: Response) {
    const ficha = await fichaService.buscarPorToken(req.params.token, leitorEstaAutenticado(req))
    if (!ficha) return res.status(404).json({ error: 'Ficha não encontrada' })
    res.json(ficha)
  },
}
