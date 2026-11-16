import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

const titulo = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--fonte-titulo",
  display: "swap",
});

const texto = Figtree({
  subsets: ["latin"],
  variable: "--fonte-texto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lado Positivo",
  description:
    "Um chatbot que responde sempre com positividade e te ajuda a olhar para as situações de outra perspetiva.",
};

export const viewport: Viewport = {
  themeColor: "#BC9468",
  // Deixa a app chegar às margens de ecrãs com recorte; as margens seguras tratam do resto.
  viewportFit: "cover",
  // Em Android, o teclado encolhe a página em vez de a tapar.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${titulo.variable} ${texto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
