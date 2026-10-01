import { ReactNode, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2, AlertTriangle, Phone, Droplet, Pill, HeartPulse, ShieldPlus, CreditCard, PhoneCall, MessageCircle, Lock, X } from 'lucide-react'
import { fichaService } from '@/services/ficha.service'
import { AvisoLGPD } from '@/components/ui/AvisoLGPD'

/** Página pública (sem login) aberta ao aproximar o celular da tag NFC ou ler o QR code —
 *  pensada para ser lida por um socorrista: fonte grande, contraste alto, sem navegação do
 *  portal, botões de ligação diretos (tel:). */
export default function Ficha() {
  const { token } = useParams<{ token: string }>()
  const [fotoAmpliada, setFotoAmpliada] = useState(false)

  const { data: ficha, isLoading, isError } = useQuery({
    queryKey: ['ficha', token],
    queryFn: () => fichaService.buscarPorToken(token!),
    enabled: !!token,
    retry: false,
  })

  return (
    <div className="min-h-screen bg-bg-landing text-fg flex items-center justify-center p-4">
      <AvisoLGPD fixo />
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-bg-card border border-border rounded-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.75)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 shrink-0">
          <div>
            <p className="font-hero text-xl tracking-wide text-status-danger leading-none">TAG RESGATE</p>
            <p className="text-text-secondary text-[10px] font-mono uppercase tracking-widest mt-1">Ficha de Emergência</p>
          </div>
          {!fotoAmpliada && (
            <button
              onClick={() => window.close()}
              aria-label="Fechar"
              title="Fechar"
              className="btn-icon-chip text-text-muted hover:text-text-primary shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-5 overflow-y-auto flex-1 min-h-0">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-16 text-text-secondary">
            <Loader2 className="w-8 h-8 animate-spin text-status-danger" />
            <p className="text-sm">Carregando ficha…</p>
          </div>
        )}

        {isError && (
          <div className="bg-bg-primary border border-status-danger/30 rounded-xl p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-status-danger mx-auto mb-3" />
            <p className="text-fg font-semibold mb-1">Ficha não encontrada</p>
            <p className="text-text-secondary text-sm">Este link ou tag não corresponde a nenhuma ficha de emergência ativa.</p>
          </div>
        )}

        {ficha && (
          <div className="space-y-4">
            <div className="bg-bg-primary border border-border rounded-xl p-5 shadow-card flex items-center gap-4">
              <AvatarFicha nome={ficha.nome} foto={ficha.foto} onAmpliar={ficha.foto ? () => setFotoAmpliada(true) : undefined} />
              <div className="min-w-0">
                <p className="text-fg text-lg font-semibold leading-tight">{ficha.nome}</p>
                {ficha.identificador && <p className="text-text-muted text-sm font-mono mt-0.5">{ficha.identificador}</p>}
              </div>
            </div>

            <a
              href="tel:192"
              className="flex items-center justify-center gap-2 w-full bg-status-danger text-white font-semibold rounded-xl py-3 text-sm shadow-card active:scale-[0.99] transition-transform"
            >
              <PhoneCall className="w-4 h-4" />
              192 — SAMU
            </a>

            <div className="grid grid-cols-1 gap-3">
              <Campo icone={<Droplet className="w-5 h-5 text-status-danger" />} rotulo="Tipo sanguíneo" valor={ficha.tipo_sanguineo} cor="text-status-danger" destaque oculto={ficha.camposOcultos.includes('tipo_sanguineo')} />
              <Campo icone={<AlertTriangle className="w-5 h-5 text-status-warning" />} rotulo="Alergias" valor={ficha.alergias} cor="text-status-warning" oculto={ficha.camposOcultos.includes('alergias')} />
              <Campo icone={<HeartPulse className="w-5 h-5 text-status-warning" />} rotulo="Condições relevantes" valor={ficha.condicoes_relevantes} cor="text-status-warning" oculto={ficha.camposOcultos.includes('condicao_saude')} />
              <Campo icone={<Pill className="w-5 h-5 text-status-info" />} rotulo="Medicação em uso" valor={ficha.medicamentos} cor="text-status-info" oculto={ficha.camposOcultos.includes('medicamentos')} />
              <Campo icone={<ShieldPlus className="w-5 h-5 text-status-info" />} rotulo="Plano de saúde" valor={ficha.plano_saude} cor="text-status-info" oculto={ficha.camposOcultos.includes('plano_saude')} />
              <Campo icone={<CreditCard className="w-5 h-5 text-status-info" />} rotulo="Carteirinha" valor={ficha.numero_carteirinha} cor="text-status-info" oculto={ficha.camposOcultos.includes('plano_saude')} />
            </div>

            {ficha.camposOcultos.includes('contato_emergencia') ? (
              <CampoOcultoAviso rotulo="Contato de emergência" />
            ) : (ficha.contato_emergencia || ficha.telefone_emergencia) && (
              <div className="bg-bg-primary border border-status-danger/40 rounded-xl p-4">
                <p className="text-status-danger text-xs font-mono uppercase tracking-wider mb-2">Contato de emergência</p>
                <p className="text-fg text-sm font-medium mb-3">{ficha.contato_emergencia || '—'}</p>
                {ficha.telefone_emergencia && (
                  <ContatoLigarWhats nome={ficha.contato_emergencia || 'Contato de emergência'} telefoneComDDD={ficha.telefone_emergencia.replace(/\D/g, '')} />
                )}
              </div>
            )}

            {ficha.camposOcultos.length > 0 && (
              <div className="bg-bg-primary border border-status-warning/30 rounded-xl p-3 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                <p className="text-text-secondary text-xs leading-relaxed">
                  {ficha.nome} marcou alguns campos como privados. Faça login para ver tudo:
                  {' '}
                  <a href="/entrar" className="text-status-danger font-semibold hover:underline">Entrar na TAG Resgate</a>.
                </p>
              </div>
            )}

            <p className="text-text-muted text-[11px] text-center pt-2">
              Dados exibidos apenas para atendimento de emergência.
            </p>
          </div>
        )}
        </div>
      </div>

      {fotoAmpliada && ficha?.foto && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFotoAmpliada(false)}
        >
          <button
            onClick={() => setFotoAmpliada(false)}
            aria-label="Fechar foto"
            title="Fechar"
            className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg hover:bg-white/90 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <img
            src={ficha.foto}
            alt={ficha.nome}
            onClick={e => e.stopPropagation()}
            className="max-w-full max-h-full rounded-xl object-contain"
          />
        </div>,
        document.body,
      )}
    </div>
  )
}

function AvatarFicha({ nome, foto, onAmpliar }: { nome: string; foto: string | null; onAmpliar?: () => void }) {
  if (foto) {
    return (
      <button type="button" onClick={onAmpliar} aria-label={`Ampliar foto de ${nome}`} className="shrink-0">
        <img src={foto} alt={nome} className="w-16 h-16 rounded-full object-cover" />
      </button>
    )
  }
  const iniciais = nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
  return (
    <div className="w-16 h-16 rounded-full bg-status-danger/20 border border-status-danger/30 flex items-center justify-center text-status-danger font-mono font-bold text-lg shrink-0">
      {iniciais}
    </div>
  )
}

function Campo({ icone, rotulo, valor, cor, destaque, oculto }: { icone: ReactNode; rotulo: string; valor: string | null; cor?: string; destaque?: boolean; oculto?: boolean }) {
  return (
    <div className="bg-bg-primary border border-border rounded-xl p-4 flex items-center gap-3">
      {icone}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-mono uppercase tracking-wider ${cor ?? 'text-fg'}`}>{rotulo}</p>
        {oculto ? (
          <p className="text-status-warning text-sm flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Privado — faça login para ver</p>
        ) : (
          <p className={destaque ? 'text-fg text-base font-bold' : 'text-fg text-sm'}>{valor || '—'}</p>
        )}
      </div>
    </div>
  )
}

function CampoOcultoAviso({ rotulo }: { rotulo: string }) {
  return (
    <div className="bg-bg-primary border border-border rounded-xl p-4">
      <p className="text-status-danger text-xs font-mono uppercase tracking-wider mb-1">{rotulo}</p>
      <p className="text-status-warning text-sm flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Privado — faça login para ver</p>
    </div>
  )
}

/** Botão de contato que abre uma folha com duas opções — Ligar ou WhatsApp. */
function ContatoLigarWhats({ nome, telefoneComDDD }: { nome: string; telefoneComDDD: string }) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="flex items-center justify-center gap-2 w-full bg-status-danger text-white font-semibold rounded-lg py-2.5 text-sm active:scale-[0.99] transition-transform"
      >
        <Phone className="w-4 h-4" />
        {telefoneComDDD}
      </button>
      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-4"
          onClick={() => setAberto(false)}
        >
          <div
            className="w-full max-w-md bg-bg-card border border-border rounded-2xl p-4 space-y-2 shadow-card"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-fg text-base font-bold text-center mb-1 truncate">{nome}</p>
            <a
              href={`tel:${telefoneComDDD}`}
              onClick={() => setAberto(false)}
              className="flex items-center justify-center gap-2 w-full bg-bg-primary border border-border text-fg font-semibold rounded-xl py-3 text-sm active:scale-[0.99] transition-transform"
            >
              <Phone className="w-4 h-4" />
              Ligar
            </a>
            <a
              href={`https://wa.me/55${telefoneComDDD}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setAberto(false)}
              className="flex items-center justify-center gap-2 w-full bg-status-ok text-white font-semibold rounded-xl py-3 text-sm active:scale-[0.99] transition-transform"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <button
              onClick={() => setAberto(false)}
              className="w-full text-text-muted text-sm py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
