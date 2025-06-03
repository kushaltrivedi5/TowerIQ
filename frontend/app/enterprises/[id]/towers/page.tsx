"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner";
import { RadioTower, Signal, Wifi, AlertTriangle } from "lucide-react";
import { useEnterpriseData } from "@/lib/hooks/useEnterpriseData";
import { Tower } from "@/lib/data/domain-types";
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
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,
    options: [
      { label: "Active", value: "active" },
      { label: "Maintenance", value: "maintenance" },
      { label: "Offline", value: "offline" },
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
    key: "coverage",
    label: "Coverage",
    sortable: true,
    render: (value: Tower["coverage"]) => (
      <Badge variant="outline">{value.radius} km radius</Badge>
    ),
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
    render: (value: Tower["equipment"]) => (
      <span className="text-sm">
        {value[0]?.lastMaintenance
          ? new Date(value[0].lastMaintenance).toLocaleString()
          : "Never"}
      </span>
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
  const [metrics, setMetrics] = useState<{
    total: number;
    active: number;
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

        <div className="grid gap-4 md:grid-cols-3">
          <Card
            variant="blue"
            intensity="medium"
            className="glassEffect-medium"
            icon={RadioTower}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="blue">Total Towers</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {metrics.total}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all locations
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
                <GradientText variant="green">Active Towers</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {metrics.active}
              </div>
              <p className="text-xs text-muted-foreground">
                {((metrics.active / metrics.total) * 100).toFixed(1)}% of total
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
                <GradientText variant="orange">Offline Towers</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {metrics.total - metrics.active}
              </div>
              <p className="text-xs text-muted-foreground">
                {(
                  ((metrics.total - metrics.active) / metrics.total) *
                  100
                ).toFixed(1)}
                % of total
              </p>
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
