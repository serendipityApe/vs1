import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: {
    default: "Vibe Shit - 辉煌的失败展示台",
    template: `%s - Vibe Shit`,
  },
  description:
    "一个专门展示辉煌失败编程项目的平台。在这里，bug不是缺陷，而是特色。",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-6 border-t border-divider">
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-sm text-foreground-600">
                  © 2024 Vibe Shit. 庆祝每一个辉煌的失败。
                </p>
                <Link
                  isExternal
                  className="flex items-center gap-1 text-xs text-foreground-500"
                  href="https://heroui.com"
                  title="heroui.com homepage"
                >
                  <span>Powered by</span>
                  <span className="text-primary">HeroUI</span>
                </Link>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
