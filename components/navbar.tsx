"use client";

import { useState, useEffect } from "react";
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
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import Image from "next/image";
import clsx from "clsx";

import { useSupabase } from "@/app/supabase-provider";
import { ThemeSwitch } from "@/components/theme-switch";
import { LogoIcon, LoginIcon } from "@/components/icons";

const navItems = [
  { label: "Leaderboard", href: "/" },
  { label: "Submit", href: "/submit" },
  { label: "About", href: "/about" },
];

const navMenuItems = [
  { label: "Leaderboard", href: "/" },
  { label: "Submit", href: "/submit" },
  { label: "About", href: "/about" },
];

export const Navbar = () => {
  const { supabase, user, session } = useSupabase();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      className={clsx(
        "backdrop-blur-md transition-all duration-300 ease-in-out",
        isScrolled
          ? "fixed top-2 left-1/2 transform -translate-x-1/2 w-[800px] bg-background/90 border border-divider rounded-full shadow-lg z-50"
          : "border-b border-divider bg-background/70 w-full"
      )}
      maxWidth={isScrolled ? "full" : "xl"}
      position={isScrolled ? "static" : "sticky"}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-3" href="/">
            <LogoIcon className="w-8 h-8 text-primary" />
            <div className={clsx("hidden sm:block", isScrolled && "hidden")}>
              <p className="font-bold text-inherit text-lg">Vibe Shit</p>
              <p className="text-xs text-foreground-600 leading-none">
                A showcase of glorious failures
              </p>
            </div>
          </NextLink>
        </NavbarBrand>
        <ul
          className={clsx(
            "hidden gap-6 justify-start ml-6",
            isScrolled ? "lg:flex" : "md:flex"
          )}
        >
          {/* {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                  "hover:text-primary transition-colors"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))} */}
        </ul>
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
            <Button isLoading size="sm" variant="ghost">
              Loading
            </Button>
          ) : session ? (
            <>
              <Button
                as={NextLink}
                color="primary"
                radius="full"
                href="/submit"
                size="sm"
              >
                Submit Shit
              </Button>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    className="transition-transform cursor-pointer"
                    name={displayName || "User"}
                    size="sm"
                    src={avatarSrc}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">{displayName}</p>
                    <p className="text-sm text-foreground-500">{user?.email}</p>
                  </DropdownItem>
                  <DropdownItem key="settings" as={NextLink} href="/profile">
                    Profile
                  </DropdownItem>
                  <DropdownItem
                    key="my-projects"
                    as={NextLink}
                    href="/my-projects"
                  >
                    My Shit Projects
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    onPress={handleSignOut}
                  >
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          ) : (
            <>
              <Button
                color="primary"
                startContent={<LoginIcon className="w-4 h-4" />}
                radius="full"
                onPress={handleSignIn}
              >
                Sign in
              </Button>
              {/* <Button radius="full" variant="ghost" onPress={handleSignIn}>
                Submit Shit
              </Button> */}
            </>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              <Link
                className="w-full"
                color={index === 1 ? "primary" : "foreground"}
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <div className="flex flex-col gap-2 w-full pt-4 border-t border-divider">
              {session ? (
                <>
                  <div className="flex items-center gap-2 p-2">
                    <Avatar
                      name={displayName || "User"}
                      size="sm"
                      src={avatarSrc}
                    />
                    <div>
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-foreground-500">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    as={NextLink}
                    color="primary"
                    href="/submit"
                    size="sm"
                  >
                    Submit Shit
                  </Button>
                  <Button size="sm" variant="ghost" onPress={handleSignOut}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="ghost" onPress={handleSignIn}>
                    Login
                  </Button>
                  <Button color="primary" size="sm" onPress={handleSignIn}>
                    Submit Shit
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
