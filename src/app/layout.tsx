import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Educare - Toko Guidebook & Panduan Digital Praktis",
  description: "Platform buku panduan digital berstandar industri dengan materi teruji, kode siap pakai, dan pembaruan seumur hidup gratis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
