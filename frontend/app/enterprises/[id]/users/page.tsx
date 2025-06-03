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
  Users,
  Shield,
  UserPlus,
  UserCheck,
  UserX,
  Settings,
} from "lucide-react";
import type { Enterprise, UserRole } from "@/lib/data/domain-types";
import { GradientText } from "@/components/ui/gradient-text";

// Define the enterprise user type based on the Enterprise interface
type EnterpriseUser = Enterprise["users"][number] & {
  enterpriseId: string;
  enterpriseName: string;
};

// Define columns for users table
const userColumns: Column<EnterpriseUser>[] = [
  {
    key: "id",
    label: "User ID",
    sortable: true,
    searchable: true,
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    searchable: true,
  },
  {
    key: "role",
    label: "Role",
    sortable: true,
    filterable: true,
    options: [
      { label: "Admin", value: "admin" },
      { label: "Manager", value: "manager" },
      { label: "Employee", value: "employee" },
      { label: "Contractor", value: "contractor" },
      { label: "Guest", value: "guest" },
    ],
    render: (value: UserRole) => (
      <Badge
        variant={
          value === "admin"
            ? "default"
            : value === "manager"
            ? "secondary"
            : "outline"
        }
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "department",
    label: "Department",
    sortable: true,
    searchable: true,
  },
  {
    key: "devices",
    label: "Devices",
    sortable: true,
    render: (value: EnterpriseUser["devices"]) => (
      <Badge variant="outline">{value.length}</Badge>
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
      { label: "Suspended", value: "suspended" },
    ],
    render: (value: EnterpriseUser["status"]) => (
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
    key: "lastLogin",
    label: "Last Login",
    sortable: true,
    render: (value: EnterpriseUser["lastLogin"]) => (
      <span className="text-sm">
        {value ? new Date(value).toLocaleString() : "Never"}
      </span>
    ),
  },
];

export default function EnterpriseUsersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<{
    total: number;
    byRole: Record<UserRole, number>;
    byStatus: Record<EnterpriseUser["status"], number>;
    byDepartment: Record<string, number>;
    activeDevices: number;
  } | null>(null);
  const [users, setUsers] = useState<EnterpriseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = use(params);

  useEffect(() => {
    async function loadData() {
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
        // Load enterprise data to get users
        const enterpriseResponse = await fetch(`/api/enterprises/${id}`);
        if (!enterpriseResponse.ok) {
          throw new Error("Failed to load enterprise data");
        }
        const enterprise = (await enterpriseResponse.json()) as Enterprise;

        // Transform enterprise users to include enterprise info
        const enterpriseUsers: EnterpriseUser[] = enterprise.users.map(
          (user) => ({
            ...user,
            enterpriseId: enterprise.id,
            enterpriseName: enterprise.name,
          })
        );

        setUsers(enterpriseUsers);

        // Load metrics
        const metricsResponse = await fetch(`/api/enterprises/${id}/metrics`);
        if (!metricsResponse.ok) {
          throw new Error("Failed to load metrics");
        }
        const data = await metricsResponse.json();
        setMetrics(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session, status, id, router]);

  if (status === "loading" || loading) {
    return <FullPageLoadingSpinner text="Loading users..." />;
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="text-lg font-semibold">
                {error || "Failed to load user data"}
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
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">
            <GradientText variant="multi">User Management</GradientText>
          </h1>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card
            variant="blue"
            intensity="medium"
            className="glassEffect-medium"
            icon={Users}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="blue">Total Users</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {metrics.total}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all departments
              </p>
            </CardContent>
          </Card>

          <Card
            variant="purple"
            intensity="medium"
            className="glassEffect-medium"
            icon={UserPlus}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="purple">New Users</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {metrics.byStatus?.active ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Added this month</p>
            </CardContent>
          </Card>

          <Card
            variant="green"
            intensity="medium"
            className="glassEffect-medium"
            icon={UserCheck}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="green">Active Users</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {metrics.byStatus?.active ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.total
                  ? (
                      ((metrics.byStatus?.active ?? 0) / metrics.total) *
                      100
                    ).toFixed(1)
                  : 0}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card
            variant="orange"
            intensity="medium"
            className="glassEffect-medium"
            icon={Settings}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="orange">Active Devices</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {metrics.activeDevices}
              </div>
              <p className="text-xs text-muted-foreground">Across all users</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card className="glassEffect-light">
            <CardHeader>
              <CardTitle className="text-sm font-medium">User Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(metrics.byRole ?? {}).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{role}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glassEffect-light">
            <CardHeader>
              <CardTitle className="text-sm font-medium">User Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(metrics.byStatus ?? {}).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm capitalize">{status}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glassEffect-light">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Top Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(metrics.byDepartment ?? {})
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([department, count]) => (
                    <div
                      key={department}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{department}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          columns={userColumns}
          data={users}
          searchKey="email"
          title="User Directory"
          description="Manage and monitor all users in your enterprise"
        />
      </div>
    </PageTransition>
  );
}
