import type { Area } from 'react-easy-crop'

/** Recorta uma imagem a partir da área selecionada no cropper (em pixels da imagem original) e
 *  devolve um File JPEG pronto para upload. */
export async function recortarImagem(imagemSrc: string, area: Area, nomeArquivo: string): Promise<File> {
  const imagem = await carregarImagem(imagemSrc)

  const canvas = document.createElement('canvas')
  canvas.width = area.width
  canvas.height = area.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível preparar o recorte da imagem')

  ctx.drawImage(imagem, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height)

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92))
  if (!blob) throw new Error('Não foi possível gerar o recorte da imagem')

  return new File([blob], nomeArquivo, { type: 'image/jpeg' })
}

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imagem = new Image()
    imagem.crossOrigin = 'anonymous'
    imagem.onload = () => resolve(imagem)
    imagem.onerror = reject
    imagem.src = src
  })
}
