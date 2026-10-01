/** Lista fechada dos 8 tipos sanguíneos existentes — evita texto livre digitado errado (ex.:
 *  "O positivo", "o+", "0+") que quebraria a leitura rápida numa emergência. */
export const TIPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
