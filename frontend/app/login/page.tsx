"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LogIn } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GradientText } from "@/components/ui/gradient-text";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const {
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      console.log("Attempting login with:", { email: data.email });

      const res = await signIn("credentials", {
        redirect: false,
        email: data.email.trim(),
        password: data.password,
      });

      console.log("Login response:", res);

      if (res?.ok) {
        // Get the enterprise ID from the session
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (session?.user?.enterpriseId) {
          console.log("Login successful, redirecting to enterprise dashboard");
          router.push(`/enterprises/${session.user.enterpriseId}`);
        } else {
          console.error("No enterprise ID found in session");
          setError("root", {
            message: "Failed to get enterprise information. Please try again.",
          });
        }
      } else {
        console.error("Login failed:", res?.error);
        setError("root", {
          message: res?.error || "Invalid email or password",
        });
        setError("email", { message: "Invalid email or password" });
        setError("password", { message: "Invalid email or password" });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4"
    >
      {/* Login Card */}
      <Card
        variant="blue"
        intensity="medium"
        className="relative w-full max-w-md glassEffect-medium border-primary/20"
      >
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            <GradientText variant="blue">Welcome</GradientText>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to access your TowerIQ dashboard
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errors.root && (
                <div className="text-sm text-destructive text-center">
                  {errors.root.message}
                </div>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="alice@enterprise.com"
                        autoComplete="email"
                        className="glassEffect-light border-primary/10 focus:border-primary/30"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="glassEffect-light border-primary/10 focus:border-primary/30"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full glassEffect-medium hover:glassEffect-heavy transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" text="" variant="contrast" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
