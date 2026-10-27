// Exemplo de src/app/layout.tsx com o que a identidade precisa: Inter em --font-inter, tema sem piscar,
// tooltips e avisos (toast). Junte ao layout do seu projeto; não precisa substituir o arquivo inteiro.
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Avisos } from "@/components/avisos";
import { ScriptInline } from "@/components/script-inline";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SCRIPT_TEMA } from "@/lib/tema";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nome do sistema",
};

// viewport-fit=cover libera env(safe-area-inset-*) para o entalhe e a barra de início do iPhone.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F1E6" },
    { media: "(prefers-color-scheme: dark)", color: "#1B1735" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ScriptInline html={SCRIPT_TEMA} />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Avisos />
      </body>
    </html>
  );
}
