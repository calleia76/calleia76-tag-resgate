import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const enviados: { email: string; codigo: string }[] = []
vi.mock('./notificador', () => ({
  enviarCodigoReset: async (email: string, codigo: string) => {
    enviados.push({ email, codigo })
  },
}))

import { prisma } from '@/database/prisma'
import { authService } from './auth.service'
import { fichaService } from '@/modules/ficha/ficha.service'

const EMAIL = 'teste@exemplo.com'

beforeAll(async () => {
  await prisma.usuario.deleteMany()
})
beforeEach(async () => {
  await prisma.usuario.deleteMany()
  enviados.length = 0
})
afterAll(async () => {
  await prisma.usuario.deleteMany()
  await prisma.$disconnect()
})

const cadastro = (extra = {}) => authService.cadastrar({ nome: 'Teste', email: EMAIL, senha: 'senha123', ...extra })

describe('cadastro e login', () => {
  it('cadastra, normaliza o e-mail e gera token da tag', async () => {
    const { usuario } = await authService.cadastrar({ nome: 'Teste', email: '  TESTE@Exemplo.com ', senha: 'senha123' })
    expect(usuario.emergenciaToken).toBeTruthy()
    expect((await authService.login(EMAIL, 'senha123')).usuario.id).toBe(usuario.id)
  })

  it('rejeita e-mail duplicado, senha curta e senha errada', async () => {
    await cadastro()
    await expect(cadastro()).rejects.toThrow('Já existe')
    await expect(authService.cadastrar({ nome: 'X', email: 'x@y.com', senha: '123' })).rejects.toThrow('6 caracteres')
    await expect(authService.login(EMAIL, 'errada')).rejects.toThrow('Credenciais inválidas')
  })
})

describe('ficha pública', () => {
  it('oculta campos privados para anônimo e mostra para logado', async () => {
    const { usuario } = await cadastro({ tipo_sanguineo: 'A+', tag_campos_privados: ['tipo_sanguineo'] })
    const anonimo = await fichaService.buscarPorToken(usuario.emergenciaToken, false)
    const logado = await fichaService.buscarPorToken(usuario.emergenciaToken, true)
    expect(anonimo?.tipo_sanguineo).toBeNull()
    expect(logado?.tipo_sanguineo).toBe('A+')
    expect(await fichaService.buscarPorToken('inexistente', false)).toBeNull()
  })

  it('atualização parcial não apaga campos não enviados', async () => {
    const { usuario } = await cadastro({ tipo_sanguineo: 'B+', condicao_saude: 'Asma' })
    const atualizado = await authService.atualizarMeusDados(usuario.id, { condicao_saude: 'Diabetes' })
    expect(atualizado.tipo_sanguineo).toBe('B+')
    expect(atualizado.condicao_saude).toBe('Diabetes')
  })
})

describe('esqueci minha senha', () => {
  it('redefine com o código e invalida o código depois de usado', async () => {
    await cadastro()
    await authService.solicitarResetSenha(EMAIL)
    const { codigo } = enviados[0]
    await authService.redefinirSenhaComCodigo(EMAIL, codigo, 'novasenha')
    await authService.login(EMAIL, 'novasenha')
    await expect(authService.redefinirSenhaComCodigo(EMAIL, codigo, 'outra123')).rejects.toThrow('inválido')
  })

  it('rejeita código errado e expirado; e-mail inexistente não envia nada nem falha', async () => {
    await cadastro()
    await authService.solicitarResetSenha(EMAIL)
    await expect(authService.redefinirSenhaComCodigo(EMAIL, '000000x', 'novasenha')).rejects.toThrow('inválido')

    await prisma.usuario.update({ where: { email: EMAIL }, data: { resetExpiraEm: new Date(Date.now() - 1000) } })
    await expect(authService.redefinirSenhaComCodigo(EMAIL, enviados[0].codigo, 'novasenha')).rejects.toThrow('inválido')

    enviados.length = 0
    await authService.solicitarResetSenha('ninguem@exemplo.com')
    expect(enviados).toHaveLength(0)
  })
})
