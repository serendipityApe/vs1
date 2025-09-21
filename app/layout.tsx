import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: {
    default: "Vibe Shit - The Hall of Glorious Failures",
    template: `%s - Vibe Shit`,
  },
  description:
    "A platform dedicated to showcasing glorious programming failures. Here, bugs aren't flaws - they're features.",
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
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-6 border-t border-divider">
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-sm text-foreground-600">
                  © 2024 Vibe Shit. Celebrating every glorious failure.
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
