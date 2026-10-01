/** Espelha `CAMPOS_VISIBILIDADE` do backend (`modules/auth/campos-visibilidade.ts`) — grupos de
 *  campo da ficha de emergência que podem ser marcados individualmente como privados. Regra
 *  geral: tudo público por padrão; a pessoa desmarca item por item o que quiser esconder de
 *  quem ler o QR/NFC sem estar logado. */
export const CAMPOS_TAG_VISIBILIDADE = [
  'tipo_sanguineo',
  'alergias',
  'condicao_saude',
  'medicamentos',
  'plano_saude',
  'contato_emergencia',
] as const

export type CampoTagVisibilidade = typeof CAMPOS_TAG_VISIBILIDADE[number]

export const LABEL_CAMPO_TAG_VISIBILIDADE: Record<CampoTagVisibilidade, string> = {
  tipo_sanguineo: 'Tipo sanguíneo',
  alergias: 'Alergias',
  condicao_saude: 'Condição de saúde',
  medicamentos: 'Medicamentos',
  plano_saude: 'Plano de saúde',
  contato_emergencia: 'Contato de emergência',
}
