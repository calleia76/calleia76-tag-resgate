import { Router } from 'express'
import multer from 'multer'
import { authController } from './auth.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { loginRateLimiter, cadastroRateLimiter, esqueciSenhaRateLimiter, redefinirSenhaRateLimiter } from '@/middlewares/rate-limit'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return cb(new Error('Formato de imagem não suportado. Use JPEG, PNG ou WEBP.'))
    }
    cb(null, true)
  },
})

export const authRoutes = Router()

authRoutes.post('/cadastro', cadastroRateLimiter, authController.cadastrar)
authRoutes.post('/login', loginRateLimiter, authController.login)
authRoutes.post('/esqueci-senha', esqueciSenhaRateLimiter, authController.solicitarResetSenha)
authRoutes.post('/redefinir-senha', redefinirSenhaRateLimiter, authController.redefinirSenhaComCodigo)
authRoutes.get('/me', authMiddleware, authController.me)
authRoutes.put('/me', authMiddleware, authController.atualizarMe)
authRoutes.post('/me/foto', authMiddleware, upload.single('foto'), authController.uploadFoto)
authRoutes.put('/senha', authMiddleware, authController.trocarSenha)
