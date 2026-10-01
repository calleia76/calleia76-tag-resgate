import { Response } from 'express'
import { authService } from './auth.service'
import { salvarFoto } from './foto.storage'
import { AuthRequest } from '@/middlewares/auth.middleware'

function tratarErro(res: Response, err: unknown) {
  const msg = (err as Error).message
  const status = msg.includes('Já existe um cadastro') ? 409
    : msg.includes('Credenciais inválidas') || msg.includes('incorreta') || msg.includes('Código inválido') ? 401
    : msg.includes('não encontrado') ? 404
    : 400
  res.status(status).json({ error: msg })
}

export const authController = {
  async cadastrar(req: AuthRequest, res: Response) {
    try {
      const resultado = await authService.cadastrar(req.body)
      res.status(201).json(resultado)
    } catch (err) { tratarErro(res, err) }
  },

  async login(req: AuthRequest, res: Response) {
    try {
      const { email, senha } = req.body as { email?: string; senha?: string }
      const resultado = await authService.login(email ?? '', senha ?? '')
      res.json(resultado)
    } catch (err) { tratarErro(res, err) }
  },

  async me(req: AuthRequest, res: Response) {
    try {
      const ficha = await authService.meusDados(req.usuarioId!)
      res.json(ficha)
    } catch (err) { tratarErro(res, err) }
  },

  async atualizarMe(req: AuthRequest, res: Response) {
    try {
      const ficha = await authService.atualizarMeusDados(req.usuarioId!, req.body)
      res.json(ficha)
    } catch (err) { tratarErro(res, err) }
  },

  async solicitarResetSenha(req: AuthRequest, res: Response) {
    try {
      const { email } = req.body as { email?: string }
      await authService.solicitarResetSenha(email ?? '')
      res.json({ ok: true, mensagem: 'Se o e-mail tiver uma conta, enviamos um código para redefinir a senha.' })
    } catch (err) { tratarErro(res, err) }
  },

  async redefinirSenhaComCodigo(req: AuthRequest, res: Response) {
    try {
      const { email, codigo, novaSenha } = req.body as { email?: string; codigo?: string; novaSenha?: string }
      await authService.redefinirSenhaComCodigo(email ?? '', codigo ?? '', novaSenha ?? '')
      res.json({ ok: true })
    } catch (err) { tratarErro(res, err) }
  },

  async uploadFoto(req: AuthRequest & { file?: Express.Multer.File }, res: Response) {
    try {
      if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' })
      const caminho = await salvarFoto(req.file.buffer, req.file.mimetype)
      const resultado = await authService.uploadFoto(req.usuarioId!, caminho)
      res.json(resultado)
    } catch (err) { tratarErro(res, err) }
  },

  async trocarSenha(req: AuthRequest, res: Response) {
    try {
      const { senhaAtual, novaSenha } = req.body as { senhaAtual?: string; novaSenha?: string }
      await authService.trocarSenha(req.usuarioId!, senhaAtual ?? '', novaSenha ?? '')
      res.json({ ok: true })
    } catch (err) { tratarErro(res, err) }
  },
}
