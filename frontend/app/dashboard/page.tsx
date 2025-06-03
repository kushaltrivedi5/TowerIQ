"use client";

import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner";
import {
  loadSeedData,
  Device,
  Tower,
  Enterprise,
  Policy,
  DashboardMetrics,
} from "@/lib/data/loadSeedData";
import {
  Building2,
  Smartphone,
  Wifi,
  Shield,
  AlertTriangle,
  Users,
  LayoutDashboard,
  RadioTower,
} from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";

// Define columns for recent incidents
const incidentColumns: Column<
  DashboardMetrics["security"]["recentIncidents"][0]
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
      value: DashboardMetrics["security"]["recentIncidents"][0]["affectedEntities"]
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

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          metricsData,
          devicesData,
          towersData,
          enterprisesData,
          policiesData,
        ] = await Promise.all([
          loadSeedData("dashboardMetrics"),
          loadSeedData("devices"),
          loadSeedData("towers"),
          loadSeedData("enterprises"),
          loadSeedData("policies"),
        ]);

        setMetrics(metricsData as DashboardMetrics);
        setDevices(devicesData as Device[]);
        setTowers(towersData as Tower[]);
        setEnterprises(enterprisesData as Enterprise[]);
        setPolicies(policiesData as Policy[]);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <FullPageLoadingSpinner text="Loading dashboard data..." />;
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

  const {
    enterprises: enterpriseMetrics,
    devices: deviceMetrics,
    towers: towerMetrics,
    policies: policyMetrics,
    security: securityMetrics,
  } = metrics;

  // Calculate counts from the actual data arrays
  const enterpriseCount = enterprises.length;
  const deviceCount = devices.length;
  const towerCount = towers.length;
  const securityScore = metrics.security?.complianceScore ?? 0;

  return (
    <PageTransition>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
          <Card
            variant="blue"
            intensity="medium"
            className="glass dark:glass-dark h-full"
            icon={Building2}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="blue">Enterprises</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {enterpriseCount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {enterpriseMetrics.active} Active
              </div>
            </CardContent>
          </Card>

          <Card
            variant="green"
            intensity="medium"
            className="glass dark:glass-dark h-full"
            icon={Smartphone}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="green">Devices</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {deviceCount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {deviceMetrics.active} Active, {deviceMetrics.nonCompliant}{" "}
                Non-compliant
              </div>
            </CardContent>
          </Card>

          <Card
            variant="orange"
            intensity="medium"
            className="glass dark:glass-dark h-full"
            icon={RadioTower}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="orange">Towers</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {towerCount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {towerMetrics.active} Active
              </div>
            </CardContent>
          </Card>

          <Card
            variant="purple"
            intensity="medium"
            className="glass dark:glass-dark h-full"
            icon={Shield}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="purple">Security Score</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {securityScore}%
              </div>
              <div className="text-xs text-muted-foreground">
                {securityMetrics.criticalAlerts} Critical Alerts
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
          <Card className="glass dark:glass-dark h-full" icon={Users}>
            <CardHeader>
              <CardTitle>
                <GradientText variant="blue">
                  Enterprise Distribution
                </GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(enterpriseMetrics.bySubscription).map(
                  ([tier, count]) => (
                    <div key={tier} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {tier}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {count.toLocaleString()} enterprises
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${
                              (count / enterpriseMetrics.total) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass dark:glass-dark h-full" icon={AlertTriangle}>
            <CardHeader>
              <CardTitle>
                <GradientText variant="orange">Recent Incidents</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={incidentColumns}
                data={securityMetrics.recentIncidents}
                pageSize={5}
                title=""
                description=""
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
