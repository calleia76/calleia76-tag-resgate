import { useEffect, useState, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import QRCode from 'qrcode'
import { LogOut, Loader2, Check, AlertCircle, Globe, KeyRound, Camera, QrCode, Copy, ExternalLink } from 'lucide-react'
import { authService, FichaSaude } from '@/services/auth.service'
import { TIPOS_SANGUINEOS } from '@/lib/tiposSanguineos'
import { formatarTelefoneComDDD, formatarSomenteNome } from '@/lib/mascaras'
import { CONDICOES_SAUDE } from '@/lib/condicoesSaude'
import { CampoTagVisibilidade } from '@/lib/tagVisibilidade'
import { ToggleVisibilidadeCampo } from '@/components/ui/ToggleVisibilidadeCampo'
import { ModalRecortarFoto } from '@/components/ui/ModalRecortarFoto'

const SIM_NAO_OPTIONS = ['', 'Sim', 'Não'] as const

type FormSaude = Omit<FichaSaude, 'id' | 'nome' | 'identificador' | 'cargo' | 'organizacao' | 'foto' | 'emergenciaToken'>

const CAMPOS_VAZIOS: FormSaude = {
  tipo_sanguineo: '',
  plano_saude: '',
  operadora_saude: '',
  numero_carteirinha: '',
  condicao_saude: '',
  telefone_emergencia: '',
  contato_emergencia: '',
  medicamentos_continuo: '',
  descricao_medicamentos: '',
  alergias_conhecidas: '',
  descricao_alergia: '',
  observacoes_medicas: '',
  tag_campos_privados: [],
}

/** Card com o link/QR da própria tag — é o que vai impresso ou gravado na tag NFC física. */
function MinhaTag({ token }: { token: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const link = `${window.location.origin}/ficha/${token}`

  useEffect(() => {
    QRCode.toDataURL(link, { width: 220, margin: 1, color: { dark: '#ffffff', light: '#00000000' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null))
  }, [link])

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch { /* clipboard indisponível — a pessoa pode selecionar o texto manualmente */ }
  }

  return (
    <div className="bg-bg-card border border-status-danger/40 rounded-xl p-4 space-y-3">
      <p className="text-text-primary font-sans font-semibold text-sm flex items-center gap-2">
        <QrCode className="w-4 h-4 text-status-danger" /> Minha tag (QR / link)
      </p>
      <p className="text-text-muted text-xs leading-relaxed">
        Imprima este QR ou grave o link numa tag NFC. É isso que um socorrista lê, sem precisar de login.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {qrDataUrl && (
          <img src={qrDataUrl} alt="QR code da minha ficha de emergência" className="w-36 h-36 bg-bg-primary rounded-lg border border-border shrink-0" />
        )}
        <div className="w-full space-y-2">
          <div className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-secondary text-xs font-mono break-all">
            {link}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copiarLink}
              className="flex-1 flex items-center justify-center gap-1.5 bg-bg-primary border border-border text-text-primary text-xs font-semibold rounded-lg py-2 hover:border-status-danger/50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> {copiado ? 'Copiado!' : 'Copiar link'}
            </button>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-bg-primary border border-border text-text-primary text-xs font-semibold rounded-lg py-2 hover:border-status-danger/50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Ver como socorrista vê
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function TrocarSenha() {
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const trocar = useMutation({
    mutationFn: () => authService.trocarSenha(senhaAtual, novaSenha),
    onSuccess: () => {
      setSucesso(true)
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      setTimeout(() => setSucesso(false), 3000)
    },
  })

  const senhasConferem = novaSenha.length > 0 && novaSenha === confirmarSenha
  const podeEnviar = senhaAtual.length > 0 && novaSenha.length >= 6 && senhasConferem

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 space-y-3">
      <p className="text-text-primary font-sans font-semibold text-sm flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-status-danger" /> Trocar senha
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider mb-1">Senha atual</p>
          <input
            type="password"
            value={senhaAtual}
            onChange={e => setSenhaAtual(e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-status-danger/50"
          />
        </div>
        <div>
          <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider mb-1">Nova senha</p>
          <input
            type="password"
            value={novaSenha}
            onChange={e => setNovaSenha(e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-status-danger/50"
          />
        </div>
        <div>
          <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider mb-1">Confirmar nova senha</p>
          <input
            type="password"
            value={confirmarSenha}
            onChange={e => setConfirmarSenha(e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-status-danger/50"
          />
        </div>
      </div>
      {novaSenha.length > 0 && novaSenha.length < 6 && (
        <p className="text-status-warning text-xs">A nova senha deve ter ao menos 6 caracteres.</p>
      )}
      {confirmarSenha.length > 0 && !senhasConferem && (
        <p className="text-status-danger text-xs">As senhas não conferem.</p>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={() => trocar.mutate()}
          disabled={!podeEnviar || trocar.isPending}
          className="flex items-center gap-2 bg-bg-primary border border-border text-text-primary font-sans font-semibold text-sm px-4 py-2 rounded-lg hover:border-status-danger/50 transition-all disabled:opacity-50"
        >
          {trocar.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          {trocar.isPending ? 'Trocando...' : 'Trocar senha'}
        </button>
        {sucesso && <span className="text-status-ok text-sm">Senha trocada com sucesso.</span>}
        {trocar.isError && (
          <span className="text-status-danger text-sm">
            {(trocar.error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Erro ao trocar a senha.'}
          </span>
        )}
      </div>
    </div>
  )
}

/** Painel self-service — a pessoa logada edita a própria ficha de saúde/emergência e vê o
 *  QR/link da própria tag. */
export default function Painel() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormSaude>(CAMPOS_VAZIOS)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    if (!authService.estaLogado()) navigate('/entrar')
  }, [navigate])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['minha-ficha'],
    queryFn: authService.meusDados,
    retry: false,
  })

  useEffect(() => {
    if (data) {
      const { id: _id, nome: _nome, identificador: _identificador, cargo: _cargo, organizacao: _organizacao, foto: _foto, emergenciaToken: _token, ...saude } = data
      setForm(saude)
    }
  }, [data])

  const salvar = useMutation({
    mutationFn: () => authService.atualizarMeusDados(form),
    onSuccess: novo => {
      queryClient.setQueryData(['minha-ficha'], novo)
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2500)
    },
  })

  const [fotoParaRecorte, setFotoParaRecorte] = useState<string | null>(null)
  const trocarFoto = useMutation({
    mutationFn: (arquivo: File) => authService.uploadFoto(arquivo),
    onSuccess: ({ foto }) => {
      queryClient.setQueryData<FichaSaude | undefined>(['minha-ficha'], atual => atual ? { ...atual, foto } : atual)
    },
  })

  function selecionarFoto(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (arquivo) setFotoParaRecorte(URL.createObjectURL(arquivo))
  }

  function aoConfirmarRecorteFoto(arquivoRecortado: File) {
    URL.revokeObjectURL(fotoParaRecorte!)
    setFotoParaRecorte(null)
    trocarFoto.mutate(arquivoRecortado)
  }

  function cancelarRecorteFoto() {
    URL.revokeObjectURL(fotoParaRecorte!)
    setFotoParaRecorte(null)
  }

  function set<K extends Exclude<keyof FormSaude, 'tag_campos_privados'>>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function sair() {
    authService.logout()
    navigate('/entrar')
  }

  function alternarPrivacidade(campoVisibilidade: CampoTagVisibilidade) {
    setForm(f => ({
      ...f,
      tag_campos_privados: f.tag_campos_privados.includes(campoVisibilidade)
        ? f.tag_campos_privados.filter(c => c !== campoVisibilidade)
        : [...f.tag_campos_privados, campoVisibilidade],
    }))
  }

  function rotuloComVisibilidade(label: string, campoVisibilidade?: CampoTagVisibilidade) {
    return (
      <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider mb-1 flex items-center justify-between gap-2">
        <span>{label}</span>
        {campoVisibilidade && (
          <ToggleVisibilidadeCampo campo={campoVisibilidade} privados={form.tag_campos_privados} onToggle={alternarPrivacidade} />
        )}
      </p>
    )
  }

  function campo(label: string, key: Exclude<keyof FormSaude, 'tag_campos_privados'>, tipo: 'text' | 'tel' = 'text', campoVisibilidade?: CampoTagVisibilidade, formatador?: (v: string) => string) {
    return (
      <div>
        {rotuloComVisibilidade(label, campoVisibilidade)}
        <input
          type={tipo}
          inputMode={tipo === 'tel' ? 'numeric' : undefined}
          value={form[key]}
          onChange={e => {
            const bruto = formatador ? formatador(e.target.value) : e.target.value
            set(key, tipo === 'text' && !formatador ? bruto.toUpperCase() : bruto)
          }}
          className={`w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-status-danger/50 ${tipo === 'text' ? 'uppercase' : ''}`}
        />
      </div>
    )
  }

  function campoSelect(label: string, key: Exclude<keyof FormSaude, 'tag_campos_privados'>, campoVisibilidade?: CampoTagVisibilidade, opcoes: readonly string[] = SIM_NAO_OPTIONS) {
    return (
      <div>
        {rotuloComVisibilidade(label, campoVisibilidade)}
        <select
          value={form[key]}
          onChange={e => set(key, e.target.value)}
          className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-status-danger/50"
        >
          {opcoes.map(op => <option key={op} value={op}>{op || '—'}</option>)}
        </select>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-status-danger animate-spin" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="w-8 h-8 text-status-danger" />
        <p className="text-text-secondary text-sm">Sua sessão expirou ou é inválida.</p>
        <button onClick={sair} className="text-status-danger text-sm font-medium hover:underline">Fazer login novamente</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="relative overflow-hidden border-b-2 border-status-danger/40 px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="absolute inset-0" aria-hidden>
          <img src="/imagens/tag-resgate-operador.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[35%_10%] opacity-[0.18]" />
          <div className="absolute inset-0 bg-bg-topbar/95" />
        </div>
        <div className="relative flex items-center gap-3 min-w-0">
          <img src="/icones/tag-resgate.png" alt="" className="w-7 h-7 shrink-0" />
          <div className="min-w-0">
            <p className="text-white font-sans font-semibold text-sm truncate">{data.nome}</p>
            {data.identificador && <p className="text-fg-muted text-[11px] font-mono">{data.identificador}</p>}
          </div>
        </div>
        <button
          onClick={sair}
          className="relative flex items-center gap-1.5 text-fg-muted hover:text-status-danger text-sm transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </header>

      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
        <div className="bg-status-danger/10 border border-status-danger/40 rounded-xl p-4">
          <p className="text-status-danger font-mono font-bold uppercase tracking-wider text-sm">Minha Ficha de Saúde</p>
          <p className="text-text-secondary text-xs mt-1">
            Mantenha esses dados sempre atualizados — são exatamente o que um socorrista vê ao ler sua TAG em caso de emergência.
          </p>
        </div>

        <MinhaTag token={data.emergenciaToken} />

        <div className="bg-bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          {data.foto ? (
            <img src={data.foto} alt={data.nome} className="w-16 h-16 rounded-full object-cover border border-border shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-bg-primary border border-border flex items-center justify-center text-text-muted shrink-0">
              <Camera className="w-6 h-6" />
            </div>
          )}
          <div className="space-y-1">
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-status-danger text-sm font-semibold hover:underline">
              {trocarFoto.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {data.foto ? 'Trocar foto' : 'Adicionar foto'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selecionarFoto} disabled={trocarFoto.isPending} className="hidden" />
            </label>
            <p className="text-text-muted text-xs">A foto deve ser do rosto, para identificação.</p>
            {trocarFoto.isError && <p className="text-status-danger text-xs">Não foi possível enviar a foto. Tente novamente.</p>}
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4 space-y-3">
          <p className="text-text-muted text-xs flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-status-ok shrink-0" />
            Por padrão todo campo é público. Use o botão ao lado de cada rótulo pra marcar algum como privado (só quem estiver logado vê).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              {rotuloComVisibilidade('Tipo Sanguíneo', 'tipo_sanguineo')}
              <select
                value={form.tipo_sanguineo}
                onChange={e => set('tipo_sanguineo', e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-status-danger/50"
              >
                <option value="">—</option>
                {TIPOS_SANGUINEOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {campoSelect('Possui Plano de Saúde?', 'plano_saude', 'plano_saude')}
            {campo('Operadora / Nome do Plano', 'operadora_saude')}
            {campo('Número da Carteirinha', 'numero_carteirinha')}
            {campoSelect('Condição de Saúde', 'condicao_saude', 'condicao_saude', ['', ...CONDICOES_SAUDE])}
            {campo('Telefone: Contato de Emergência', 'telefone_emergencia', 'tel', undefined, formatarTelefoneComDDD)}
            <div className="sm:col-span-2">{campo('Nome do Contato de Emergência / Parentesco', 'contato_emergencia', 'text', 'contato_emergencia', formatarSomenteNome)}</div>
            {campoSelect('Medicamentos em uso contínuo?', 'medicamentos_continuo', 'medicamentos')}
            <div className="sm:col-span-2">{campo('Descrição dos medicamentos (nome, dosagem, frequência)', 'descricao_medicamentos')}</div>
            {campoSelect('Alergias conhecidas?', 'alergias_conhecidas', 'alergias')}
            <div className="sm:col-span-2">{campo('Descrição da Alergia', 'descricao_alergia')}</div>
          </div>
          <div>
            <p className="text-text-muted text-[10px] font-mono uppercase tracking-wider mb-1">Observações Médicas Gerais</p>
            <textarea
              value={form.observacoes_medicas}
              onChange={e => set('observacoes_medicas', e.target.value.toUpperCase())}
              rows={3}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-text-primary text-sm uppercase focus:outline-none focus:border-status-danger/50 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => salvar.mutate()}
              disabled={salvar.isPending}
              className="flex items-center gap-2 bg-status-danger text-white font-sans font-semibold text-sm px-5 py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-60"
            >
              {salvar.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {salvar.isPending ? 'Salvando...' : 'Salvar alterações'}
            </button>
            {salvo && <span className="text-status-ok text-sm">Dados atualizados.</span>}
            {salvar.isError && <span className="text-status-danger text-sm">Erro ao salvar. Tente novamente.</span>}
          </div>
        </div>

        <TrocarSenha />
      </div>

      {fotoParaRecorte && (
        <ModalRecortarFoto
          open
          imagemSrc={fotoParaRecorte}
          aspecto={1}
          cropShape="round"
          nomeArquivo="foto-tag-resgate.jpg"
          titulo="Ajustar foto de perfil"
          onCancelar={cancelarRecorteFoto}
          onConfirmar={aoConfirmarRecorteFoto}
        />
      )}
    </div>
  )
}
