"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tower, TowerStatus } from "@/lib/data/domain-types";
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { Building2, Wifi, Users, AlertTriangle } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";

// Define columns for the data table
const columns: Column<Tower>[] = [
  {
    key: "id",
    label: "Tower ID",
    sortable: true,
    searchable: true,
  },
  {
    key: "name",
    label: "Tower Name",
    sortable: true,
    searchable: true,
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
    render: (value: TowerStatus) => (
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
    label: "Carriers",
    sortable: false,
    render: (value: Tower["carriers"]) => (
      <div className="flex flex-wrap gap-1">
        {value.map((carrier, i) => (
          <Badge key={i} variant="outline">
            {carrier.carrier}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: "connectedDevices",
    label: "Connected Devices",
    sortable: true,
    render: (value: string[]) => (
      <span className="text-sm">{value.length.toLocaleString()}</span>
    ),
  },
  {
    key: "location",
    label: "Location",
    sortable: false,
    render: (value: Tower["location"]) => (
      <div className="text-sm">
        <div>{value.address}</div>
        <div className="text-muted-foreground">
          {value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
        </div>
      </div>
    ),
  },
];

export default function EnterpriseTowersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [towers, setTowers] = useState<Tower[]>([]);
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

  useEffect(() => {
    async function loadData() {
      if (status === "loading") return;

      if (!session?.user) {
        router.push("/login");
        return;
      }

      try {
        // Load towers data using the consolidated data endpoint
        const towersResponse = await fetch(
          `/api/enterprises/${id}/data?type=towers`
        );
        if (!towersResponse.ok) {
          throw new Error("Failed to load towers data");
        }
        const towersData = await towersResponse.json();
        setTowers(towersData.data);

        // Load metrics
        const metricsResponse = await fetch(`/api/enterprises/${id}/metrics`);
        if (!metricsResponse.ok) {
          throw new Error("Failed to load metrics");
        }
        const metricsData = await metricsResponse.json();

        // Calculate additional tower-specific metrics
        const towerMetrics = {
          ...metricsData.towers,
          totalConnectedDevices: towersData.data.reduce(
            (sum: number, tower: Tower) => sum + tower.connectedDevices.length,
            0
          ),
          averageSignalStrength:
            towersData.data.reduce((sum: number, tower: Tower) => {
              const avgTowerSignal =
                tower.carriers.reduce(
                  (carrierSum, carrier) =>
                    carrierSum + carrier.coverage.signalStrength,
                  0
                ) / tower.carriers.length;
              return sum + avgTowerSignal;
            }, 0) / towersData.data.length,
          maintenanceRequired: towersData.data.filter((t: Tower) =>
            t.equipment.some(
              (e) =>
                e.status === "maintenance" ||
                new Date(e.lastMaintenance).getTime() <
                  Date.now() - 30 * 24 * 60 * 60 * 1000
            )
          ).length,
        };

        setMetrics(towerMetrics);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load tower data"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session, status, id, router]);

  if (status === "loading" || loading) {
    return <FullPageLoadingSpinner text="Loading towers..." />;
  }

  if (error) {
    return (
      <PageTransition>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-destructive">{error}</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
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
              icon={Building2}
            >
              <CardHeader>
                <CardTitle>
                  <GradientText variant="blue">Towers</GradientText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">
                  {metrics?.total ?? 0}
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {metrics?.active ?? 0} active towers
                  </p>
                </div>
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
                  <GradientText variant="orange">
                    Connected Devices
                  </GradientText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {metrics?.totalConnectedDevices?.toLocaleString() ?? 0}
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Across all towers
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              variant="green"
              intensity="medium"
              className="glassEffect-medium"
              icon={Wifi}
            >
              <CardHeader>
                <CardTitle>
                  <GradientText variant="green">Signal Strength</GradientText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {metrics?.averageSignalStrength?.toFixed(1) ?? 0} dBm
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Average across all towers
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              variant="purple"
              intensity="medium"
              className="glassEffect-medium"
              icon={AlertTriangle}
            >
              <CardHeader>
                <CardTitle>
                  <GradientText variant="purple">Maintenance</GradientText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">
                  {metrics?.maintenanceRequired ?? 0}
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Towers needing attention
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                <GradientText variant="blue">Tower Directory</GradientText>
              </h2>
            </div>
            <DataTable columns={columns} data={towers} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
