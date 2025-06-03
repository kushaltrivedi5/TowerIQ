"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Clover, LogOut, Menu, WifiOff, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ThemeToggle";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isOnline = useOnlineStatus();

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  if (status === "loading") {
    return null;
  }

  const enterpriseId = session?.user?.enterpriseId || "";
  const enterpriseName = session?.user?.enterpriseName || "";
  const subscriptionTier = session?.user?.subscriptionTier || "Free";
  const userName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "User";

  const isActive = (path: string) => pathname === path;

  const NavigationLinks = ({ className }: { className?: string }) => (
    <>
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors",
          isActive("/")
            ? "text-primary font-semibold bg-primary/10 px-3 py-2 rounded-lg"
            : "text-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg",
          className
        )}
      >
        Home
      </Link>
      <Link
        href="/login"
        className={cn(
          "text-sm font-medium transition-colors",
          isActive("/login")
            ? "text-primary font-semibold bg-primary/10 px-3 py-2 rounded-lg"
            : "text-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg",
          className
        )}
      >
        Login
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full glassEffect-medium border-b border-border/40">
      <div className="flex h-20 items-center px-6">
        {/* Mobile Menu - Only show when not authenticated */}
        {!session?.user && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0">
              <VisuallyHidden.Root>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>
                  Access navigation links for the website
                </SheetDescription>
              </VisuallyHidden.Root>
              <div className="flex flex-col gap-6 p-8 pt-16">
                <NavigationLinks className="text-base py-2" />
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Mobile Sidebar Trigger - Only show when authenticated */}
        {session?.user && (
          <div className="md:hidden">
            <Sidebar
              enterpriseId={enterpriseId}
              isMobile
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        )}

        {/* Logo and Enterprise Name */}
        <div className="flex items-center gap-3">
          <Clover className="h-8 w-8 text-primary" />
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold">TowerIQ</span>
            {session?.user && (
              <>
                <div className="hidden md:block h-6 w-[2px] bg-border/60 rounded-full" />
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-base text-foreground">
                    {enterpriseName}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Crown className="h-3.5 w-3.5" />
                    <span>{subscriptionTier}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation Links - Only show when not authenticated */}
        {!session?.user && (
          <div className="hidden md:flex items-center gap-6 ml-8">
            <NavigationLinks />
          </div>
        )}

        <div className="ml-auto flex items-center gap-4">
          {/* Offline Indicator */}
          {!isOnline && (
            <div className="flex items-center gap-2 text-yellow-500">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">Offline</span>
            </div>
          )}

          {/* Theme Toggle - Always visible */}
          <ModeToggle />

          {/* User Menu - Only show when authenticated */}
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-12 w-12 rounded-full hover:bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                >
                  <Avatar className="h-8 w-8 border-0">
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-lg">
                      {session.user?.name?.charAt(0) || "U"}
                    </div>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">
                      {session.user?.name}
                    </p>
                    <p className="text-xs leading-none text-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-foreground cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
