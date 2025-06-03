"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Smartphone,
  Shield,
  RadioTower,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import type {
  DeviceType,
  OperatingSystem,
  Carrier,
  PolicyPriority,
  TowerStatus,
} from "@/lib/data/domain-types";

interface EnterpriseMetrics {
  devices: {
    total: number;
    active: number;
    nonCompliant: number;
    discovered: number;
    byType: Record<DeviceType, number>;
    byOS: Record<OperatingSystem, number>;
    byCarrier: Record<Carrier, number>;
  };
  policies: {
    total: number;
    active: number;
    byPriority: Record<PolicyPriority, number>;
    enforcementStats: {
      total: number;
      violations: number;
      autoRemediated: number;
    };
  };
  towers: {
    total: number;
    active: number;
    byCarrier: Record<Carrier, number>;
    byStatus: Record<TowerStatus, number>;
  };
  users: {
    total: number;
    admins: number;
    active: number;
  };
  security: {
    complianceScore: number;
    criticalAlerts: number;
    recentIncidents: Array<{
      id: string;
      type: string;
      severity: "low" | "medium" | "high" | "critical";
      description: string;
      timestamp: string;
      affectedEntities: Array<{
        type: "device" | "tower" | "policy" | "user";
        id: string;
      }>;
      status: "open" | "investigating" | "resolved";
      resolution?: {
        action: string;
        resolvedBy: string;
        resolvedAt: string;
      };
    }>;
  };
}

// Define columns for recent incidents
const incidentColumns: Column<
  EnterpriseMetrics["security"]["recentIncidents"][0]
>[] = [
  {
    key: "id",
    label: "Incident ID",
    sortable: true,
    searchable: true,
  },
  {
    key: "type",
    label: "Type",
    sortable: true,
    filterable: true,
    options: [
      { label: "Security", value: "security" },
      { label: "Compliance", value: "compliance" },
      { label: "Performance", value: "performance" },
    ],
    render: (value: string) => (
      <Badge
        variant={
          value === "security"
            ? "destructive"
            : value === "compliance"
            ? "secondary"
            : "default"
        }
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "severity",
    label: "Severity",
    sortable: true,
    filterable: true,
    options: [
      { label: "Critical", value: "critical" },
      { label: "High", value: "high" },
      { label: "Medium", value: "medium" },
      { label: "Low", value: "low" },
    ],
    render: (value: string) => (
      <Badge
        variant={
          value === "critical"
            ? "destructive"
            : value === "high"
            ? "secondary"
            : value === "medium"
            ? "default"
            : "outline"
        }
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "description",
    label: "Description",
    sortable: true,
    searchable: true,
  },
  {
    key: "timestamp",
    label: "Time",
    sortable: true,
    render: (value: string) => (
      <span className="text-sm">{new Date(value).toLocaleString()}</span>
    ),
  },
  {
    key: "affectedEntities",
    label: "Affected",
    sortable: false,
    render: (
      value: EnterpriseMetrics["security"]["recentIncidents"][0]["affectedEntities"]
    ) => (
      <div className="flex flex-wrap gap-1">
        {value.map((entity, i) => (
          <Badge key={i} variant="outline" className="w-fit">
            {entity.type}: {entity.id}
          </Badge>
        ))}
      </div>
    ),
  },
];

export default function EnterpriseDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<EnterpriseMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = use(params);

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
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [session, status, id, router]);

  if (status === "loading" || loading) {
    return <FullPageLoadingSpinner text="Loading dashboard..." />;
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="text-lg font-semibold">
                {error || "Failed to load dashboard data"}
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
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">
            <GradientText variant="multi">Dashboard</GradientText>
          </h1>
        </div>

        {/* Overview Cards */}
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
                {metrics.devices.total}
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">
                  {metrics.devices.active} active devices
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.devices.nonCompliant} non-compliant
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.devices.discovered} discovered
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="purple"
            intensity="medium"
            className="glassEffect-medium"
            icon={Shield}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="purple">Policies</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {metrics.policies.total}
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">
                  {metrics.policies.active} active policies
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.policies.enforcementStats.violations} violations
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.policies.enforcementStats.autoRemediated}{" "}
                  auto-remediated
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="green"
            intensity="medium"
            className="glassEffect-medium"
            icon={RadioTower}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="green">Towers</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {metrics.towers.total}
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">
                  {metrics.towers.active} active towers
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.towers.byStatus.maintenance} in maintenance
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.towers.byStatus.inactive} inactive
                </p>
              </div>
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
                <GradientText variant="orange">Security</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {metrics.security.complianceScore}%
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">
                  {metrics.security.criticalAlerts} critical alerts
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.users.total} total users
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.users.admins} admin users
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Device Compliance Chart */}
          <Card className="glassEffect-medium">
            <CardHeader>
              <CardTitle>Device Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Compliant",
                          value:
                            metrics.devices.total -
                            metrics.devices.nonCompliant,
                        },
                        {
                          name: "Non-Compliant",
                          value: metrics.devices.nonCompliant,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--destructive))" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Network Health Chart */}
          <Card className="glassEffect-medium">
            <CardHeader>
              <CardTitle>Network Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Active",
                        value: metrics.towers.active,
                      },
                      {
                        name: "Offline",
                        value: metrics.towers.total - metrics.towers.active,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Security Score Trend */}
          <Card className="glassEffect-medium">
            <CardHeader>
              <CardTitle>Security Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { time: "Jan", score: 85 },
                      { time: "Feb", score: 88 },
                      { time: "Mar", score: 92 },
                      { time: "Apr", score: 90 },
                      { time: "May", score: 95 },
                      { time: "Jun", score: metrics.security.complianceScore },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Policy Enforcement */}
          <Card className="glassEffect-medium">
            <CardHeader>
              <CardTitle>Policy Enforcement Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Active",
                        value: metrics.policies.active,
                      },
                      {
                        name: "Inactive",
                        value: metrics.policies.total - metrics.policies.active,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Incidents Table */}
        <DataTable
          columns={incidentColumns}
          data={metrics.security.recentIncidents}
          searchKey="description"
          title="Recent Security Incidents"
          description="Monitor and track recent security incidents across your enterprise"
        />
      </div>
    </PageTransition>
  );
}
