"use client";

import { useState } from "react";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  loadSeedData,
  Policy,
  DashboardMetrics,
} from "@/lib/data/loadSeedData";
import { Shield, Lock, AlertTriangle, CheckCircle } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";

// Load policies data and metrics
const policies = loadSeedData<"policies">("policies");
const metrics = loadSeedData<"dashboardMetrics">("dashboardMetrics");

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
            : "default"
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
    sortable: false,
    render: (value: Policy["conditions"]) => (
      <div className="flex flex-col gap-1">
        {value.carriers && (
          <div className="flex flex-wrap gap-1">
            {value.carriers.map((carrier, i) => (
              <Badge key={i} variant="outline" className="w-fit">
                {carrier}
              </Badge>
            ))}
          </div>
        )}
        {value.os && (
          <div className="flex flex-wrap gap-1">
            {value.os.map((os, i) => (
              <Badge key={i} variant="outline" className="w-fit">
                {os}
              </Badge>
            ))}
          </div>
        )}
        {value.deviceTypes && (
          <div className="flex flex-wrap gap-1">
            {value.deviceTypes.map((type, i) => (
              <Badge key={i} variant="outline" className="w-fit">
                {type}
              </Badge>
            ))}
          </div>
        )}
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
    sortable: false,
    render: (value: Policy["actions"]) => (
      <div className="flex flex-col gap-1">
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
    render: (value: string) => (
      <span className="text-sm">{new Date(value).toLocaleString()}</span>
    ),
  },
];

export default function PoliciesPage() {
  // Get policy metrics from dashboard metrics
  const { total, active, byPriority, enforcementStats } = metrics.policies;

  return (
    <PageTransition>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            <GradientText variant="multi">Policy Management</GradientText>
          </h1>
          <Badge variant="outline" className="text-sm px-4 py-1">
            {total.toLocaleString()} Policies
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card
            variant="blue"
            intensity="medium"
            className="glass dark:glass-dark"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                <GradientText variant="blue">Active Policies</GradientText>
              </CardTitle>
              <Shield className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {active.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Currently enforced
              </div>
            </CardContent>
          </Card>

          <Card
            variant="green"
            intensity="medium"
            className="glass dark:glass-dark"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                <GradientText variant="green">Allowed Actions</GradientText>
              </CardTitle>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {enforcementStats.allowed.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Policy-compliant actions
              </div>
            </CardContent>
          </Card>

          <Card
            variant="orange"
            intensity="medium"
            className="glass dark:glass-dark"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                <GradientText variant="orange">Denied Actions</GradientText>
              </CardTitle>
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {enforcementStats.denied.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Policy violations
              </div>
            </CardContent>
          </Card>

          <Card
            variant="purple"
            intensity="medium"
            className="glass dark:glass-dark"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                <GradientText variant="purple">Quarantined</GradientText>
              </CardTitle>
              <Lock className="h-6 w-6 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {enforcementStats.quarantined.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Devices under quarantine
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          columns={columns}
          data={policies}
          pageSize={20}
          title="Policy Directory"
          description="Manage and monitor all policies in your network"
        />
      </div>
    </PageTransition>
  );
}
