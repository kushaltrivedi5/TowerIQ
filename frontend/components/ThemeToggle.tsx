"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GradientText } from "@/components/ui/gradient-text";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="glassEffect-light hover:glassEffect-medium border-primary/10 hover:border-primary/20 transition-all duration-300"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-primary" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-primary" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="glassEffect-medium border-primary/20 p-2 min-w-[8rem]"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "hover:glassEffect-light focus:glassEffect-light",
            "focus:outline-none focus:ring-2 focus:ring-primary/20",
            theme === "light" && "glassEffect-light bg-primary/5 text-primary"
          )}
        >
          <Sun className="h-4 w-4 text-primary" />
          <GradientText
            variant="blue"
            className={cn(
              "text-sm font-medium",
              theme === "light" && "text-primary"
            )}
          >
            Light
          </GradientText>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "hover:glassEffect-light focus:glassEffect-light",
            "focus:outline-none focus:ring-2 focus:ring-primary/20",
            theme === "dark" && "glassEffect-light bg-primary/5 text-primary"
          )}
        >
          <Moon className="h-4 w-4 text-primary" />
          <GradientText
            variant="purple"
            className={cn(
              "text-sm font-medium",
              theme === "dark" && "text-primary"
            )}
          >
            Dark
          </GradientText>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "hover:glassEffect-light focus:glassEffect-light",
            "focus:outline-none focus:ring-2 focus:ring-primary/20",
            theme === "system" && "glassEffect-light bg-primary/5 text-primary"
          )}
        >
          <Laptop className="h-4 w-4 text-primary" />
          <GradientText
            variant="green"
            className={cn(
              "text-sm font-medium",
              theme === "system" && "text-primary"
            )}
          >
            System
          </GradientText>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
