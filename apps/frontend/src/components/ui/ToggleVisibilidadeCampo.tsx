import { Globe, Lock } from 'lucide-react'
import { CampoTagVisibilidade } from '@/lib/tagVisibilidade'

/** Botãozinho de público/privado ao lado do rótulo de um campo — clique alterna se aquele campo
 *  específico aparece pra quem lê o QR/NFC sem login. A lista `privados` é só os campos
 *  marcados como privados; o resto é público por padrão. */
export function ToggleVisibilidadeCampo({
  campo,
  privados,
  onToggle,
}: {
  campo: CampoTagVisibilidade
  privados: CampoTagVisibilidade[]
  onToggle: (campo: CampoTagVisibilidade) => void
}) {
  const privado = privados.includes(campo)
  return (
    <button
      type="button"
      onClick={() => onToggle(campo)}
      title={privado ? 'Privado — só quem estiver logado vê este campo' : 'Público — qualquer um que ler o QR/NFC vê este campo'}
      className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded transition-colors ${
        privado ? 'text-status-warning hover:bg-status-warning/10' : 'text-status-ok hover:bg-status-ok/10'
      }`}
    >
      {privado ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
      {privado ? 'Privado' : 'Público'}
    </button>
  )
}
