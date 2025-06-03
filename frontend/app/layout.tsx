import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { register } from "@/lib/utils/service-worker-registration";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TowerIQ - Telecom Mission Control",
  description: "Enterprise-grade telecom infrastructure management platform",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TowerIQ - Telecom Mission Control",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Register service worker in production
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    register({
      onSuccess: (registration) => {
        console.log("Service worker registered successfully");
      },
      onUpdate: (registration) => {
        console.log("New service worker available");
      },
    });
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
