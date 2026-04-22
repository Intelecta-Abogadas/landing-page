import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monitor de Marcas — Custodia marcaria automatizada para abogados",
  description:
    "Software legal que detecta conflictos en publicaciones del INPI. Alertas inteligentes, custodia automatizada y gestión centralizada de marcas para abogados y estudios en Argentina.",
  openGraph: {
    title: "Monitor de Marcas — Custodia marcaria automatizada",
    description:
      "Dejá de revisar boletines manualmente. Alertas inteligentes para abogados de propiedad intelectual.",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
