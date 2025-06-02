"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Clover,
  LayoutDashboard,
  Shield,
  Radio,
  Smartphone,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Policies",
    href: "/policies",
    icon: Shield,
  },
  {
    title: "Towers",
    href: "/towers",
    icon: Radio,
  },
  {
    title: "Devices",
    href: "/devices",
    icon: Smartphone,
  },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 border-b glassEffect-medium">
        <div className="container mx-auto flex h-20 items-center justify-between px-8">
          {/* Mobile Menu */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-7 w-7" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full sm:w-[400px] p-6 transition-all duration-300 ease-in-out"
              >
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-2xl">Navigation Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-6">
                  <div className="space-y-4">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 text-xl font-semibold hover:text-primary transition-colors duration-200",
                          pathname === item.href && "text-primary"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.title}
                      </Link>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4 mt-8">
                    <span className="text-3xl font-extrabold text-primary">
                      TowerIQ
                    </span>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            <Link
              href="/dashboard"
              className="flex items-center gap-4 font-semibold"
            >
              <Clover className="h-12 w-12 text-foreground" />
              <span className="text-3xl font-extrabold">TowerIQ</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            <Link
              href="/dashboard"
              className="flex items-center gap-4 font-semibold"
            >
              <Clover className="h-12 w-12 text-foreground" />
              <span className="text-3xl font-extrabold">TowerIQ</span>
            </Link>
            <nav className="flex items-center gap-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors duration-200",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <ModeToggle />
            {session ? (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => signOut()}
              >
                <User className="h-7 w-7" />
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-7 w-7" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="h-28" />{" "}
      {/* Spacer div to prevent content from being hidden under the fixed navbar */}
    </>
  );
}
