"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ThemeToggle";
import { Button } from "./ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { GradientText } from "./ui/gradient-text";
import {
  LogOut,
  User,
  Clover,
  LayoutDashboard,
  Shield,
  RadioTower,
  Smartphone,
  LogIn,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar } from "./ui/avatar";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Transform scroll position to background opacity with higher density
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0, 0.98]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Policies",
      href: "/policies",
      icon: Shield,
    },
    {
      name: "Towers",
      href: "/towers",
      icon: RadioTower,
    },
    {
      name: "Devices",
      href: "/devices",
      icon: Smartphone,
    },
  ];

  return (
    <motion.nav
      style={{
        backgroundColor: `rgb(var(--background) / ${backgroundOpacity.get()})`,
      }}
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all duration-200",
        isScrolled ? "bg-background/98 shadow-md" : "bg-background/90"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Clover className="h-10 w-10 text-primary" />
              </motion.div>
              <span className="text-2xl font-semibold">TowerIQ</span>
            </Link>
            {status === "authenticated" && (
              <div className="hidden md:flex md:items-center md:gap-8">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.name}
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                          isActive
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <ModeToggle />
            {status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-background/80"
                  >
                    <Avatar
                      image={session.user?.image || undefined}
                      name={session.user?.name || undefined}
                      size="md"
                      className="ring-2 ring-background/80"
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-foreground">
                        {session.user?.name || "User"}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground/90">
                        {session.user?.email}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground/80" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-background/95 backdrop-blur-md border-border/40"
                >
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer focus:bg-destructive/10"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="default"
                  onClick={() => router.push("/login")}
                  className="gap-2 h-11 px-6"
                >
                  <LogIn className="h-5 w-5" />
                  Enterprise Login
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
