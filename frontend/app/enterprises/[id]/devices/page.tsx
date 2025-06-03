"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner";
import { Smartphone, Shield, AlertTriangle } from "lucide-react";
import { useEnterpriseData } from "@/lib/hooks/useEnterpriseData";
import type {
  Device,
  DeviceType,
  OperatingSystem,
  Carrier,
} from "@/lib/data/domain-types";
import { GradientText } from "@/components/ui/gradient-text";

// Define columns for devices table
const deviceColumns: Column<Device>[] = [
  {
    key: "id",
    label: "Device ID",
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
    key: "type",
    label: "Type",
    sortable: true,
    filterable: true,
    options: [
      { label: "Smartphone", value: "smartphone" },
      { label: "Tablet", value: "tablet" },
      { label: "Laptop", value: "laptop" },
      { label: "IoT", value: "IoT" },
      { label: "Gateway", value: "gateway" },
    ],
    render: (value: Device["type"]) => (
      <Badge variant="outline">
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Quarantined", value: "quarantined" },
    ],
    render: (value: Device["status"]) => (
      <Badge
        variant={
          value === "active"
            ? "default"
            : value === "inactive"
            ? "secondary"
            : "destructive"
        }
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "securityStatus",
    label: "Security",
    sortable: true,
    filterable: true,
    options: [
      { label: "Compliant", value: "compliant" },
      { label: "Non-compliant", value: "non-compliant" },
      { label: "At Risk", value: "at-risk" },
    ],
    render: (value: Device["securityStatus"]) => (
      <Badge
        variant={
          value.isCompliant
            ? "default"
            : value.vulnerabilities > 0
            ? "destructive"
            : "secondary"
        }
      >
        {value.isCompliant
          ? "Compliant"
          : value.vulnerabilities > 0
          ? "Non-compliant"
          : "At Risk"}
      </Badge>
    ),
  },
  {
    key: "lastSeen",
    label: "Last Seen",
    sortable: true,
    render: (value: string) => (
      <span className="text-sm">{new Date(value).toLocaleString()}</span>
    ),
  },
];

export default function EnterpriseDevicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<{
    total: number;
    active: number;
    nonCompliant: number;
    discovered: number;
    byType: Record<DeviceType, number>;
    byOS: Record<OperatingSystem, number>;
    byCarrier: Record<Carrier, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = use(params);

  const {
    data: devices,
    loading: devicesLoading,
    error: devicesError,
    page,
    totalPages,
    totalItems,
    nextPage,
    previousPage,
    goToPage,
  } = useEnterpriseData<Device>({
    type: "devices",
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
        setMetrics(data.devices);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [session, status, id, router]);

  if (status === "loading" || loading) {
    return <FullPageLoadingSpinner text="Loading devices..." />;
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="text-lg font-semibold">
                {error || "Failed to load device data"}
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
          <Smartphone className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">
            <GradientText variant="multi">Device Management</GradientText>
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card
            variant="blue"
            intensity="medium"
            className="glassEffect-medium"
            icon={Smartphone}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="blue">Devices</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {metrics.total}
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">
                  {metrics.active} active devices
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.discovered} discovered
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.nonCompliant} non-compliant
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="purple"
            intensity="medium"
            className="glassEffect-medium"
            icon={Smartphone}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="purple">Device Types</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(metrics.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{type}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card
            variant="green"
            intensity="medium"
            className="glassEffect-medium"
            icon={Smartphone}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="green">Operating Systems</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(metrics.byOS).map(([os, count]) => (
                  <div key={os} className="flex justify-between items-center">
                    <span className="text-sm">{os}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card
            variant="orange"
            intensity="medium"
            className="glassEffect-medium"
            icon={Smartphone}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="orange">Carriers</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(metrics.byCarrier).map(([carrier, count]) => (
                  <div
                    key={carrier}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{carrier}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          columns={deviceColumns}
          data={devices || []}
          searchKey="name"
          pageSize={10}
          title="Devices"
          description="Manage and monitor your enterprise devices"
        />
      </div>
    </PageTransition>
  );
}
