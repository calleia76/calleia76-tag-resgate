import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { randomBytes, randomInt } from 'node:crypto'
import { Usuario } from '@prisma/client'
import { prisma } from '@/database/prisma'
import { config } from '@/config/env'
import { logger } from '@/utils/logger'
import { enviarCodigoReset } from './notificador'
import { CampoVisibilidade, sanitizarCamposPrivados } from './campos-visibilidade'

/** Self-service da TAG Resgate, de ponta a ponta: cadastro livre (sem vínculo com nenhum
 *  sistema externo), login por e-mail/senha, edição da própria ficha de saúde/emergência e
 *  "esqueci minha senha" por código enviado por e-mail. Cada pessoa cadastrada já recebe um
 *  token opaco (`emergenciaToken`) — é o link/QR que vai na tag física, lido sem login. */

export interface FichaSaudeDto {
  tipo_sanguineo?: string
  plano_saude?: string
  operadora_saude?: string
  numero_carteirinha?: string
  condicao_saude?: string
  telefone_emergencia?: string
  contato_emergencia?: string
  medicamentos_continuo?: string
  descricao_medicamentos?: string
  alergias_conhecidas?: string
  descricao_alergia?: string
  observacoes_medicas?: string
  tag_campos_privados?: CampoVisibilidade[]
}

interface CadastroDto extends FichaSaudeDto {
  email: string
  senha: string
  nome: string
  identificador?: string
  cargo?: string
  organizacao?: string
}

const CODIGO_RESET_VALIDADE_MIN = 10

function gerarCodigoReset(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

function gerarEmergenciaToken(): string {
  return randomBytes(12).toString('base64url')
}

function montarFicha(usuario: Usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    identificador: usuario.identificador ?? '',
    cargo: usuario.cargo ?? '',
    organizacao: usuario.organizacao ?? '',
    foto: usuario.foto,
    emergenciaToken: usuario.emergenciaToken,
    tipo_sanguineo: usuario.tipoSanguineo ?? '',
    plano_saude: usuario.planoSaude ?? '',
    operadora_saude: usuario.operadoraSaude ?? '',
    numero_carteirinha: usuario.numeroCarteirinha ?? '',
    condicao_saude: usuario.condicaoSaude ?? '',
    telefone_emergencia: usuario.telefoneEmergencia ?? '',
    contato_emergencia: usuario.contatoEmergencia ?? '',
    medicamentos_continuo: usuario.medicamentosContinuo ?? '',
    descricao_medicamentos: usuario.descricaoMedicamentos ?? '',
    alergias_conhecidas: usuario.alergiasConhecidas ?? '',
    descricao_alergia: usuario.descricaoAlergia ?? '',
    observacoes_medicas: usuario.observacoesMedicas ?? '',
    tag_campos_privados: sanitizarCamposPrivados(JSON.parse(usuario.camposPrivados)),
  }
}

function emitirToken(usuario: Usuario) {
  const token = jwt.sign({ sub: usuario.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn as never })
  return { token, usuario: montarFicha(usuario) }
}

/** Campos de saúde do DTO (snake_case, como o resto do sistema) mapeados pros nomes das colunas
 *  do Prisma (camelCase) — só inclui o que veio preenchido, pra um PUT parcial nunca apagar o
 *  que não foi enviado. */
function mapCamposSaude(dto: FichaSaudeDto): Record<string, unknown> {
  const dados: Record<string, unknown> = {}
  if (dto.tipo_sanguineo !== undefined) dados.tipoSanguineo = dto.tipo_sanguineo
  if (dto.plano_saude !== undefined) dados.planoSaude = dto.plano_saude
  if (dto.operadora_saude !== undefined) dados.operadoraSaude = dto.operadora_saude
  if (dto.numero_carteirinha !== undefined) dados.numeroCarteirinha = dto.numero_carteirinha
  if (dto.condicao_saude !== undefined) dados.condicaoSaude = dto.condicao_saude
  if (dto.telefone_emergencia !== undefined) dados.telefoneEmergencia = dto.telefone_emergencia
  if (dto.contato_emergencia !== undefined) dados.contatoEmergencia = dto.contato_emergencia
  if (dto.medicamentos_continuo !== undefined) dados.medicamentosContinuo = dto.medicamentos_continuo
  if (dto.descricao_medicamentos !== undefined) dados.descricaoMedicamentos = dto.descricao_medicamentos
  if (dto.alergias_conhecidas !== undefined) dados.alergiasConhecidas = dto.alergias_conhecidas
  if (dto.descricao_alergia !== undefined) dados.descricaoAlergia = dto.descricao_alergia
  if (dto.observacoes_medicas !== undefined) dados.observacoesMedicas = dto.observacoes_medicas
  if (dto.tag_campos_privados !== undefined) dados.camposPrivados = JSON.stringify(sanitizarCamposPrivados(dto.tag_campos_privados))
  return dados
}

export const authService = {
  async cadastrar(dto: CadastroDto) {
    const email = (dto.email ?? '').trim().toLowerCase()
    const nome = dto.nome?.trim()
    const senha = dto.senha ?? ''

    if (!nome) throw new Error('Informe o nome completo')
    if (!email || !email.includes('@')) throw new Error('Informe um e-mail válido')
    if (senha.length < 6) throw new Error('A senha deve ter ao menos 6 caracteres')

    const existente = await prisma.usuario.findUnique({ where: { email } })
    if (existente) throw new Error('Já existe um cadastro com este e-mail. Faça login.')

    const senhaHash = await bcrypt.hash(senha, 10)
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        identificador: dto.identificador?.trim() || null,
        cargo: dto.cargo?.trim() || null,
        organizacao: dto.organizacao?.trim() || null,
        email,
        senhaHash,
        emergenciaToken: gerarEmergenciaToken(),
        ...mapCamposSaude(dto),
      },
    })

    logger.info(`Novo cadastro TAG Resgate: ${email}`)
    return emitirToken(usuario)
  },

  async login(email: string, senha: string) {
    const emailLimpo = (email ?? '').trim().toLowerCase()
    if (!emailLimpo || !senha) throw new Error('Informe e-mail e senha')

    const usuario = await prisma.usuario.findUnique({ where: { email: emailLimpo } })
    if (!usuario || !usuario.ativo) throw new Error('Credenciais inválidas')

    const ok = await bcrypt.compare(senha, usuario.senhaHash)
    if (!ok) throw new Error('Credenciais inválidas')

    await prisma.usuario.update({ where: { id: usuario.id }, data: { ultimoLoginEm: new Date() } })
    return emitirToken(usuario)
  },

  async meusDados(usuarioId: string) {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } })
    if (!usuario) throw new Error('Usuário não encontrado')
    return montarFicha(usuario)
  },

  async atualizarMeusDados(usuarioId: string, dto: FichaSaudeDto) {
    await prisma.usuario.update({ where: { id: usuarioId }, data: mapCamposSaude(dto) })
    logger.info(`Dados de saúde atualizados: usuário ${usuarioId}`)
    return this.meusDados(usuarioId)
  },

  async uploadFoto(usuarioId: string, caminhoFoto: string): Promise<{ foto: string }> {
    await prisma.usuario.update({ where: { id: usuarioId }, data: { foto: caminhoFoto } })
    logger.info(`Foto atualizada: usuário ${usuarioId}`)
    return { foto: caminhoFoto }
  },

  async trocarSenha(usuarioId: string, senhaAtual: string, novaSenha: string): Promise<void> {
    if (!novaSenha || novaSenha.length < 6) throw new Error('A nova senha deve ter ao menos 6 caracteres')

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } })
    if (!usuario) throw new Error('Usuário não encontrado')

    const ok = await bcrypt.compare(senhaAtual ?? '', usuario.senhaHash)
    if (!ok) throw new Error('Senha atual incorreta')

    const senhaHash = await bcrypt.hash(novaSenha, 10)
    await prisma.usuario.update({ where: { id: usuarioId }, data: { senhaHash } })
    logger.info(`Senha trocada: usuário ${usuarioId}`)
  },

  /** "Esqueci a senha" — gera um código de 6 dígitos, válido por 10 minutos, e manda por e-mail.
   *  Sempre resolve com sucesso (nunca lança erro), mesmo quando o e-mail não tem conta — de
   *  propósito, para não revelar pra quem está pedindo se aquele e-mail existe (evita
   *  enumeração de contas). */
  async solicitarResetSenha(email: string): Promise<void> {
    const emailLimpo = (email ?? '').trim().toLowerCase()
    if (!emailLimpo) return

    const usuario = await prisma.usuario.findUnique({ where: { email: emailLimpo } })
    if (!usuario || !usuario.ativo) {
      logger.info(`Reset de senha: nenhuma conta ativa para ${emailLimpo}`)
      return
    }

    const codigo = gerarCodigoReset()
    const resetCodigoHash = await bcrypt.hash(codigo, 10)
    const resetExpiraEm = new Date(Date.now() + CODIGO_RESET_VALIDADE_MIN * 60 * 1000)

    await prisma.usuario.update({ where: { id: usuario.id }, data: { resetCodigoHash, resetExpiraEm } })

    try {
      await enviarCodigoReset(emailLimpo, codigo)
      logger.info(`Reset de senha: código enviado — usuário ${usuario.id}`)
    } catch (err) {
      logger.warn(`Reset de senha: falha ao enviar e-mail — usuário ${usuario.id} — ${(err as Error).message}`)
    }
  },

  /** Confirma o código recebido por e-mail e troca a senha — não exige estar logado. */
  async redefinirSenhaComCodigo(email: string, codigo: string, novaSenha: string): Promise<void> {
    if (!novaSenha || novaSenha.length < 6) throw new Error('A nova senha deve ter ao menos 6 caracteres')
    const emailLimpo = (email ?? '').trim().toLowerCase()

    const usuario = await prisma.usuario.findUnique({ where: { email: emailLimpo } })
    const codigoValido = usuario?.resetCodigoHash
      && usuario.resetExpiraEm
      && usuario.resetExpiraEm > new Date()
      && await bcrypt.compare(codigo ?? '', usuario.resetCodigoHash)
    if (!codigoValido) throw new Error('Código inválido ou expirado')

    const senhaHash = await bcrypt.hash(novaSenha, 10)
    await prisma.usuario.update({
      where: { id: usuario!.id },
      data: { senhaHash, resetCodigoHash: null, resetExpiraEm: null },
    })

    logger.info(`Senha redefinida via código: usuário ${usuario!.id}`)
  },
}
