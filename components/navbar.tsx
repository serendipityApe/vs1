"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import NextLink from "next/link";

import { useSupabase } from "@/app/supabase-provider";
import { ThemeSwitch } from "@/components/theme-switch";
import { LogoIcon, LoginIcon } from "@/components/icons";

const navMenuItems = [
  { label: "Leaderboard", href: "/" },
  { label: "Submit", href: "/submit" },
  { label: "About", href: "/about" },
];

export const Navbar = () => {
  const { supabase, user, session } = useSupabase();

  const status: "loading" | "authenticated" | "unauthenticated" =
    session === undefined
      ? "loading"
      : session
        ? "authenticated"
        : "unauthenticated";

  const handleSignIn = async () => {
    await supabase?.auth.signInWithOAuth({ provider: "github" });
  };

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
  };

  const displayName = (user?.user_metadata as any)?.username || user?.email;
  const avatarSrc =
    (user?.user_metadata as any)?.avatar_url ||
    (user?.user_metadata as any)?.avatarUrl ||
    undefined;

  return (
    <HeroUINavbar
      className="border-b-2 border-divider bg-background"
      classNames={{
        item: [
          "flex",
          "relative",
          "h-full",
          "items-center",
          "data-[active=true]:after:content-['']",
          "data-[active=true]:after:absolute",
          "data-[active=true]:after:bottom-0",
          "data-[active=true]:after:left-0",
          "data-[active=true]:after:right-0",
          "data-[active=true]:after:h-[2px]",
          "data-[active=true]:after:bg-primary",
        ],
      }}
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-3" href="/">
            <LogoIcon className="w-8 h-8 text-primary" />
            <div className="hidden sm:block">
              <p className="font-bold font-mono text-xl uppercase tracking-tighter">
                VIBE_SHIT
              </p>
            </div>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="flex gap-3">
          {status === "loading" ? (
            <Button
              isLoading
              className="font-mono uppercase"
              radius="none"
              size="sm"
              variant="ghost"
            >
              Loading
            </Button>
          ) : session ? (
            <>
              <Button
                as={NextLink}
                className="font-bold font-mono uppercase border-2 border-transparent hover:border-foreground hover:bg-primary/90"
                color="primary"
                href="/submit"
                radius="none"
                size="sm"
              >
                Submit_Shit
              </Button>
              <Dropdown placement="bottom-end" radius="none">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    className="transition-transform cursor-pointer ring-2 ring-primary ring-offset-2 ring-offset-background"
                    name={displayName || "User"}
                    radius="none"
                    size="sm"
                    src={avatarSrc}
                  />
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="User menu"
                  className="font-mono"
                  variant="flat"
                >
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">{displayName}</p>
                    <p className="text-sm text-foreground-500">{user?.email}</p>
                  </DropdownItem>
                  <DropdownItem key="settings" as={NextLink} href="/profile">
                    PROFILE
                  </DropdownItem>
                  <DropdownItem
                    key="my-projects"
                    as={NextLink}
                    href="/my-projects"
                  >
                    MY_SHIT
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    className="text-danger"
                    color="danger"
                    onPress={handleSignOut}
                  >
                    LOGOUT
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          ) : (
            <>
              <Button
                className="font-bold font-mono uppercase border-2 border-transparent hover:border-foreground"
                color="primary"
                radius="none"
                startContent={<LoginIcon className="w-4 h-4" />}
                onPress={handleSignIn}
              >
                Login_with_GitHub
              </Button>
            </>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="bg-background/95 border-t border-divider pt-6 font-mono">
        <div className="mx-4 flex flex-col gap-4">
          {navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              <Link
                className="w-full text-2xl font-bold uppercase"
                color="foreground"
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <div className="flex flex-col gap-4 w-full pt-6 border-t-2 border-divider">
              {session ? (
                <>
                  <div className="flex items-center gap-4 p-2 border border-divider bg-content1">
                    <Avatar
                      name={displayName || "User"}
                      radius="none"
                      size="md"
                      src={avatarSrc}
                    />
                    <div>
                      <p className="text-base font-bold uppercase">
                        {displayName}
                      </p>
                      <p className="text-xs text-foreground-500 font-mono">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    as={NextLink}
                    className="w-full font-bold uppercase border-2 border-transparent"
                    color="primary"
                    href="/submit"
                    radius="none"
                    size="lg"
                  >
                    Submit_Shit
                  </Button>
                  <Button
                    className="w-full font-bold uppercase border-2"
                    radius="none"
                    size="lg"
                    variant="bordered"
                    onPress={handleSignOut}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full font-bold uppercase border-2 border-transparent"
                    color="primary"
                    radius="none"
                    size="lg"
                    onPress={handleSignIn}
                  >
                    Login_with_GitHub
                  </Button>
                </>
              )}
            </div>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
