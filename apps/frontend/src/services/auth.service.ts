import axios from 'axios'
import { CampoTagVisibilidade } from '@/lib/tagVisibilidade'

const api = axios.create({
  baseURL: '/api/auth',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('tagResgate:token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) localStorage.removeItem('tagResgate:token')
    return Promise.reject(err)
  },
)

export interface FichaSaude {
  id: string
  nome: string
  identificador: string
  cargo: string
  organizacao: string
  foto: string | null
  emergenciaToken: string
  tipo_sanguineo: string
  plano_saude: string
  operadora_saude: string
  numero_carteirinha: string
  condicao_saude: string
  telefone_emergencia: string
  contato_emergencia: string
  medicamentos_continuo: string
  descricao_medicamentos: string
  alergias_conhecidas: string
  descricao_alergia: string
  observacoes_medicas: string
  tag_campos_privados: CampoTagVisibilidade[]
}

export interface CadastroDto extends Partial<Omit<FichaSaude, 'id' | 'nome' | 'emergenciaToken'>> {
  email: string
  senha: string
  nome: string
}

interface RespostaAuth {
  token: string
  usuario: FichaSaude
}

export const authService = {
  async cadastrar(dto: CadastroDto): Promise<RespostaAuth> {
    const { data } = await api.post<RespostaAuth>('/cadastro', dto)
    localStorage.setItem('tagResgate:token', data.token)
    return data
  },

  async login(email: string, senha: string): Promise<RespostaAuth> {
    const { data } = await api.post<RespostaAuth>('/login', { email, senha })
    localStorage.setItem('tagResgate:token', data.token)
    return data
  },

  logout() {
    localStorage.removeItem('tagResgate:token')
  },

  /** "Esqueci a senha": pede o envio de um código de 6 dígitos por e-mail. Sempre resolve com
   *  sucesso genérico (não revela se o e-mail tem conta ou não). */
  async solicitarResetSenha(email: string): Promise<{ mensagem: string }> {
    const { data } = await api.post<{ ok: boolean; mensagem: string }>('/esqueci-senha', { email })
    return { mensagem: data.mensagem }
  },

  async redefinirSenhaComCodigo(email: string, codigo: string, novaSenha: string): Promise<void> {
    await api.post('/redefinir-senha', { email, codigo, novaSenha })
  },

  estaLogado(): boolean {
    return !!localStorage.getItem('tagResgate:token')
  },

  async meusDados(): Promise<FichaSaude> {
    const { data } = await api.get<FichaSaude>('/me')
    return data
  },

  async atualizarMeusDados(dto: Partial<FichaSaude>): Promise<FichaSaude> {
    const { data } = await api.put<FichaSaude>('/me', dto)
    return data
  },

  async uploadFoto(arquivo: File): Promise<{ foto: string }> {
    const form = new FormData()
    form.append('foto', arquivo)
    const { data } = await api.post<{ foto: string }>('/me/foto', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return data
  },

  async trocarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
    await api.put('/senha', { senhaAtual, novaSenha })
  },
}
