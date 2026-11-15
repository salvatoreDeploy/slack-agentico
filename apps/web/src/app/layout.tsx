import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Full Cycle Chat",
  description: "Chat de equipe com Agentes de IA dentro da conversa.",
};

export default function rootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${lato.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
