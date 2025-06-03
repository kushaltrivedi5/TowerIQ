"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Clover, LogOut } from "lucide-react";
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

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  if (status === "loading") {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const enterpriseId = session.user.enterpriseId || "";
  const enterpriseName = session.user.enterpriseName || "";
  const userName =
    session.user.name || session.user.email?.split("@")[0] || "User";

  return (
    <nav className="sticky top-0 z-50 w-full glassEffect-medium border-b border-border/40">
      <div className="flex h-20 items-center px-6">
        {/* Mobile Sidebar Trigger */}
        <div className="md:hidden">
          <Sidebar
            enterpriseId={enterpriseId}
            isMobile
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>

        {/* Logo and Enterprise Name */}
        <div className="flex items-center gap-3">
          <Clover className="h-8 w-8 text-primary" />
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold">TowerIQ</span>
            <div className="hidden md:block h-6 w-px bg-border" />
            <span className="hidden md:inline text-base text-foreground">
              {enterpriseName}
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {/* Theme Toggle - Always visible */}
          <ModeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-12 w-12 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <div className="flex h-full w-full items-center justify-center bg-muted text-foreground text-lg">
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
        </div>
      </div>
    </nav>
  );
}
