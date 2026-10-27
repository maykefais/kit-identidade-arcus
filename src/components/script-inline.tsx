// Script que roda no carregamento completo da página, antes da primeira pintura.
// No cliente vira text/plain para o React não reclamar de <script> renderizado (guia "preventing flash" do Next).
export function ScriptInline({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
