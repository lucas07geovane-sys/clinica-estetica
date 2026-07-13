import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thay Rosalis Beauty - Sistema de Gestão",
  description: "Gerenciamento inteligente de clientes e retornos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-[#FAF7F9]">
        {children}
      </body>
    </html>
  );
}