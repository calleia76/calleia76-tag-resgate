/** Aviso de conformidade com a LGPD (Lei nº 13.709/2018) — texto obrigatório em toda tela que
 *  lida com dado pessoal/sensível (saúde). `fixo`: quando true, o próprio componente se
 *  posiciona fixo na base da viewport — usado nas telas sem um layout comum (Landing, Login,
 *  Ficha pública). */
export function AvisoLGPD({ fixo = false }: { fixo?: boolean }) {
  const conteudo = (
    <p className="text-text-muted text-[10px] leading-snug text-center px-3 py-1.5">
      <span className="font-semibold text-text-secondary">LGPD | Lei nº 13.709/2018</span>
      {' — '}Estes dados são usados apenas para atendimento de emergência. Você controla o que é
      público ou privado na sua ficha e pode editar ou remover seu cadastro a qualquer momento.
    </p>
  )

  if (!fixo) return conteudo

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-bg-primary/95 backdrop-blur border-t border-border">
      {conteudo}
    </div>
  )
}
