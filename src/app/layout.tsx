import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth";
import { ClientProviders } from "@/components/ClientProviders";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";
import { appConfig } from "@/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: appConfig.app.title,
  description: appConfig.app.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: appConfig.app.shortTitle,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

/**
 * Next.jsアプリケーションのルートレイアウト
 * 全ページ共通のHTML構造、フォント、メタデータ、テーマプロバイダー、PWAインストーラーを提供
 * @param {Object} props - コンポーネントのprops
 * @param {React.ReactNode} props.children - 子要素（ページコンテンツ）
 * @returns {JSX.Element}
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootErrorBoundary>
          <ClientProviders>
            <AuthProvider>{children}</AuthProvider>
          </ClientProviders>
        </RootErrorBoundary>
      </body>
    </html>
  );
}
