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
  Wrench,
  Users,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface SidebarProps {
  enterpriseId: string;
  isMobile?: boolean;
  onClose?: () => void;
  user?: { role: string };
}

export default function Sidebar({
  enterpriseId,
  isMobile,
  onClose,
  user,
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
      icon: Users,
    },
  ];

  const adminRoutes = [
    {
      title: "Admin Panel",
      items: [
        {
          title: "Overview",
          href: `/enterprises/${enterpriseId}/admin`,
          icon: LayoutDashboard,
        },
        {
          title: "Remediation",
          href: `/enterprises/${enterpriseId}/admin/remediation`,
          icon: Wrench,
        },
      ],
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
                    : "text-foreground hover:bg-accent/40 hover:text-accent-foreground"
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
                : "text-foreground hover:bg-accent/40 hover:text-accent-foreground"
            )}
          >
            {content}
          </Link>
        );
      })}

      <div className="my-4 border-t border-border" />
      <div className="space-y-4">
        {adminRoutes.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 px-4 text-lg font-semibold tracking-tight text-primary">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-all hover:bg-accent",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
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
          <VisuallyHidden.Root>
            <SheetTitle>Enterprise Navigation</SheetTitle>
            <SheetDescription>
              Access enterprise management features and navigation
            </SheetDescription>
          </VisuallyHidden.Root>
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
