"use client";

import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  loadSeedData,
  Enterprise,
  DashboardMetrics,
} from "../../lib/data/loadSeedData";
import { Building2, Users, Shield, Star } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner";
import { IntegrationType } from "@/lib/data/domain-types";

// Define columns for the data table
const columns: Column<Enterprise>[] = [
  {
    key: "id",
    label: "Enterprise ID",
    sortable: true,
    searchable: true,
  },
  {
    key: "name",
    label: "Enterprise Name",
    sortable: true,
    searchable: true,
  },
  {
    key: "subscription",
    label: "Subscription",
    sortable: true,
    filterable: true,
    options: [
      { label: "Basic", value: "basic" },
      { label: "Standard", value: "standard" },
      { label: "Premium", value: "premium" },
      { label: "Enterprise", value: "enterprise" },
    ],
    render: (value: Enterprise["subscription"]) => (
      <Badge
        variant={
          value.tier === "enterprise"
            ? "default"
            : value.tier === "premium"
            ? "secondary"
            : "outline"
        }
      >
        {value.tier.charAt(0).toUpperCase() + value.tier.slice(1)}
      </Badge>
    ),
  },
  {
    key: "users",
    label: "Users",
    sortable: true,
    render: (value: Enterprise["users"]) => (
      <span className="text-sm">{value.length.toLocaleString()}</span>
    ),
  },
  {
    key: "policies",
    label: "Policies",
    sortable: true,
    render: (value: Enterprise["policies"]) => (
      <span className="text-sm">{value.length.toLocaleString()}</span>
    ),
  },
  {
    key: "integrations",
    label: "Integrations",
    sortable: true,
    render: (value: Enterprise["integrations"]) => (
      <div className="flex flex-wrap gap-1">
        {value.map(
          (
            integration: {
              type: IntegrationType;
              status: "active" | "inactive" | "pending";
            },
            i: number
          ) => (
            <Badge
              key={i}
              variant={
                integration.status === "active" ? "default" : "secondary"
              }
              className="w-fit"
            >
              {integration.type
                .split("_")
                .map(
                  (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" ")}
            </Badge>
          )
        )}
      </div>
    ),
  },
  {
    key: "subscription",
    label: "Status",
    sortable: true,
    filterable: true,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
    render: (value: Enterprise["subscription"]) => (
      <Badge variant={value.status === "active" ? "default" : "secondary"}>
        {value.status.charAt(0).toUpperCase() + value.status.slice(1)}
      </Badge>
    ),
  },
];

export default function EnterprisesPage() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [enterprisesData, metricsData] = await Promise.all([
          loadSeedData("enterprises"),
          loadSeedData("dashboardMetrics"),
        ]);
        setEnterprises(enterprisesData);
        setMetrics(metricsData);
        setError(null);
      } catch (error) {
        console.error("Error loading enterprise data:", error);
        setError("Failed to load enterprise data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <FullPageLoadingSpinner text="Loading enterprise data..." />;
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

  const { total, active, bySubscription } = metrics?.enterprises ?? {
    total: 0,
    active: 0,
    bySubscription: {
      basic: 0,
      standard: 0,
      premium: 0,
      enterprise: 0,
    },
  };

  const premiumCount = bySubscription.premium + bySubscription.enterprise;
  const totalUsers = enterprises.reduce(
    (sum, enterprise) => sum + enterprise.users.length,
    0
  );

  return (
    <PageTransition>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            <GradientText variant="multi">Enterprise Management</GradientText>
          </h1>
          <Badge variant="outline" className="text-sm px-4 py-1">
            {total.toLocaleString()} Enterprises
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card
            variant="blue"
            intensity="medium"
            className="glass dark:glass-dark"
            icon={Building2}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="blue">Total Enterprises</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {total.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {active} Active
              </div>
            </CardContent>
          </Card>

          <Card
            variant="green"
            intensity="medium"
            className="glass dark:glass-dark"
            icon={Star}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="green">Premium Tier</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {premiumCount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Premium & Enterprise
              </div>
            </CardContent>
          </Card>

          <Card
            variant="orange"
            intensity="medium"
            className="glass dark:glass-dark"
            icon={Users}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="orange">Total Users</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {totalUsers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Across all enterprises
              </div>
            </CardContent>
          </Card>

          <Card
            variant="purple"
            intensity="medium"
            className="glass dark:glass-dark"
            icon={Shield}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="purple">
                  Active Subscriptions
                </GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {active.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Currently active
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          columns={columns}
          data={enterprises}
          pageSize={20}
          title="Enterprise Directory"
          description="Manage and monitor all enterprises in your network"
        />
      </div>
    </PageTransition>
  );
}
