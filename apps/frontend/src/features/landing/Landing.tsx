import { Link } from 'react-router-dom'
import {
  ChevronRight, ShieldCheck, Droplet, Phone, Nfc, Lock, Pencil, Siren,
  CheckCircle2, Clock, Zap, Target, Car, Activity, Users, PhoneCall,
} from 'lucide-react'
import { AvisoLGPD } from '@/components/ui/AvisoLGPD'

const RECURSOS = [
  { Icon: ShieldCheck, titulo: 'Identificação Pessoal', texto: 'Nome e dados de identificação, exibidos na hora.' },
  { Icon: Droplet, titulo: 'Informações de Saúde', texto: 'Tipo sanguíneo, alergias, condições e medicamentos em uso.' },
  { Icon: Phone, titulo: 'Contato de Emergência', texto: 'Quem acionar e como, sem precisar procurar.' },
  { Icon: Nfc, titulo: 'Leitura Rápida via NFC/QR', texto: 'Aproximar o celular ou ler o QR — sem login, sem instalar nada.' },
]

const IMPORTANCIA = [
  { Icon: Target, titulo: 'Salva Vidas', texto: 'Acelera o atendimento e aumenta as chances de sobrevivência.' },
  { Icon: Clock, titulo: 'Reduz o Tempo de Resposta', texto: 'Informações essenciais em segundos, sem precisar perguntar nada.' },
  { Icon: Zap, titulo: 'Identificação Imediata', texto: 'Seus dados disponíveis na hora, de forma rápida e segura.' },
  { Icon: ShieldCheck, titulo: 'Apoia Decisões Críticas', texto: 'Informações vitais pra quem precisa agir rápido, sob pressão.' },
]

const APLICACOES = [
  { Icon: Target, label: 'Acidentes' },
  { Icon: Activity, label: 'Trauma' },
  { Icon: Car, label: 'Trânsito' },
  { Icon: Siren, label: 'Mal Súbito' },
]

const CONFIANCA = [
  { Icon: ShieldCheck, label: 'Confiança' },
  { Icon: Lock, label: 'Privacidade' },
  { Icon: Clock, label: 'Disponível 24h' },
  { Icon: Users, label: 'Proteção que Conecta' },
]

/** Card com cantos "reticulados" (mira tática) — identidade visual própria da TAG Resgate. */
function Bracket({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`relative border border-white/10 bg-white/[0.03] ${className}`}>
      <span aria-hidden className="absolute -top-px -left-px w-3.5 h-3.5 border-t-2 border-l-2 border-status-danger/50" />
      <span aria-hidden className="absolute -top-px -right-px w-3.5 h-3.5 border-t-2 border-r-2 border-status-danger/50" />
      <span aria-hidden className="absolute -bottom-px -left-px w-3.5 h-3.5 border-b-2 border-l-2 border-status-danger/50" />
      <span aria-hidden className="absolute -bottom-px -right-px w-3.5 h-3.5 border-b-2 border-r-2 border-status-danger/50" />
      {children}
    </div>
  )
}

/** Landing page pública da TAG Resgate — pensada para alguém que nunca ouviu falar do produto
 *  entender do que se trata e já sair de lá cadastrado. */
export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-landing text-white">
      <AvisoLGPD fixo />

      <header className="relative overflow-hidden border-b border-status-danger/20">
        <div className="absolute inset-0" aria-hidden>
          <img
            src="/imagens/tag-resgate-operador.jpg"
            alt=""
            className="absolute inset-0 h-full w-full sm:w-[50%] object-cover object-[35%_10%] opacity-[0.5] sm:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-landing/45 via-transparent to-bg-landing/15" />
          <div
            className="hidden sm:block absolute inset-0"
            style={{ background: 'linear-gradient(to left, #050608 0%, #050608 56%, rgba(5,6,8,.6) 67%, transparent 80%)' }}
          />
        </div>
        {[
          'top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 left-0 -rotate-90', 'bottom-0 right-0 rotate-180',
        ].map((pos, i) => (
          <div
            key={i} aria-hidden
            className={`absolute ${pos} w-28 h-28 sm:w-40 sm:h-40 pointer-events-none opacity-60 z-10`}
            style={{
              clipPath: 'polygon(0 0, 45% 0, 0 45%)',
              background: 'repeating-linear-gradient(-45deg, #c81e3a 0px, #c81e3a 9px, #050608 9px, #050608 18px)',
            }}
          />
        ))}

        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-24 sm:pt-20 sm:pb-32">
          <div className="max-w-xl sm:ml-auto">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-11 h-11 rounded-full bg-black/60 border border-status-danger/50 flex items-center justify-center backdrop-blur-sm">
                <img src="/icones/tag-resgate.png" alt="" className="w-7 h-7" />
              </div>
              <p className="font-stencil font-bold text-[13px] text-status-danger tracking-[0.14em] uppercase">
                Identificação de Emergência
              </p>
            </div>

            <h1 className="font-hero text-7xl sm:text-8xl tracking-wide text-white leading-[0.85] [text-shadow:0_4px_30px_rgba(0,0,0,.7)]">
              TAG<br /><span className="text-status-danger">RESGATE</span>
            </h1>

            <div className="mt-8 space-y-1 font-sans font-bold text-xl sm:text-[26px] leading-snug [text-shadow:0_2px_16px_rgba(0,0,0,.6)]">
              <p className="text-fg-2">Informação que protege.</p>
              <p className="text-fg-2">Localização que orienta.</p>
              <p className="text-status-danger">Resposta que salva.</p>
            </div>

            <p className="text-fg-2/80 text-sm mt-6 leading-relaxed max-w-md [text-shadow:0_2px_10px_rgba(0,0,0,.6)]">
              Cadastre seus dados de saúde e contato de emergência para gerar sua tag pessoal.
              Em caso de acidente ou mal súbito, quem te socorrer lê a tag pelo celular e vê na
              hora exatamente o que precisa saber — sem precisar de login.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-9">
              <Link
                to="/cadastro"
                className="group inline-flex items-center justify-center gap-2 bg-status-danger text-white font-sans font-bold text-base px-8 py-4 hover:brightness-110 hover:-translate-y-[1px] active:translate-y-0 transition-all shadow-[0_8px_32px_rgba(239,68,68,0.45)]"
              >
                Fazer meu cadastro <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/entrar"
                className="inline-flex items-center justify-center gap-2 border border-white/25 bg-black/30 backdrop-blur-sm text-fg-2 font-sans font-semibold text-base px-8 py-4 hover:bg-white/10 hover:border-white/40 transition-all"
              >
                Já tenho cadastro — Entrar
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-16 pb-4">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1">
            <p className="font-stencil font-bold text-[13px] text-status-danger tracking-[0.14em] uppercase mb-3">É isso que aparece</p>
            <h2 className="font-sans font-bold text-2xl sm:text-3xl text-white leading-tight">
              Sem app pra instalar. <span className="text-status-danger">Sem senha pra lembrar.</span>
            </h2>
            <p className="text-fg-muted text-sm mt-4 leading-relaxed max-w-md">
              Aproximou o celular ou leu o QR, a ficha abre na hora — com o essencial pra um
              atendimento rápido e seguro, direto na tela.
            </p>
          </div>

          <div className="order-1 md:order-2 flex justify-center">
            <div className="w-[270px] rounded-[2rem] border-4 border-white/15 bg-black shadow-[0_0_60px_rgba(239,68,68,0.25)] overflow-hidden">
              <div className="bg-bg-card px-4 pt-4 pb-3 border-b border-status-danger/25">
                <div className="flex items-center gap-1.5 text-status-ok text-[11px] font-mono font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> LEITURA REALIZADA VIA NFC
                </div>
              </div>
              <div className="p-4 space-y-3.5 text-left">
                <div>
                  <p className="text-text-muted text-[9px] font-mono uppercase tracking-wider">Identificação</p>
                  <p className="text-white text-sm font-semibold mt-0.5">Maria Oliveira</p>
                  <p className="text-fg-muted text-[10px] font-mono">TAG RESGATE</p>
                </div>
                <div className="h-px bg-white/10" />
                <div className="space-y-2">
                  <p className="text-text-muted text-[9px] font-mono uppercase tracking-wider">Informações de Saúde</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-fg-muted flex items-center gap-1.5"><Droplet className="w-3 h-3 text-status-danger" />Tipo sanguíneo</span>
                    <span className="text-white font-mono font-bold">O+</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-fg-muted">Alergias</span>
                    <span className="text-white font-mono">Penicilina</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-fg-muted">Medicamentos</span>
                    <span className="text-white font-mono">Losartana</span>
                  </div>
                </div>
                <div className="h-px bg-white/10" />
                <div className="bg-status-danger/15 border border-status-danger/30 rounded-lg px-3 py-2.5 flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-status-danger shrink-0" />
                  <div className="min-w-0">
                    <p className="text-text-muted text-[9px] font-mono uppercase tracking-wider">Contato de Emergência</p>
                    <p className="text-white text-xs font-mono">João Oliveira · (21) 99999-8888</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {RECURSOS.map(r => (
            <Bracket key={r.titulo} className="flex items-start gap-3.5 p-4">
              <div className="w-9 h-9 bg-status-danger/15 border border-status-danger/30 flex items-center justify-center shrink-0">
                <r.Icon className="w-4 h-4 text-status-danger" />
              </div>
              <div>
                <p className="text-fg-2 font-sans font-semibold text-sm">{r.titulo}</p>
                <p className="text-fg-muted text-xs mt-0.5 leading-relaxed">{r.texto}</p>
              </div>
            </Bracket>
          ))}
        </div>

        <div className="mt-14">
          <p className="text-center font-stencil font-bold text-[13px] text-status-danger tracking-[0.14em] uppercase mb-6">Como funciona</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: '1', t: 'Você se cadastra', d: 'Nome e seus dados de saúde — leva menos de dois minutos.' },
              { n: '2', t: 'Sua tag é gerada', d: 'QR code e link próprios, prontos pra imprimir ou gravar numa tag NFC.' },
              { n: '3', t: 'Em emergência, é só ler', d: 'Um socorrista aproxima o celular ou lê o QR e já vê seus dados — sem login.' },
            ].map(p => (
              <Bracket key={p.n} className="p-4 text-center">
                <div className="w-8 h-8 bg-status-danger text-white font-mono font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {p.n}
                </div>
                <p className="text-fg-2 font-sans font-semibold text-sm">{p.t}</p>
                <p className="text-fg-muted text-xs mt-1.5 leading-relaxed">{p.d}</p>
              </Bracket>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <p className="text-center font-stencil font-bold text-[13px] text-status-danger tracking-[0.14em] uppercase mb-1">Por que é importante</p>
          <h2 className="text-center font-sans font-bold text-2xl text-white mb-6">Agilidade, informação certa, vida preservada</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {IMPORTANCIA.map(i => (
              <Bracket key={i.titulo} className="flex items-start gap-3.5 p-4">
                <div className="w-9 h-9 bg-status-danger/15 border border-status-danger/30 flex items-center justify-center shrink-0">
                  <i.Icon className="w-4 h-4 text-status-danger" />
                </div>
                <div>
                  <p className="text-fg-2 font-sans font-semibold text-sm">{i.titulo}</p>
                  <p className="text-fg-muted text-xs mt-0.5 leading-relaxed">{i.texto}</p>
                </div>
              </Bracket>
            ))}
          </div>
        </div>

        <Bracket className="mt-12 p-5 !bg-status-danger/[0.06] !border-status-danger/25">
          <p className="text-fg-2 font-sans font-semibold text-sm mb-4 text-center">A TAG Resgate pode apoiar qualquer pessoa exposta a risco</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {APLICACOES.map(a => (
              <div key={a.label} className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-status-danger/15 border border-status-danger/40 flex items-center justify-center">
                  <a.Icon className="w-[18px] h-[18px] text-status-danger" />
                </div>
                <p className="text-fg-muted text-[11px] font-mono uppercase tracking-wider">{a.label}</p>
              </div>
            ))}
          </div>
        </Bracket>

        <Bracket className="mt-12 p-5 flex items-start gap-4">
          <Lock className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
          <div>
            <p className="text-fg-2 font-sans font-semibold text-sm mb-1.5">Seus dados, só o que importa em uma emergência</p>
            <ul className="text-fg-muted text-xs space-y-1.5 leading-relaxed">
              <li className="flex items-start gap-2"><Siren className="w-3.5 h-3.5 text-status-danger shrink-0 mt-0.5" />Quem lê a tag (QR/NFC) vê só saúde e contato de emergência — nunca sua senha ou outros dados pessoais.</li>
              <li className="flex items-start gap-2"><Pencil className="w-3.5 h-3.5 text-status-danger shrink-0 mt-0.5" />Só você, logado com seu e-mail e senha, edita a sua própria ficha — quando quiser, quantas vezes precisar.</li>
              <li className="flex items-start gap-2"><ShieldCheck className="w-3.5 h-3.5 text-status-danger shrink-0 mt-0.5" />O cadastro é livre e seu — você decide o que fica público ou privado.</li>
            </ul>
          </div>
        </Bracket>

        <div className="mt-12 text-center">
          <Link
            to="/cadastro"
            className="group inline-flex items-center justify-center gap-2 bg-status-danger text-white font-sans font-bold text-base px-8 py-4 hover:brightness-110 hover:-translate-y-[1px] transition-all shadow-[0_8px_32px_rgba(239,68,68,0.45)]"
          >
            Fazer meu cadastro agora <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 bg-white/[0.02] py-6">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {CONFIANCA.map(c => (
            <div key={c.label} className="flex items-center gap-2 text-fg-muted">
              <c.Icon className="w-4 h-4 text-status-danger" />
              <span className="text-xs font-mono uppercase tracking-wider">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-r from-status-danger/15 via-status-danger/5 to-status-danger/15 border-t border-status-danger/25 py-7 px-6">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          aria-hidden
          style={{ background: 'radial-gradient(60% 120% at 50% 50%, rgba(239,68,68,0.2), transparent 70%)' }}
        />
        <p className="relative text-center font-sans font-bold text-lg sm:text-2xl tracking-wide">
          <span className="text-fg-2">TECNOLOGIA QUE SALVA TEMPO. </span>
          <span className="text-status-danger">PREPARO QUE SALVA VIDAS.</span>
        </p>
      </div>

      <p className="text-center text-fg-faint text-[11px] font-mono py-6 pb-28 tracking-wider bg-bg-landing">
        TAG RESGATE
      </p>
    </div>
  )
}
