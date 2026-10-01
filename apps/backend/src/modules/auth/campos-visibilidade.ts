/** Grupos de campo da ficha que podem ser marcados individualmente como privados. Regra geral:
 *  tudo público por padrão; a pessoa desmarca item por item o que quiser esconder de quem ler o
 *  QR/NFC sem estar logado. Espelha `src/lib/tagVisibilidade.ts` no frontend. */
export const CAMPOS_VISIBILIDADE = [
  'tipo_sanguineo',
  'alergias',
  'condicao_saude',
  'medicamentos',
  'plano_saude',
  'contato_emergencia',
] as const

export type CampoVisibilidade = typeof CAMPOS_VISIBILIDADE[number]

export function sanitizarCamposPrivados(valor: unknown): CampoVisibilidade[] {
  if (!Array.isArray(valor)) return []
  return valor.filter((v): v is CampoVisibilidade => (CAMPOS_VISIBILIDADE as readonly string[]).includes(v))
}
