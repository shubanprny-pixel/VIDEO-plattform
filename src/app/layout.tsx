import type { Metadata } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const shipporiMincho = Shippori_Mincho({
  variable: "--font-shippori-mincho",
  weight: ["500", "700"],
  subsets: ["latin"],
});

const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "動画講座プラットフォーム",
  description: "YouTube動画を使ったオンライン講座プラットフォーム",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${shipporiMincho.variable} ${zenKaku.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
