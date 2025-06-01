"use client";

import * as React from "react";
import Link from "next/link";
import { User, Clover } from "lucide-react";

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

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

export default function Navigationbar() {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {/* Mobile Menu */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full sm:w-[400px] p-6 transition-all duration-300 ease-in-out"
              >
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-xl">Navigation Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-6">
                  <div className="space-y-4">
                    <Link
                      href="/"
                      className="text-lg font-semibold hover:text-primary transition-colors duration-200"
                    >
                      Home
                    </Link>
                    <Link
                      href="/docs"
                      className="text-lg font-semibold hover:text-primary transition-colors duration-200"
                    >
                      Documentation
                    </Link>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">Getting Started</h4>
                    <div className="space-y-2">
                      <Link
                        href="/docs"
                        className="block text-base hover:text-primary transition-colors duration-200"
                      >
                        Introduction
                      </Link>
                      <Link
                        href="/docs/installation"
                        className="block text-base hover:text-primary transition-colors duration-200"
                      >
                        Installation
                      </Link>
                      <Link
                        href="/docs/primitives/typography"
                        className="block text-base hover:text-primary transition-colors duration-200"
                      >
                        Typography
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">Components</h4>
                    <div className="space-y-2">
                      {components.map((component) => (
                        <Link
                          key={component.title}
                          href={component.href}
                          className="block text-base hover:text-primary transition-colors duration-200"
                        >
                          {component.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-3 font-semibold">
              <Clover className="h-8 w-8 text-foreground" />
              <span className="text-xl">TowerIQ</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 p-4">
            <Link href="/" className="flex items-center gap-3 font-semibold">
              <Clover className="h-8 w-8 text-foreground" />
              <span className="text-xl">TowerIQ</span>
            </Link>
            <NavigationMenu>
              <NavigationMenuList className="gap-6">
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              shadcn/ui
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Beautifully designed components built with Radix
                              UI and Tailwind CSS.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/docs" title="Introduction">
                        Re-usable components built using Radix UI and Tailwind
                        CSS.
                      </ListItem>
                      <ListItem href="/docs/installation" title="Installation">
                        How to install dependencies and structure your app.
                      </ListItem>
                      <ListItem
                        href="/docs/primitives/typography"
                        title="Typography"
                      >
                        Styles for headings, paragraphs, lists...etc
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                      {components.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/docs" className={navigationMenuTriggerStyle()}>
                      Documentation
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="h-24" />{" "}
      {/* Spacer div to prevent content from being hidden under the fixed navbar */}
    </>
  );
}

const ListItem = React.forwardRef<
  React.ComponentRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
