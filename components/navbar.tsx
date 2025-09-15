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
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { useSession, signIn, signOut } from "next-auth/react";

import { ThemeSwitch } from "@/components/theme-switch";

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
  const { data: session, status } = useSession();

  const handleSignIn = () => {
    signIn("github");
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky" className="border-b border-divider bg-background/70 backdrop-blur-md">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-3" href="/">
            <div className="w-8 h-8">
              <img src="/logo.svg" alt="Vibe Shit Logo" className="w-full h-full" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-inherit text-lg">Vibe Shit</p>
              <p className="text-xs text-foreground-600 leading-none">
                A showcase of glorious failures
              </p>
            </div>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden md:flex gap-6 justify-start ml-6">
          {navItems.map((item) => (
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
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="flex gap-3">
          {status === "loading" ? (
            <Button variant="ghost" size="sm" isLoading>
              Loading
            </Button>
          ) : session ? (
            <>
              <Button color="primary" size="sm" as={NextLink} href="/submit">
                Submit Shit
              </Button>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    className="transition-transform"
                    size="sm"
                    src={session.user.image || undefined}
                    name={session.user.username || session.user.name || "User"}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">
                      {session.user.username || session.user.name}
                    </p>
                    <p className="text-sm text-foreground-500">
                      {session.user.email}
                    </p>
                  </DropdownItem>
                  <DropdownItem key="settings" as={NextLink} href="/profile">
                    Profile
                  </DropdownItem>
                  <DropdownItem key="my-projects" as={NextLink} href="/my-projects">
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
              <Button variant="ghost" size="sm" onPress={handleSignIn}>
                Login
              </Button>
              <Button color="primary" size="sm" onPress={handleSignIn}>
                Submit Shit
              </Button>
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
                      size="sm"
                      src={session.user.image || undefined}
                      name={session.user.username || session.user.name || "User"}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {session.user.username || session.user.name}
                      </p>
                      <p className="text-xs text-foreground-500">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <Button color="primary" size="sm" as={NextLink} href="/submit">
                    Submit Shit
                  </Button>
                  <Button variant="ghost" size="sm" onPress={handleSignOut}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onPress={handleSignIn}>
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
