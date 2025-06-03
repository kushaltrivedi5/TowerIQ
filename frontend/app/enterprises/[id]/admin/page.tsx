"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Shield,
  RadioTower,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
} from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";
import PageTransition from "@/components/PageTransition";
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner";

interface AdminOverviewProps {
  params: Promise<{ id: string }>;
}

interface AdminMetrics {
  devices: {
    total: number;
    active: number;
    byType: Record<string, number>;
  };
  policies: {
    total: number;
    active: number;
    byStatus: Record<string, number>;
  };
  towers: {
    total: number;
    active: number;
    connectivity: number;
  };
  users: {
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    byDepartment: Record<string, number>;
    activeDevices: number;
  };
  security: {
    score: number;
    activeAlerts: number;
    systemsStatus: string;
    policyEnforcement: string;
    lastCheck: string;
  };
}

export default function AdminOverview({ params }: AdminOverviewProps) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetrics>({
    devices: {
      total: 0,
      active: 0,
      byType: {},
    },
    policies: {
      total: 0,
      active: 0,
      byStatus: {},
    },
    towers: {
      total: 0,
      active: 0,
      connectivity: 0,
    },
    users: {
      total: 0,
      byRole: {},
      byStatus: {},
      byDepartment: {},
      activeDevices: 0,
    },
    security: {
      score: 0,
      activeAlerts: 0,
      systemsStatus: "Loading...",
      policyEnforcement: "Loading...",
      lastCheck: "Loading...",
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/enterprises/${id}/metrics`);
        if (!response.ok) {
          throw new Error("Failed to load admin metrics");
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (status === "loading" || loading) {
    return <FullPageLoadingSpinner text="Loading admin overview..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="text-lg font-semibold">{error}</p>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              <GradientText variant="multi">Admin Overview</GradientText>
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              Security Report
            </Button>
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
                {metrics.towers.total}
              </div>
            </CardContent>
          </Card>

          <Card
            variant="green"
            intensity="medium"
            className="glassEffect-medium"
            icon={Shield}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="green">Security Score</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {metrics.security.score}%
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
                <GradientText variant="orange">Active Alerts</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {metrics.security.activeAlerts}
              </div>
            </CardContent>
          </Card>

          <Card
            variant="purple"
            intensity="medium"
            className="glassEffect-medium"
            icon={Wrench}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="purple">Active Devices</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {metrics.devices.active}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="glassEffect-medium">
          <CardHeader>
            <CardTitle>
              <GradientText variant="multi">System Status</GradientText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tower Connectivity</span>
                <span className="text-sm font-medium text-green-500">
                  {metrics.towers.connectivity}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Security Systems</span>
                <span className="text-sm font-medium text-green-500">
                  {metrics.security.systemsStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Policy Enforcement</span>
                <span className="text-sm font-medium text-green-500">
                  {metrics.security.policyEnforcement}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last System Check</span>
                <span className="text-sm font-medium">
                  {metrics.security.lastCheck}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glassEffect-medium">
          <CardHeader>
            <CardTitle>
              <GradientText variant="multi">Quick Actions</GradientText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
              >
                <RadioTower className="h-5 w-5" />
                <span>Add Tower</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
              >
                <Shield className="h-5 w-5" />
                <span>Security Scan</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
              >
                <Wrench className="h-5 w-5" />
                <span>Maintenance</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
              >
                <AlertTriangle className="h-5 w-5" />
                <span>View Alerts</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
