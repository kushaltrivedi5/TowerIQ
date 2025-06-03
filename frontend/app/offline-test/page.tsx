"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WifiOff, Wifi, RefreshCw, Database, Shield } from "lucide-react";
import {
  registerServiceWorker,
  isServiceWorkerActive,
  getServiceWorkerRegistration,
} from "@/lib/utils/service-worker-registration";

export default function OfflineTestPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [cacheStatus, setCacheStatus] = useState<Record<string, boolean>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] =
    useState(false);

  // Handle client-side mounting and service worker registration
  useEffect(() => {
    const init = async () => {
      setIsMounted(true);
      const registration = await registerServiceWorker();
      setIsServiceWorkerRegistered(!!registration);
    };
    init();
  }, []);

  // Check online status
  useEffect(() => {
    if (!isMounted) return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Set initial online status
    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isMounted]);

  // Test cache status
  const testCache = async () => {
    if (!isMounted) return;

    setIsTesting(true);
    const status: Record<string, boolean> = {};

    try {
      // Test static assets
      const staticAssets = [
        "/",
        "/offline",
        "/login",
        "/manifest.json",
        "/favicon.ico",
        "/images/logo.png",
        "/globals.css",
      ];

      for (const asset of staticAssets) {
        try {
          const response = await fetch(asset, { cache: "force-cache" });
          status[asset] = response.ok;
        } catch {
          status[asset] = false;
        }
      }

      // Test API endpoints
      const apiEndpoints = ["/api/enterprises", "/api/metrics"];

      for (const endpoint of apiEndpoints) {
        try {
          const response = await fetch(endpoint, { cache: "force-cache" });
          status[endpoint] = response.ok;
        } catch {
          status[endpoint] = false;
        }
      }

      setCacheStatus(status);
    } finally {
      setIsTesting(false);
    }
  };

  // Toggle offline mode
  const toggleOffline = async () => {
    if (!isMounted) return;

    const registration = await getServiceWorkerRegistration();
    if (registration?.active) {
      registration.active.postMessage({ type: "TOGGLE_OFFLINE" });
    }
  };

  // Don't render anything until client-side
  if (!isMounted) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Offline Testing</h1>
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-2 ${
              isOnline ? "text-green-500" : "text-red-500"
            }`}
          >
            {isOnline ? (
              <Wifi className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Service Worker Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Service Worker
              </span>
              <span
                className={
                  isServiceWorkerRegistered ? "text-green-500" : "text-red-500"
                }
              >
                {isServiceWorkerRegistered ? "Active" : "Inactive"}
              </span>
            </div>
            <Button
              onClick={toggleOffline}
              variant="outline"
              className="w-full"
              disabled={!isServiceWorkerRegistered}
            >
              {isOnline ? "Simulate Offline" : "Simulate Online"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Cache Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Cache Status
              </span>
              <Button
                onClick={testCache}
                disabled={isTesting || !isServiceWorkerRegistered}
                variant="outline"
                size="sm"
              >
                {isTesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  "Test Cache"
                )}
              </Button>
            </div>
            {Object.entries(cacheStatus).length > 0 && (
              <div className="space-y-2">
                {Object.entries(cacheStatus).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate">{key}</span>
                    <span className={value ? "text-green-500" : "text-red-500"}>
                      {value ? "Cached" : "Not Cached"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>1. Wait for the Service Worker to be active (green status)</p>
          <p>2. Use the "Simulate Offline" button to test offline behavior</p>
          <p>3. Click "Test Cache" to verify cached resources</p>
          <p>4. Try navigating to different pages while offline</p>
          <p>5. Check if the offline fallback page appears when needed</p>
        </div>
      </Card>
    </div>
  );
}
