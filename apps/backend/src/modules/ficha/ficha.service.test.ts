import { describe, expect, it } from 'vitest'
import { Usuario } from '@prisma/client'
import { montarFichaPublica } from './ficha.service'
import { sanitizarCamposPrivados } from '@/modules/auth/campos-visibilidade'

function usuarioBase(privados: string[] = []): Usuario {
  return {
    id: 'u1',
    nome: 'Maria',
    identificador: null,
    cargo: null,
    organizacao: null,
    foto: null,
    email: 'maria@exemplo.com',
    senhaHash: 'hash-secreto',
    ativo: true,
    tipoSanguineo: 'O+',
    planoSaude: 'Plano X',
    operadoraSaude: 'Operadora Y',
    numeroCarteirinha: '123',
    condicaoSaude: 'Asma',
    telefoneEmergencia: '1199999',
    contatoEmergencia: 'João',
    medicamentosContinuo: 'Sim',
    descricaoMedicamentos: 'Bombinha',
    alergiasConhecidas: 'Sim',
    descricaoAlergia: 'Dipirona',
    observacoesMedicas: null,
    camposPrivados: JSON.stringify(privados),
    emergenciaToken: 'tok',
    resetCodigoHash: null,
    resetExpiraEm: null,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    ultimoLoginEm: null,
  }
}

describe('montarFichaPublica', () => {
  it('mostra tudo quando nada está privado', () => {
    const ficha = montarFichaPublica(usuarioBase(), false)
    expect(ficha.tipo_sanguineo).toBe('O+')
    expect(ficha.alergias).toBe('Sim — Dipirona')
    expect(ficha.contato_emergencia).toBe('João')
  })

  it('oculta campos privados para leitor anônimo', () => {
    const ficha = montarFichaPublica(usuarioBase(['tipo_sanguineo', 'plano_saude', 'contato_emergencia']), false)
    expect(ficha.tipo_sanguineo).toBeNull()
    expect(ficha.plano_saude).toBeNull()
    expect(ficha.numero_carteirinha).toBeNull()
    expect(ficha.contato_emergencia).toBeNull()
    expect(ficha.telefone_emergencia).toBeNull()
    expect(ficha.alergias).toBe('Sim — Dipirona')
    expect(ficha.camposOcultos).toEqual(['tipo_sanguineo', 'plano_saude', 'contato_emergencia'])
  })

  it('revela campos privados para leitor autenticado', () => {
    const ficha = montarFichaPublica(usuarioBase(['tipo_sanguineo']), true)
    expect(ficha.tipo_sanguineo).toBe('O+')
    expect(ficha.camposOcultos).toEqual([])
  })

  it('nunca expõe e-mail nem hash de senha', () => {
    const json = JSON.stringify(montarFichaPublica(usuarioBase(), true))
    expect(json).not.toContain('maria@exemplo.com')
    expect(json).not.toContain('hash-secreto')
  })
})

describe('sanitizarCamposPrivados', () => {
  it('descarta valores desconhecidos e não-array', () => {
    expect(sanitizarCamposPrivados(['alergias', 'senha', 3])).toEqual(['alergias'])
    expect(sanitizarCamposPrivados('alergias')).toEqual([])
  })
})
