/** Máscaras de digitação: mantêm só dígitos conforme o usuário digita e inserem pontuação
 *  automaticamente. Usar sempre no `onChange` do campo (formata o valor antes de gravar no
 *  estado) — nunca aplicar sobre um valor já salvo só para exibição. */

function apenasDigitos(valor: string, max: number): string {
  return valor.replace(/\D/g, '').slice(0, max)
}

/** Telefone com DDD no padrão (##) #####-#### (celular, 9 dígitos) — usado no contato de
 *  emergência, pra nunca aceitar texto solto que quebraria a leitura rápida numa emergência. */
export function formatarTelefoneComDDD(valor: string): string {
  const d = apenasDigitos(valor, 11)
  if (d.length <= 2) return d.length ? `(${d}` : d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Nome de pessoa: só letras — inclusive acentuadas —, espaço, hífen e apóstrofo. Sempre devolve
 *  em maiúsculas, já que todo texto livre do cadastro é gravado em caixa alta. */
export function formatarSomenteNome(valor: string): string {
  return valor
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '')
    .replace(/ {2,}/g, ' ')
    .toUpperCase()
}
