import { Router } from 'express'
import { fichaController } from './ficha.controller'

// Rota pública, deliberadamente SEM authMiddleware: é lida por quem aproxima o celular de uma
// tag NFC ou escaneia o QR, sem login. O token em si é o controle de acesso — opaco, gerado só
// no cadastro (ver auth.service.ts).
export const fichaRoutes = Router()

fichaRoutes.get('/:token', fichaController.buscar)
