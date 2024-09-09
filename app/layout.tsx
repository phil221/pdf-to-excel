import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF2Excel",
  description: "PDF to Excel Converter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
