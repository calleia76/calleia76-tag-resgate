import { Usuario } from '@prisma/client'
import { prisma } from '@/database/prisma'
import { CampoVisibilidade, sanitizarCamposPrivados } from '@/modules/auth/campos-visibilidade'

/** Ficha exposta publicamente (sem login) via NFC/QR — deliberadamente mínima: só dado de saúde
 *  e contato que sirva para um socorrista atender a pessoa. Nunca inclui e-mail nem senha. */
export interface FichaPublica {
  nome: string
  identificador: string
  foto: string | null
  tipo_sanguineo: string | null
  alergias: string | null
  condicoes_relevantes: string | null
  medicamentos: string | null
  plano_saude: string | null
  numero_carteirinha: string | null
  contato_emergencia: string | null
  telefone_emergencia: string | null
  camposOcultos: CampoVisibilidade[]
}

export function montarFichaPublica(usuario: Usuario, leitorAutenticado: boolean): FichaPublica {
  const privados = leitorAutenticado ? [] : sanitizarCamposPrivados(JSON.parse(usuario.camposPrivados))
  const oculto = (campo: CampoVisibilidade) => privados.includes(campo)

  return {
    nome: usuario.nome,
    identificador: usuario.identificador ?? '',
    foto: usuario.foto,
    tipo_sanguineo: oculto('tipo_sanguineo') ? null : usuario.tipoSanguineo,
    alergias: oculto('alergias') ? null : [usuario.alergiasConhecidas, usuario.descricaoAlergia].filter(Boolean).join(' — ') || null,
    condicoes_relevantes: oculto('condicao_saude') ? null : usuario.condicaoSaude,
    medicamentos: oculto('medicamentos') ? null : [usuario.medicamentosContinuo, usuario.descricaoMedicamentos].filter(Boolean).join(' — ') || null,
    plano_saude: oculto('plano_saude') ? null : [usuario.operadoraSaude, usuario.planoSaude].filter(Boolean).join(' — ') || null,
    numero_carteirinha: oculto('plano_saude') ? null : usuario.numeroCarteirinha,
    contato_emergencia: oculto('contato_emergencia') ? null : usuario.contatoEmergencia,
    telefone_emergencia: oculto('contato_emergencia') ? null : usuario.telefoneEmergencia,
    camposOcultos: privados,
  }
}

export const fichaService = {
  async buscarPorToken(token: string, leitorAutenticado: boolean): Promise<FichaPublica | null> {
    const usuario = await prisma.usuario.findUnique({ where: { emergenciaToken: token } })
    if (!usuario || !usuario.ativo) return null
    return montarFichaPublica(usuario, leitorAutenticado)
  },
}
