"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useEnterpriseData } from "@/lib/hooks/useEnterpriseData";
import { Policy } from "@/lib/data/domain-types";
import { GradientText } from "@/components/ui/gradient-text";

// Define columns for policies table
const policyColumns: Column<Policy>[] = [
  {
    key: "id",
    label: "Policy ID",
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
    key: "priority",
    label: "Priority",
    sortable: true,
    filterable: true,
    options: [
      { label: "Critical", value: "critical" },
      { label: "High", value: "high" },
      { label: "Medium", value: "medium" },
      { label: "Low", value: "low" },
    ],
    render: (value: Policy["priority"]) => (
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
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
    render: (value: Policy["status"]) => (
      <Badge variant={value === "active" ? "default" : "secondary"}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "enforcement",
    label: "Enforcement",
    sortable: true,
    filterable: true,
    options: [
      { label: "Allow", value: "allow" },
      { label: "Deny", value: "deny" },
      { label: "Notify", value: "notify" },
      { label: "Quarantine", value: "quarantine" },
    ],
    render: (value: Policy["enforcement"]) => (
      <Badge
        variant={
          value.action === "allow"
            ? "default"
            : value.action === "deny"
            ? "destructive"
            : value.action === "notify"
            ? "secondary"
            : "outline"
        }
      >
        {value.action.charAt(0).toUpperCase() + value.action.slice(1)}
      </Badge>
    ),
  },
  {
    key: "updatedAt",
    label: "Last Updated",
    sortable: true,
    render: (value: string) => (
      <span className="text-sm">{new Date(value).toLocaleString()}</span>
    ),
  },
];

export default function EnterprisePoliciesPage({
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
    data: policies,
    loading: policiesLoading,
    error: policiesError,
  } = useEnterpriseData<Policy>({
    type: "policies",
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
        setMetrics(data.policies);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [session, status, id, router]);

  if (status === "loading" || loading) {
    return <FullPageLoadingSpinner text="Loading policies..." />;
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="text-lg font-semibold">
                {error || "Failed to load policy data"}
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
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">
            <GradientText variant="multi">Security Policies</GradientText>
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card
            variant="purple"
            intensity="medium"
            className="glassEffect-medium"
            icon={Shield}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="purple">Total Policies</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {metrics.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.active} active policies
              </p>
            </CardContent>
          </Card>

          <Card
            variant="green"
            intensity="medium"
            className="glassEffect-medium"
            icon={CheckCircle}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="green">Active Policies</GradientText>
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
                <GradientText variant="orange">Inactive Policies</GradientText>
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
          columns={policyColumns}
          data={policies || []}
          searchKey="name"
          title="Policy Directory"
          description="Manage and monitor all security policies in your enterprise"
        />
      </div>
    </PageTransition>
  );
}
