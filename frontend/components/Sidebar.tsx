"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Smartphone,
  RadioTower,
  Shield,
  Settings,
  ChevronRight,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  enterpriseId: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  enterpriseId,
  isMobile,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === `/enterprises/${enterpriseId}${path}`;
  };

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/devices",
      label: "Devices",
      icon: Smartphone,
    },
    {
      href: "/towers",
      label: "Towers",
      icon: RadioTower,
    },
    {
      href: "/policies",
      label: "Policies",
      icon: Shield,
    },
    {
      href: "/users",
      label: "Users",
      icon: Settings,
    },
  ];

  const SidebarContent = () => (
    <nav className="flex flex-col gap-4 p-6">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const content = (
          <>
            <Icon className="h-5 w-5" />
            <span className="text-base">{item.label}</span>
            {isActive(item.href) && (
              <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
            )}
          </>
        );

        if (isMobile) {
          return (
            <SheetClose asChild key={item.href}>
              <Link
                href={`/enterprises/${enterpriseId}${item.href}`}
                className={cn(
                  "flex items-center gap-4 rounded-xl px-4 py-3 text-base transition-colors",
                  isActive(item.href)
                    ? "bg-accent/80 text-accent-foreground font-medium border border-accent-foreground/20 shadow-sm"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-accent-foreground"
                )}
              >
                {content}
              </Link>
            </SheetClose>
          );
        }

        return (
          <Link
            key={item.href}
            href={`/enterprises/${enterpriseId}${item.href}`}
            className={cn(
              "flex items-center gap-4 rounded-xl px-4 py-3 text-base transition-colors",
              isActive(item.href)
                ? "bg-accent/80 text-accent-foreground font-medium border border-accent-foreground/20 shadow-sm"
                : "text-muted-foreground hover:bg-accent/40 hover:text-accent-foreground"
            )}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden h-12 w-12">
            <Menu className="h-7 w-7" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 p-0 glassEffect-medium"
          onInteractOutside={onClose}
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 pt-8">
              <SidebarContent />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden md:block w-72 glassEffect-medium h-full">
      <div className="pt-6">
        <SidebarContent />
      </div>
    </aside>
  );
}
