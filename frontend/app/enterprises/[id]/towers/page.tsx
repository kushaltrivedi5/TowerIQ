"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner";
import { RadioTower, Signal, Wifi, AlertTriangle, Users } from "lucide-react";
import { useEnterpriseData } from "@/lib/hooks/useEnterpriseData";
import type { Tower, TowerStatus } from "@/lib/data/domain-types";
import { GradientText } from "@/components/ui/gradient-text";

// Define columns for towers table
const towerColumns: Column<Tower>[] = [
  {
    key: "id",
    label: "Tower ID",
    sortable: true,
    searchable: true,
  },
  {
    key: "name",
    label: "Name",
    sortable: true,
    searchable: true,
  },
  {
    key: "location",
    label: "Location",
    sortable: true,
    searchable: true,
    render: (value: Tower["location"]) => (
      <span className="text-sm">{value.address}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,
    options: [
      { label: "Active", value: "active" },
      { label: "Maintenance", value: "maintenance" },
      { label: "Inactive", value: "inactive" },
    ],
    render: (value: Tower["status"]) => (
      <Badge
        variant={
          value === "active"
            ? "default"
            : value === "maintenance"
            ? "secondary"
            : "destructive"
        }
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "carriers",
    label: "Signal Strength",
    sortable: true,
    render: (value: Tower["carriers"]) => {
      const avgSignalStrength =
        value.reduce(
          (sum, carrier) => sum + carrier.coverage.signalStrength,
          0
        ) / value.length;
      return <Badge variant="outline">{avgSignalStrength.toFixed(1)}%</Badge>;
    },
  },
  {
    key: "connectedDevices",
    label: "Connected Devices",
    sortable: true,
    render: (value: Tower["connectedDevices"]) => (
      <Badge variant="outline">{value.length}</Badge>
    ),
  },
  {
    key: "equipment",
    label: "Last Maintenance",
    sortable: true,
    render: (value: Tower["equipment"]) => {
      const lastMaintenance = value[0]?.lastMaintenance;
      return (
        <span className="text-sm">
          {lastMaintenance
            ? new Date(lastMaintenance).toLocaleString()
            : "Never"}
        </span>
      );
    },
  },
];

export default function EnterpriseTowersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<{
    total: number;
    active: number;
    byStatus: Record<TowerStatus, number>;
    totalConnectedDevices: number;
    averageSignalStrength: number;
    maintenanceRequired: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = use(params);

  const {
    data: towers,
    loading: towersLoading,
    error: towersError,
  } = useEnterpriseData<Tower>({
    type: "towers",
    pageSize: 10,
  });

  useEffect(() => {
    async function loadMetrics() {
      if (status === "loading") return;

      if (
        !session?.user ||
        session.user.role !== "admin" ||
        session.user.enterpriseId !== id
      ) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`/api/enterprises/${id}/metrics`);
        if (!response.ok) {
          throw new Error("Failed to load metrics");
        }
        const data = await response.json();
        setMetrics(data.towers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [session, status, id, router]);

  if (status === "loading" || loading) {
    return <FullPageLoadingSpinner text="Loading towers..." />;
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="text-lg font-semibold">
                {error || "Failed to load tower data"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please try refreshing the page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <RadioTower className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">
            <GradientText variant="multi">Tower Management</GradientText>
          </h1>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card
            variant="blue"
            intensity="medium"
            className="glassEffect-medium"
            icon={RadioTower}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="blue">Towers</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {metrics.total}
              </div>
              <p className="text-xs text-muted-foreground">
                Total network towers
              </p>
            </CardContent>
          </Card>

          <Card
            variant="green"
            intensity="medium"
            className="glassEffect-medium"
            icon={Signal}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="green">Signal Strength</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {(metrics.averageSignalStrength ?? 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average across network
              </p>
            </CardContent>
          </Card>

          <Card
            variant="orange"
            intensity="medium"
            className="glassEffect-medium"
            icon={Users}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="orange">Connected Devices</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {metrics.totalConnectedDevices}
              </div>
              <p className="text-xs text-muted-foreground">
                Active connections
              </p>
            </CardContent>
          </Card>

          <Card
            variant="orange"
            intensity="medium"
            className="glassEffect-medium"
            icon={AlertTriangle}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="orange">Maintenance</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {metrics.maintenanceRequired}
              </div>
              <p className="text-xs text-muted-foreground">
                Towers requiring attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card className="glassEffect-light">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Tower Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(metrics.byStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm capitalize">{status}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glassEffect-light">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Network Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Towers</span>
                  <Badge variant="outline">{metrics.active ?? 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Offline Towers</span>
                  <Badge variant="outline">
                    {metrics.byStatus?.["inactive"] ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Maintenance</span>
                  <Badge variant="outline">
                    {metrics.byStatus?.["maintenance"] ?? 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glassEffect-light">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Signal Strength</span>
                  <Badge variant="outline">
                    {(metrics.averageSignalStrength ?? 0).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Connected Devices</span>
                  <Badge variant="outline">
                    {metrics.totalConnectedDevices ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Maintenance Required</span>
                  <Badge variant="outline">
                    {metrics.maintenanceRequired ?? 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          columns={towerColumns}
          data={towers || []}
          searchKey="name"
          title="Tower Directory"
          description="Manage and monitor all towers in your enterprise"
        />
      </div>
    </PageTransition>
  );
}
