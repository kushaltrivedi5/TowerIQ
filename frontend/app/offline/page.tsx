"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { offlineStorage } from "@/lib/utils/offline-storage";

export default function OfflinePage() {
  const [lastSync, setLastSync] = useState<string>("");
  const [pendingSync, setPendingSync] = useState<number>(0);
  const [cachedData, setCachedData] = useState<any[]>([]);

  useEffect(() => {
    // Get last sync time
    const lastSyncTime = localStorage.getItem("last_sync");
    if (lastSyncTime) {
      const date = new Date(parseInt(lastSyncTime));
      setLastSync(date.toLocaleString());
    }

    // Get pending sync items
    const queue = offlineStorage.getSyncQueue();
    setPendingSync(queue.length);

    // Get cached data
    const allCachedData = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("offline_data_")) {
        const data = offlineStorage.getOfflineData(key);
        if (data) {
          allCachedData.push({
            key,
            ...data,
          });
        }
      }
    }
    setCachedData(allCachedData);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSync = async () => {
    await offlineStorage.syncOfflineData();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 space-y-6">
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
          <WifiOff className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">You're Offline</h1>
        </div>

        <div className="space-y-4">
          <p className="text-center text-muted-foreground">
            Please check your internet connection and try again.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Sync</p>
                  <p className="text-sm text-muted-foreground">
                    {lastSync || "Never"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Pending Sync</p>
                  <p className="text-sm text-muted-foreground">
                    {pendingSync} items
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {cachedData.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Cached Data</h2>
              <div className="space-y-2">
                {cachedData.map((item) => (
                  <Card key={item.key} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{item.type}</p>
                        <p className="text-xs text-muted-foreground">
                          Last updated:{" "}
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.syncStatus === "synced"
                            ? "bg-green-100 text-green-800"
                            : item.syncStatus === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.syncStatus}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Page</span>
          </Button>
          <Button
            onClick={handleSync}
            className="flex items-center space-x-2"
            disabled={pendingSync === 0}
          >
            <Database className="h-4 w-4" />
            <span>Sync Data</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
