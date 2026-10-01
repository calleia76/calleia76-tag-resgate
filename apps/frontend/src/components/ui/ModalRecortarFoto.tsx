import { useState, useCallback } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { ZoomIn } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { recortarImagem } from '@/lib/cropImagem'

interface Props {
  open: boolean
  imagemSrc: string
  aspecto: number
  cropShape?: 'rect' | 'round'
  nomeArquivo: string
  titulo?: string
  onCancelar: () => void
  onConfirmar: (arquivo: File) => void
}

/** Recorte/zoom de foto antes do upload — deixa a pessoa ajustar o enquadramento (arrastar e
 *  aproximar) dentro da proporção exata do avatar circular, antes de confirmar o envio. */
export function ModalRecortarFoto({
  open, imagemSrc, aspecto, cropShape = 'rect', nomeArquivo, titulo = 'Ajustar enquadramento da foto', onCancelar, onConfirmar,
}: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [areaRecorte, setAreaRecorte] = useState<Area | null>(null)
  const [processando, setProcessando] = useState(false)

  const aoCompletarRecorte = useCallback((_areaPercentual: Area, areaPixels: Area) => {
    setAreaRecorte(areaPixels)
  }, [])

  async function confirmar() {
    if (!areaRecorte) return
    setProcessando(true)
    try {
      const arquivo = await recortarImagem(imagemSrc, areaRecorte, nomeArquivo)
      onConfirmar(arquivo)
    } finally {
      setProcessando(false)
    }
  }

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onCancelar}
      title={titulo}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onCancelar} disabled={processando}>Cancelar</Button>
          <Button size="sm" loading={processando} onClick={confirmar}>Usar esta foto</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="relative w-full h-80 bg-bg-primary rounded-lg overflow-hidden">
          <Cropper
            image={imagemSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspecto}
            cropShape={cropShape}
            showGrid={cropShape === 'rect'}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={aoCompletarRecorte}
          />
        </div>
        <div className="flex items-center gap-3">
          <ZoomIn className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="w-full accent-status-danger"
          />
        </div>
        <p className="text-text-muted text-[11px]">Arraste a imagem para posicionar e use o controle para aproximar.</p>
      </div>
    </Modal>
  )
}
