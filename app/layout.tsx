import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monitor de Marcas | Custodia inteligente de marcas",
  description:
    "Herramienta de monitoreo y custodia activa de marcas. Organizá, monitoreá y protegé tus marcas registradas en un solo lugar.",
  openGraph: {
    title: "Monitor de Marcas | Custodia inteligente de marcas",
    description:
      "Herramienta de monitoreo y custodia activa de marcas. Organizá, monitoreá y protegé tus marcas registradas en un solo lugar.",
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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
