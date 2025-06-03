"use client";

import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  loadSeedData,
  Policy,
  DashboardMetrics,
} from "../../lib/data/loadSeedData";
import { Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner";

// Define columns for the data table
const columns: Column<Policy>[] = [
  {
    key: "id",
    label: "Policy ID",
    sortable: true,
    searchable: true,
  },
  {
    key: "name",
    label: "Policy Name",
    sortable: true,
    searchable: true,
  },
  {
    key: "priority",
    label: "Priority",
    sortable: true,
    filterable: true,
    options: [
      { label: "High", value: "high" },
      { label: "Medium", value: "medium" },
      { label: "Low", value: "low" },
    ],
    render: (value: Policy["priority"]) => (
      <Badge
        variant={
          value === "high"
            ? "destructive"
            : value === "medium"
            ? "secondary"
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
      { label: "Draft", value: "draft" },
    ],
    render: (value: Policy["status"]) => (
      <Badge
        variant={
          value === "active"
            ? "default"
            : value === "inactive"
            ? "secondary"
            : "outline"
        }
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "conditions",
    label: "Conditions",
    sortable: true,
    render: (value: Policy["conditions"]) => (
      <div className="flex flex-wrap gap-1">
        {value.carriers?.map((carrier, i) => (
          <Badge key={`carrier-${i}`} variant="outline" className="w-fit">
            {carrier}
          </Badge>
        ))}
        {value.os?.map((os, i) => (
          <Badge key={`os-${i}`} variant="outline" className="w-fit">
            {os}
          </Badge>
        ))}
        {value.deviceTypes?.map((type, i) => (
          <Badge key={`type-${i}`} variant="outline" className="w-fit">
            {type}
          </Badge>
        ))}
        {value.timeRestrictions && (
          <Badge variant="outline" className="w-fit">
            {value.timeRestrictions.start}-{value.timeRestrictions.end}
          </Badge>
        )}
      </div>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    sortable: true,
    render: (value: Policy["actions"]) => (
      <div className="flex flex-wrap gap-1">
        {value.map((action, i) => (
          <Badge
            key={i}
            variant={
              action.type === "allow"
                ? "default"
                : action.type === "deny"
                ? "destructive"
                : action.type === "notify"
                ? "secondary"
                : "outline"
            }
            className="w-fit"
          >
            {action.type.charAt(0).toUpperCase() + action.type.slice(1)}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: "lastEnforced",
    label: "Last Enforced",
    sortable: true,
    render: (value: Policy["lastEnforced"]) => (
      <span className="text-sm">{new Date(value).toLocaleString()}</span>
    ),
  },
];

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [policiesData, metricsData] = await Promise.all([
          loadSeedData("policies"),
          loadSeedData("dashboardMetrics"),
        ]);
        setPolicies(policiesData);
        setMetrics(metricsData);
        setError(null);
      } catch (error) {
        console.error("Error loading policy data:", error);
        setError("Failed to load policy data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <FullPageLoadingSpinner text="Loading policy data..." />;
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

  const { total, active, enforcementStats } = metrics?.policies ?? {
    total: 0,
    active: 0,
    enforcementStats: {
      allowed: 0,
      denied: 0,
      notified: 0,
      quarantined: 0,
    },
  };

  const cards = [
    {
      title: "Total Policies",
      value: total.toLocaleString(),
      description: "Total policies",
      icon: Shield,
    },
    {
      title: "Allowed Actions",
      value: enforcementStats.allowed.toLocaleString(),
      description: "Successful enforcements",
      icon: CheckCircle,
    },
    {
      title: "Denied Actions",
      value: enforcementStats.denied.toLocaleString(),
      description: "Blocked violations",
      icon: XCircle,
    },
    {
      title: "Quarantined Devices",
      value: enforcementStats.quarantined.toLocaleString(),
      description: "Isolated devices",
      icon: AlertTriangle,
    },
  ];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Policies</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr mb-8">
          {cards.map((card) => (
            <Card
              key={card.title}
              variant={
                card.title === "Total Policies"
                  ? "blue"
                  : card.title === "Allowed Actions"
                  ? "green"
                  : card.title === "Denied Actions"
                  ? "orange"
                  : "purple"
              }
              intensity="medium"
              className="glass dark:glass-dark h-full"
              icon={card.icon}
            >
              <CardHeader>
                <CardTitle>
                  <GradientText
                    variant={
                      card.title === "Total Policies"
                        ? "blue"
                        : card.title === "Allowed Actions"
                        ? "green"
                        : card.title === "Denied Actions"
                        ? "orange"
                        : "purple"
                    }
                  >
                    {card.title}
                  </GradientText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${
                    card.title === "Total Policies"
                      ? "text-gradient"
                      : card.title === "Allowed Actions"
                      ? "text-green-500"
                      : card.title === "Denied Actions"
                      ? "text-orange-500"
                      : "text-purple-500"
                  }`}
                >
                  {card.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {card.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={policies}
          pageSize={20}
          title="Policy Directory"
          description="Manage and monitor all policies in your network"
          className="col-span-full"
        />
      </div>
    </PageTransition>
  );
}
