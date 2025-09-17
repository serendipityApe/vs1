"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { SupabaseProvider } from "./supabase-provider";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <SupabaseProvider>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>
          <div className="fixed z-[100]">
            <ToastProvider placement="top-center" toastOffset={60} />
          </div>
          {children}
        </NextThemesProvider>
      </HeroUIProvider>
    </SupabaseProvider>
  );
}
