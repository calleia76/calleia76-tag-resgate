import axios from 'axios'
import { CampoTagVisibilidade } from '@/lib/tagVisibilidade'

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
  camposOcultos: CampoTagVisibilidade[]
}

export const fichaService = {
  async buscarPorToken(token: string): Promise<FichaPublica> {
    const tokenLogado = localStorage.getItem('tagResgate:token')
    const config = tokenLogado ? { headers: { Authorization: `Bearer ${tokenLogado}` } } : undefined
    const { data } = await axios.get<FichaPublica>(`/api/ficha/${token}`, config)
    return data
  },
}
