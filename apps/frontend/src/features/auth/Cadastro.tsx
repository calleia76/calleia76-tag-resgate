import { useEffect, useRef, useState, FormEvent, ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, AlertCircle, Loader2, Eye, EyeOff, ChevronRight, Briefcase, Building2, Droplet, Globe, Camera } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { formatarTelefoneComDDD, formatarSomenteNome } from '@/lib/mascaras'
import { TIPOS_SANGUINEOS } from '@/lib/tiposSanguineos'
import { CONDICOES_SAUDE } from '@/lib/condicoesSaude'
import { ModalRecortarFoto } from '@/components/ui/ModalRecortarFoto'
import { PainelLayout } from '@/features/shell/PainelLayout'

const CAMPO_LABEL = 'text-fg-2 text-xs font-mono uppercase tracking-wider'
const CAMPO_INPUT = 'w-full bg-bg-card border border-border rounded-lg pl-10 pr-3 py-3 text-white text-sm font-mono placeholder-fg-faint focus:outline-none focus:border-status-danger/60 transition-colors'
const SIM_NAO_OPTIONS = ['', 'Sim', 'Não'] as const

function classeCampoInput(invalido: boolean): string {
  return invalido
    ? CAMPO_INPUT.replace('border-border', 'border-status-danger').replace('focus:border-status-danger/60', 'focus:border-status-danger')
    : CAMPO_INPUT
}

const FORM_INICIAL = {
  email: '', senha: '', confirmarSenha: '', nome: '', identificador: '', cargo: '', organizacao: '',
  tipo_sanguineo: '', plano_saude: '', operadora_saude: '', numero_carteirinha: '',
  condicao_saude: '', telefone_emergencia: '', contato_emergencia: '',
  medicamentos_continuo: '', descricao_medicamentos: '',
  alergias_conhecidas: '', descricao_alergia: '', observacoes_medicas: '',
}

/** Cadastro livre da TAG Resgate — qualquer pessoa pode se cadastrar, sem vínculo com nenhum
 *  sistema externo. Cria o login (e-mail + senha) e já coleta a ficha de saúde na hora; depois
 *  de cadastrado, edita essa mesma ficha em `/painel`, onde também vê o QR/link da própria tag. */
export default function Cadastro() {
  const navigate = useNavigate()
  const [form, setForm] = useState(FORM_INICIAL)
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoParaRecorte, setFotoParaRecorte] = useState<string | null>(null)
  const [camposInvalidos, setCamposInvalidos] = useState<Set<string>>(new Set())
  const erroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (erro) erroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [erro])

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    if (camposInvalidos.has(key)) {
      setCamposInvalidos(prev => { const novo = new Set(prev); novo.delete(key); return novo })
    }
  }

  function validar(): string[] {
    const invalidos = new Set<string>()
    const mensagens: string[] = []

    if (!form.nome.trim()) { invalidos.add('nome'); mensagens.push('Informe o nome completo.') }

    const email = form.email.trim().toLowerCase()
    if (!email || !email.includes('@')) { invalidos.add('email'); mensagens.push('Informe um e-mail válido.') }

    if (!form.senha) {
      invalidos.add('senha'); mensagens.push('Informe uma senha.')
    } else if (form.senha.length < 6) {
      invalidos.add('senha'); mensagens.push('A senha deve ter ao menos 6 caracteres.')
    }
    if (!form.confirmarSenha) {
      invalidos.add('confirmarSenha'); mensagens.push('Confirme a senha.')
    } else if (form.senha && form.senha !== form.confirmarSenha) {
      invalidos.add('senha'); invalidos.add('confirmarSenha'); mensagens.push('As senhas não conferem.')
    }

    setCamposInvalidos(invalidos)
    return mensagens
  }

  function selecionarFoto(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (arquivo) setFotoParaRecorte(URL.createObjectURL(arquivo))
  }

  function aoConfirmarRecorteFoto(arquivoRecortado: File) {
    URL.revokeObjectURL(fotoParaRecorte!)
    setFotoParaRecorte(null)
    setFoto(arquivoRecortado)
    setFotoPreview(URL.createObjectURL(arquivoRecortado))
  }

  function cancelarRecorteFoto() {
    URL.revokeObjectURL(fotoParaRecorte!)
    setFotoParaRecorte(null)
  }

  function campoTexto(label: string, key: keyof typeof form, tipo: 'text' | 'tel' = 'text', formatador?: (v: string) => string) {
    return (
      <div className="space-y-1.5">
        <label className={CAMPO_LABEL}>{label}</label>
        <input
          type={tipo}
          inputMode={tipo === 'tel' ? 'numeric' : undefined}
          value={form[key]}
          onChange={e => {
            const bruto = formatador ? formatador(e.target.value) : e.target.value
            set(key, tipo === 'text' && !formatador ? bruto.toUpperCase() : bruto)
          }}
          className={`w-full bg-bg-card border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder-fg-faint focus:outline-none focus:border-status-danger/60 transition-colors ${tipo === 'text' ? 'uppercase placeholder:normal-case' : ''}`}
        />
      </div>
    )
  }

  function campoSelect(label: string, key: keyof typeof form, opcoes: readonly string[] = SIM_NAO_OPTIONS) {
    return (
      <div className="space-y-1.5">
        <label className={CAMPO_LABEL}>{label}</label>
        <select
          value={form[key]}
          onChange={e => set(key, e.target.value)}
          className="w-full bg-bg-card border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-status-danger/60 transition-colors"
        >
          {opcoes.map(op => <option key={op} value={op}>{op || '—'}</option>)}
        </select>
      </div>
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')

    const mensagens = validar()
    if (mensagens.length > 0) {
      setErro(mensagens.join('\n'))
      return
    }

    setEnviando(true)
    try {
      await authService.cadastrar(form)
      if (foto) {
        try { await authService.uploadFoto(foto) } catch { /* segue mesmo assim */ }
      }
      navigate('/painel')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setErro(msg || 'Erro ao cadastrar. Verifique os dados e tente novamente.')
      if (msg?.toLowerCase().includes('e-mail')) setCamposInvalidos(new Set(['email']))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <PainelLayout frase="Seu cadastro leva menos de dois minutos e fica disponível pra qualquer socorrista ler em segundos, no momento em que mais importa.">
      <main className="relative flex items-center justify-center p-6 py-10">
        <div
          className="absolute inset-0 lg:hidden pointer-events-none"
          aria-hidden
          style={{ background: 'radial-gradient(100% 60% at 50% 0%, rgba(239,68,68,0.08), transparent 60%)' }}
        />
        <div className="relative w-full max-w-[560px]">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-status-danger/10 border border-status-danger/30 mb-4">
              <img src="/icones/tag-resgate.png" alt="" className="w-9 h-9" />
            </div>
            <h1 className="text-white font-sans font-semibold text-2xl">Cadastro na TAG Resgate</h1>
            <p className="text-fg-muted text-xs mt-1.5 max-w-sm mx-auto">
              Crie seu acesso para manter seus próprios dados de saúde e contato de emergência sempre atualizados.
            </p>
          </div>

          <div className="hidden lg:block mb-8">
            <p className="font-stencil font-bold text-[13px] text-status-danger tracking-[0.14em] uppercase mb-2">Cadastro</p>
            <h1 className="text-white font-sans font-semibold text-2xl">Criar minha TAG Resgate</h1>
            <p className="text-fg-muted text-sm mt-1.5 max-w-md">
              Identificação, dados de saúde e o acesso pra manter tudo atualizado — em um só lugar.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {erro && (
            <div ref={erroRef} role="alert" className="flex items-start gap-2 bg-status-danger/10 border border-status-danger/30 rounded-lg px-3 py-2.5 text-status-danger text-sm scroll-mt-6">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="whitespace-pre-line">{erro}</span>
            </div>
          )}

          <p className="font-mono text-[11px] text-status-danger tracking-[0.2em] uppercase font-bold pt-1">Identificação</p>

          <div className="flex items-center gap-4">
            {fotoPreview ? (
              <img src={fotoPreview} alt="Prévia da foto" className="w-16 h-16 rounded-full object-cover border border-border shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-bg-card border border-border flex items-center justify-center text-fg-muted shrink-0">
                <Camera className="w-6 h-6" />
              </div>
            )}
            <div className="space-y-1">
              <label className="inline-block cursor-pointer text-status-danger text-sm font-semibold hover:underline">
                {fotoPreview ? 'Trocar foto' : 'Adicionar foto'}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selecionarFoto} className="hidden" />
              </label>
              <p className="text-fg-muted text-xs">A foto deve ser do rosto, para identificação.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={CAMPO_LABEL}>Nome completo</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
              <input
                value={form.nome}
                onChange={e => set('nome', formatarSomenteNome(e.target.value))}
                required
                className={`${classeCampoInput(camposInvalidos.has('nome'))} uppercase placeholder:normal-case`}
                placeholder="Nome completo"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={CAMPO_LABEL}>Cargo / Função <span className="normal-case text-fg-faint">(opcional)</span></label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                <input
                  value={form.cargo}
                  onChange={e => set('cargo', e.target.value.toUpperCase())}
                  className={`${CAMPO_INPUT} uppercase placeholder:normal-case`}
                  placeholder="Ex.: Motorista"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={CAMPO_LABEL}>Organização <span className="normal-case text-fg-faint">(opcional)</span></label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                <input
                  value={form.organizacao}
                  onChange={e => set('organizacao', e.target.value.toUpperCase())}
                  className={`${CAMPO_INPUT} uppercase placeholder:normal-case`}
                  placeholder="Ex.: Empresa X"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={CAMPO_LABEL}>Documento / ID <span className="normal-case text-fg-faint">(opcional)</span></label>
            <input
              value={form.identificador}
              onChange={e => set('identificador', e.target.value.toUpperCase())}
              className={`${CAMPO_INPUT} pl-3 uppercase placeholder:normal-case`}
              placeholder="Ex.: CPF, matrícula ou outro identificador"
            />
          </div>

          <div className="h-px bg-white/10 my-1" />
          <p className="font-mono text-[11px] text-status-danger tracking-[0.2em] uppercase font-bold">Saúde</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={CAMPO_LABEL}><span className="inline-flex items-center gap-1"><Droplet className="w-3 h-3" />Tipo Sanguíneo</span></label>
              <select
                value={form.tipo_sanguineo}
                onChange={e => set('tipo_sanguineo', e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-status-danger/60 transition-colors"
              >
                <option value="">—</option>
                {TIPOS_SANGUINEOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {campoSelect('Possui Plano de Saúde?', 'plano_saude')}
            {campoTexto('Operadora / Nome do Plano', 'operadora_saude')}
            {campoTexto('Número da Carteirinha', 'numero_carteirinha')}
            {campoSelect('Condição de Saúde', 'condicao_saude', ['', ...CONDICOES_SAUDE])}
            {campoTexto('Telefone: Contato de Emergência', 'telefone_emergencia', 'tel', formatarTelefoneComDDD)}
            <div className="sm:col-span-2">{campoTexto('Nome do Contato de Emergência / Parentesco', 'contato_emergencia', 'text', formatarSomenteNome)}</div>
            {campoSelect('Medicamentos em uso contínuo?', 'medicamentos_continuo')}
            <div className="sm:col-span-2">{campoTexto('Descrição dos medicamentos (nome, dosagem, frequência)', 'descricao_medicamentos')}</div>
            {campoSelect('Alergias conhecidas?', 'alergias_conhecidas')}
            <div className="sm:col-span-2">{campoTexto('Descrição da Alergia', 'descricao_alergia')}</div>
          </div>

          <div className="space-y-1.5">
            <label className={CAMPO_LABEL}>Observações Médicas Gerais</label>
            <textarea
              value={form.observacoes_medicas}
              onChange={e => set('observacoes_medicas', e.target.value.toUpperCase())}
              rows={3}
              className="w-full bg-bg-card border border-border rounded-lg px-3 py-2.5 text-white text-sm uppercase focus:outline-none focus:border-status-danger/60 transition-colors resize-none"
            />
          </div>

          <div className="bg-bg-card border border-border rounded-lg p-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-status-ok shrink-0" />
            <p className="text-fg-muted text-xs">
              Por padrão, todos os itens acima ficam <span className="text-status-ok font-semibold">públicos</span> (visíveis a quem ler o QR/NFC sem login).
              Depois de entrar, você pode marcar itens específicos como privados na sua Ficha de Saúde.
            </p>
          </div>

          <div className="h-px bg-white/10 my-1" />
          <p className="font-mono text-[11px] text-status-danger tracking-[0.2em] uppercase font-bold">Acesso</p>

          <div className="space-y-1.5">
            <label className={CAMPO_LABEL}>E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="seuemail@exemplo.com"
                required
                className={classeCampoInput(camposInvalidos.has('email'))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={CAMPO_LABEL}>Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                <input
                  type={verSenha ? 'text' : 'password'}
                  value={form.senha}
                  onChange={e => set('senha', e.target.value)}
                  placeholder="mín. 6 caracteres"
                  required
                  minLength={6}
                  className={`${classeCampoInput(camposInvalidos.has('senha'))} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setVerSenha(v => !v)}
                  aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-fg-muted hover:text-status-danger"
                >
                  {verSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={CAMPO_LABEL}>Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                <input
                  type={verSenha ? 'text' : 'password'}
                  value={form.confirmarSenha}
                  onChange={e => set('confirmarSenha', e.target.value)}
                  placeholder="repita a senha"
                  required
                  minLength={6}
                  className={classeCampoInput(camposInvalidos.has('confirmarSenha'))}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="group w-full bg-status-danger text-white font-sans font-semibold text-sm py-3.5 rounded-lg hover:brightness-110 hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2 mt-2"
          >
            {enviando
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Cadastrando...</>
              : <>Criar meu acesso <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
          </button>
        </form>

          <p className="text-center text-fg-muted text-sm mt-6">
            Já tem cadastro?{' '}
            <Link to="/entrar" className="text-status-danger hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </main>

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
    </PainelLayout>
  )
}
