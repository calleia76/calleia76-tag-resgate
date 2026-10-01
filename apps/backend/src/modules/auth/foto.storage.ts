import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PASTA_UPLOADS = path.resolve(__dirname, '../../../uploads')

const EXTENSAO_POR_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/** Salva a foto em disco local (pasta `uploads/`, servida como estático em `/uploads`) e
 *  devolve a URL pública relativa. Guardado em disco simples de propósito — é o backend mais
 *  simples possível para rodar localmente sem depender de nenhum serviço externo; para produção
 *  numa VPS basta manter a pasta persistida fora do processo de deploy (ou trocar esta função
 *  por um upload a um bucket/S3 compatível, sem mexer em mais nada do sistema). */
export async function salvarFoto(buffer: Buffer, mimetype: string): Promise<string> {
  const extensao = EXTENSAO_POR_MIME[mimetype]
  if (!extensao) throw new Error('Formato de imagem não suportado. Use JPEG, PNG ou WEBP.')

  await mkdir(PASTA_UPLOADS, { recursive: true })
  const nomeArquivo = `${randomUUID()}.${extensao}`
  await writeFile(path.join(PASTA_UPLOADS, nomeArquivo), buffer)
  return `/uploads/${nomeArquivo}`
}
