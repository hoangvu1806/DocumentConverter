import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Document Converter - LaTeX to DOCX",
  description: "Convert LaTeX documents to DOCX and other formats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
