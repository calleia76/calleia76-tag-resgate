import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, ChevronRight, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { PainelLayout } from '@/features/shell/PainelLayout'

const CAMPO_LABEL = 'text-fg-2 text-xs font-mono uppercase tracking-wider'
const CAMPO_INPUT = 'w-full bg-bg-card border border-border rounded-lg pl-10 pr-3 py-3 text-white text-sm font-mono placeholder-fg-faint focus:outline-none focus:border-status-danger/60 transition-colors'

function mensagemErro(err: unknown, padrao: string): string {
  return (err as { response?: { data?: { error?: string } } })?.response?.data?.error || padrao
}

/** Fluxo de "esqueci a senha" — pede o e-mail, dispara o código por e-mail e confirma o código
 *  de 6 dígitos + nova senha. */
function EsqueciSenha({ emailInicial, onVoltar, onConcluido }: { emailInicial: string; onVoltar: () => void; onConcluido: () => void }) {
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email')
  const [email, setEmail] = useState(emailInicial)
  const [codigo, setCodigo] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function pedirCodigo(e: FormEvent) {
    e.preventDefault()
    setErro('')
    if (!email.trim()) { setErro('Informe o seu e-mail.'); return }

    setEnviando(true)
    try {
      const { mensagem } = await authService.solicitarResetSenha(email)
      setAviso(mensagem)
      setEtapa('codigo')
    } catch (err) {
      setErro(mensagemErro(err, 'Não foi possível pedir o código. Tente novamente.'))
    } finally {
      setEnviando(false)
    }
  }

  async function confirmarCodigo(e: FormEvent) {
    e.preventDefault()
    setErro('')

    if (!codigo.trim()) { setErro('Informe o código recebido por e-mail.'); return }
    if (novaSenha.length < 6) { setErro('A nova senha deve ter ao menos 6 caracteres.'); return }
    if (novaSenha !== confirmarSenha) { setErro('As senhas não conferem.'); return }

    setEnviando(true)
    try {
      await authService.redefinirSenhaComCodigo(email, codigo.trim(), novaSenha)
      onConcluido()
    } catch (err) {
      setErro(mensagemErro(err, 'Código inválido ou expirado. Peça um novo.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <button onClick={onVoltar} className="flex items-center gap-1.5 text-fg-muted hover:text-white text-xs mb-5 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o login
      </button>

      <div className="mb-6">
        <p className="font-stencil font-bold text-[13px] text-status-danger tracking-[0.14em] uppercase mb-2">Recuperar acesso</p>
        <h2 className="text-white font-sans font-semibold text-2xl">Esqueci minha senha</h2>
        <p className="text-fg-muted text-sm mt-1.5">
          {etapa === 'email'
            ? 'Enviamos um código de 6 dígitos por e-mail para o endereço cadastrado.'
            : 'Digite o código recebido e escolha uma nova senha.'}
        </p>
      </div>

      {erro && (
        <div role="alert" className="flex items-center gap-2 bg-status-danger/10 border border-status-danger/30 rounded-lg px-3 py-2.5 text-status-danger text-sm mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {etapa === 'email' ? (
        <form onSubmit={pedirCodigo} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <label className={CAMPO_LABEL}>E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                required
                className={CAMPO_INPUT}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="group w-full bg-status-danger text-white font-sans font-semibold text-sm py-3.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <>Enviar código por e-mail <ChevronRight className="w-4 h-4" /></>}
          </button>
        </form>
      ) : (
        <form onSubmit={confirmarCodigo} className="space-y-5" noValidate>
          {aviso && (
            <div className="flex items-center gap-2 bg-status-ok/10 border border-status-ok/30 rounded-lg px-3 py-2.5 text-status-ok text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{aviso}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className={CAMPO_LABEL}>Código recebido por e-mail</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
              <input
                value={codigo}
                onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                placeholder="000000"
                required
                className={`${CAMPO_INPUT} tracking-[0.3em]`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={CAMPO_LABEL}>Nova senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                <input
                  type={verSenha ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  placeholder="mín. 6 caracteres"
                  required
                  minLength={6}
                  className={`${CAMPO_INPUT} pr-9`}
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
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  placeholder="repita a senha"
                  required
                  minLength={6}
                  className={CAMPO_INPUT}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="group w-full bg-status-danger text-white font-sans font-semibold text-sm py-3.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Redefinindo...</> : <>Redefinir senha <ChevronRight className="w-4 h-4" /></>}
          </button>

          <button type="button" onClick={() => setEtapa('email')} className="w-full text-center text-fg-muted hover:text-white text-xs transition-colors">
            Não recebeu? Pedir um novo código
          </button>
        </form>
      )}
    </>
  )
}

/** Login da TAG Resgate — autentica por e-mail e senha. */
export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [modo, setModo] = useState<'login' | 'esqueci' | 'senha-redefinida'>('login')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await authService.login(email, senha)
      navigate('/painel')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setErro(msg || 'Erro ao entrar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <PainelLayout frase="Entre com seu e-mail e a senha que você cadastrou para ver e atualizar a sua ficha de saúde.">
      <main className="relative flex items-center justify-center p-6 sm:p-10">
        <div
          className="absolute inset-0 lg:hidden pointer-events-none"
          aria-hidden
          style={{ background: 'radial-gradient(100% 60% at 50% 0%, rgba(239,68,68,0.1), transparent 60%)' }}
        />
        <div className="relative w-full max-w-[400px]">
          {modo === 'login' && (
            <div className="text-center mb-8 lg:hidden">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-status-danger/10 border border-status-danger/30 mb-4">
                <img src="/icones/tag-resgate.png" alt="" className="w-9 h-9" />
              </div>
              <h1 className="text-white font-sans font-semibold text-2xl">TAG Resgate</h1>
              <p className="text-fg-muted text-xs font-mono mt-1 tracking-[0.15em] uppercase">Acesso do usuário</p>
            </div>
          )}

          {modo === 'esqueci' ? (
            <EsqueciSenha
              emailInicial={email}
              onVoltar={() => setModo('login')}
              onConcluido={() => setModo('senha-redefinida')}
            />
          ) : modo === 'senha-redefinida' ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-status-ok mx-auto" />
              <h2 className="text-white font-sans font-semibold text-2xl">Senha redefinida</h2>
              <p className="text-fg-muted text-sm">Já pode entrar com a nova senha.</p>
              <button
                onClick={() => setModo('login')}
                className="w-full bg-status-danger text-white font-sans font-semibold text-sm py-3.5 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                Ir para o login <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="hidden lg:block mb-8">
                <p className="font-stencil font-bold text-[13px] text-status-danger tracking-[0.14em] uppercase mb-2">Acesso do usuário</p>
                <h2 className="text-white font-sans font-semibold text-2xl">Entrar na minha ficha</h2>
              </div>

              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                {erro && (
                  <div role="alert" className="flex items-center gap-2 bg-status-danger/10 border border-status-danger/30 rounded-lg px-3 py-2.5 text-status-danger text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{erro}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-fg-2 text-xs font-mono uppercase tracking-wider">E-mail</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted group-focus-within:text-status-danger transition-colors" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="username"
                      placeholder="seuemail@exemplo.com"
                      required
                      className="w-full bg-bg-card border border-border rounded-lg pl-10 pr-3 py-3 text-white text-sm font-mono placeholder-fg-faint focus:outline-none focus:border-status-danger/60 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="senha" className="text-fg-2 text-xs font-mono uppercase tracking-wider">Senha</label>
                    <button type="button" onClick={() => setModo('esqueci')} className="text-status-danger text-xs hover:underline">
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted group-focus-within:text-status-danger transition-colors" />
                    <input
                      id="senha"
                      type={verSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={e => setSenha(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      required
                      className="w-full bg-bg-card border border-border rounded-lg pl-10 pr-11 py-3 text-white text-sm font-mono placeholder-fg-faint focus:outline-none focus:border-status-danger/60 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setVerSenha(v => !v)}
                      aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-fg-muted hover:text-status-danger hover:bg-white/5 transition-colors"
                    >
                      {verSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="group w-full bg-status-danger text-white font-sans font-semibold text-sm py-3.5 rounded-lg hover:brightness-110 hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
                >
                  {enviando
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
                    : <>Entrar <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
                </button>
              </form>

              <p className="text-center text-fg-muted text-sm mt-6">
                Ainda não tem cadastro?{' '}
                <Link to="/cadastro" className="text-status-danger hover:underline font-medium">
                  Cadastre-se aqui
                </Link>
              </p>
            </>
          )}

          <p className="text-center text-fg-faint text-[11px] font-mono mt-8 tracking-wider flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> TAG RESGATE
          </p>
        </div>
      </main>
    </PainelLayout>
  )
}
