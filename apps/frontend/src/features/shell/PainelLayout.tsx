import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

/** Casca das páginas de Login/Cadastro — a foto cobre a página inteira (não só uma coluna
 *  fixa) e vai se apagando conforme se aproxima da área do formulário, num degradê contínuo.
 *  Em telas estreitas a foto some por completo (`lg:`). `children` é a coluna do formulário. */
export function PainelLayout({ frase, children }: { frase: string; children: ReactNode }) {
  return (
    <div className="min-h-screen relative bg-bg-landing overflow-hidden">
      <img
        src="/imagens/tag-resgate-operador.jpg"
        alt=""
        className="hidden lg:block fixed inset-0 h-screen w-[50%] object-cover object-[35%_27%] opacity-90"
      />
      <div
        className="hidden lg:block fixed inset-0 h-screen"
        aria-hidden
        style={{ background: 'linear-gradient(to right, transparent 0%, transparent 19%, rgba(5,6,8,.5) 31%, rgba(5,6,8,.88) 43%, #050608 57%)' }}
      />
      <div className="hidden lg:block fixed inset-0 h-screen bg-gradient-to-t from-bg-landing/65 via-transparent to-bg-landing/35" aria-hidden />
      <div
        className="hidden lg:block fixed inset-0 h-screen"
        aria-hidden
        style={{ background: 'radial-gradient(60% 45% at 0% 0%, rgba(239,68,68,.22), transparent 60%)' }}
      />

      <div className="relative z-10 grid lg:grid-cols-[1fr_1.15fr] min-h-screen">
        <div className="hidden lg:flex flex-col justify-between p-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black/60 border border-status-danger/50 flex items-center justify-center backdrop-blur-sm">
              <img src="/icones/tag-resgate.png" alt="" className="w-6 h-6" />
            </div>
            <div>
              <p className="font-stencil font-bold text-[11px] text-status-danger tracking-[0.14em] uppercase leading-none">TAG Resgate</p>
              <p className="font-mono text-[10px] text-fg-muted tracking-[0.15em] mt-1">IDENTIFICAÇÃO DE EMERGÊNCIA</p>
            </div>
          </Link>

          <div>
            <h2 className="font-hero text-6xl tracking-wide text-white leading-[0.85] [text-shadow:0_4px_24px_rgba(0,0,0,.7)]">
              TAG<br /><span className="text-status-danger">RESGATE</span>
            </h2>
            <p className="text-fg-2/90 text-sm mt-5 max-w-xs leading-relaxed [text-shadow:0_2px_10px_rgba(0,0,0,.6)]">
              {frase}
            </p>
            <div className="flex items-center gap-2 mt-6 text-fg-muted text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-status-danger" />
              <span className="font-mono uppercase tracking-wider">Dados protegidos</span>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}
