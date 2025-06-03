"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { GradientText } from "@/components/ui/gradient-text";
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
  Bell,
  Ban,
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PolicyAction } from "@/lib/data/domain-types";
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner";

interface RemediationAction {
  id: string;
  title: string;
  status: "active" | "investigating" | "resolved";
  priority: "low" | "medium" | "high" | "critical";
  progress: number;
  dueDate: string;
  type: string;
  affectedEntities: Array<{ id: string; type: string } | string>;
  action: PolicyAction;
}

interface RemediationMetrics {
  totalActions: number;
  completedActions: number;
  inProgressActions: number;
  criticalActions: number;
}

interface RemediationActionEvent extends CustomEvent {
  detail: {
    actionId: string;
    newStatus: RemediationAction["status"];
  };
}

// Define columns for remediation table
const remediationColumns: Column<RemediationAction>[] = [
  {
    key: "id",
    label: "Action ID",
    sortable: true,
    searchable: true,
  },
  {
    key: "title",
    label: "Title",
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
      { label: "Investigating", value: "investigating" },
      { label: "Resolved", value: "resolved" },
    ],
    render: (value: RemediationAction["status"]) => {
      const statusConfig = {
        active: "bg-blue-500",
        investigating: "bg-yellow-500",
        resolved: "bg-green-500",
      };
      return (
        <Badge
          variant="outline"
          className={`${statusConfig[value] || "bg-gray-500"} text-white`}
        >
          {value}
        </Badge>
      );
    },
  },
  {
    key: "priority",
    label: "Priority",
    sortable: true,
    filterable: true,
    options: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
      { label: "Critical", value: "critical" },
    ],
    render: (value: RemediationAction["priority"]) => {
      const priorityConfig = {
        low: "bg-green-500",
        medium: "bg-blue-500",
        high: "bg-yellow-500",
        critical: "bg-red-500",
      };
      return (
        <Badge
          variant="outline"
          className={`${priorityConfig[value] || "bg-gray-500"} text-white`}
        >
          {value}
        </Badge>
      );
    },
  },
  {
    key: "action",
    label: "Action",
    sortable: true,
    filterable: true,
    options: [
      { label: "Allow", value: "allow" },
      { label: "Deny", value: "deny" },
      { label: "Notify", value: "notify" },
      { label: "Quarantine", value: "quarantine" },
    ],
    render: (value: RemediationAction["action"]) => {
      const actionConfig = {
        allow: "bg-green-500",
        deny: "bg-red-500",
        notify: "bg-blue-500",
        quarantine: "bg-yellow-500",
      };
      return (
        <Badge
          variant="outline"
          className={`${actionConfig[value] || "bg-gray-500"} text-white`}
        >
          {value}
        </Badge>
      );
    },
  },
  {
    key: "progress",
    label: "Progress",
    sortable: true,
    render: (value: RemediationAction["progress"]) => (
      <div className="flex items-center gap-2">
        <Progress value={value} className="w-[100px]" />
        <span className="text-sm text-muted-foreground">{value}%</span>
      </div>
    ),
  },
  {
    key: "dueDate",
    label: "Due Date",
    sortable: true,
    render: (value: RemediationAction["dueDate"]) => (
      <div className="flex items-center gap-2">
        <Clock
          className={`h-4 w-4 ${
            new Date(value) < new Date() ? "text-red-500" : "text-yellow-500"
          }`}
        />
        <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
      </div>
    ),
  },
  {
    key: "type",
    label: "Type",
    sortable: true,
    filterable: true,
  },
  {
    key: "affectedEntities",
    label: "Affected Entities",
    render: (value: RemediationAction["affectedEntities"]) => (
      <div className="flex flex-wrap gap-1">
        {value.map((entity, index) => (
          <Badge key={index} variant="secondary">
            {typeof entity === "string" ? entity : entity.id}
          </Badge>
        ))}
      </div>
    ),
  },
];

export default function RemediationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [actions, setActions] = useState<RemediationAction[]>([]);
  const [metrics, setMetrics] = useState<RemediationMetrics>({
    totalActions: 0,
    completedActions: 0,
    inProgressActions: 0,
    criticalActions: 0,
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

        // Fetch remediation actions
        const actionsResponse = await fetch(
          `/api/enterprises/${id}/data?type=remediation`
        );
        if (!actionsResponse.ok) {
          throw new Error("Failed to fetch remediation actions");
        }
        const actionsData = await actionsResponse.json();

        // Calculate metrics from the actions data
        const totalActions = actionsData.data.length;
        const completedActions = actionsData.data.filter(
          (action: RemediationAction) => action.status === "resolved"
        ).length;
        const inProgressActions = actionsData.data.filter(
          (action: RemediationAction) => action.status === "investigating"
        ).length;
        const criticalActions = actionsData.data.filter(
          (action: RemediationAction) => action.priority === "critical"
        ).length;

        setActions(actionsData.data);
        setMetrics({
          totalActions,
          completedActions,
          inProgressActions,
          criticalActions,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const handleRemediationAction = async (event: Event) => {
      const customEvent = event as RemediationActionEvent;
      const { actionId, newStatus } = customEvent.detail;
      try {
        // Update the action status
        const response = await fetch(
          `/api/enterprises/${id}/remediation/${actionId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update action status");
        }

        // Update local state
        setActions((prevActions) =>
          prevActions.map((action) =>
            action.id === actionId
              ? {
                  ...action,
                  status: newStatus,
                  progress:
                    newStatus === "resolved"
                      ? 100
                      : newStatus === "investigating"
                      ? 50
                      : action.progress,
                }
              : action
          )
        );

        // Recalculate metrics
        const updatedActions = actions.map((action) =>
          action.id === actionId
            ? {
                ...action,
                status: newStatus,
                progress:
                  newStatus === "resolved"
                    ? 100
                    : newStatus === "investigating"
                    ? 50
                    : action.progress,
              }
            : action
        );

        const totalActions = updatedActions.length;
        const completedActions = updatedActions.filter(
          (action) => action.status === "resolved"
        ).length;
        const inProgressActions = updatedActions.filter(
          (action) => action.status === "investigating"
        ).length;
        const criticalActions = updatedActions.filter(
          (action) => action.priority === "critical"
        ).length;

        setMetrics({
          totalActions,
          completedActions,
          inProgressActions,
          criticalActions,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update action status"
        );
      }
    };

    window.addEventListener("remediation-action", handleRemediationAction);
    return () => {
      window.removeEventListener("remediation-action", handleRemediationAction);
    };
  }, [id, actions]);

  if (status === "loading" || loading) {
    return <FullPageLoadingSpinner text="Loading remediation data..." />;
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
            <Wrench className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              <GradientText variant="multi">Remediation Actions</GradientText>
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Wrench className="h-4 w-4" />
              New Action
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card
            variant="purple"
            intensity="medium"
            className="glassEffect-medium"
            icon={Wrench}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="purple">Total Actions</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {metrics.totalActions}
              </div>
            </CardContent>
          </Card>

          <Card
            variant="green"
            intensity="medium"
            className="glassEffect-medium"
            icon={CheckCircle2}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="green">Completed</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {metrics.completedActions}
              </div>
            </CardContent>
          </Card>

          <Card
            variant="blue"
            intensity="medium"
            className="glassEffect-medium"
            icon={Clock}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="blue">In Progress</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {metrics.inProgressActions}
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
                <GradientText variant="orange">Critical</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {metrics.criticalActions}
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          columns={remediationColumns}
          data={actions}
          searchKey="title"
          title="Remediation Actions"
          description="Track and manage all remediation actions in your enterprise"
        />
      </div>
    </PageTransition>
  );
}
