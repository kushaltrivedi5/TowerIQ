"use client";

import { useState } from "react";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
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
} from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";

// Load all data
const metrics = loadSeedData<"dashboardMetrics">("dashboardMetrics");
const devices = loadSeedData<"devices">("devices");
const towers = loadSeedData<"towers">("towers");
const enterprises = loadSeedData<"enterprises">("enterprises");
const policies = loadSeedData<"policies">("policies");

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
  const {
    enterprises: enterpriseMetrics,
    devices: deviceMetrics,
    towers: towerMetrics,
    policies: policyMetrics,
    security: securityMetrics,
  } = metrics;

  return (
    <PageTransition>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            <GradientText variant="multi">
              Mission Control Dashboard
            </GradientText>
          </h1>
          <Badge variant="outline" className="text-sm px-4 py-1">
            {enterpriseMetrics.total} Enterprises
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
                <GradientText variant="blue">Enterprises</GradientText>
              </CardTitle>
              <Building2 className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {enterpriseMetrics.total.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {enterpriseMetrics.active} Active
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
                <GradientText variant="green">Devices</GradientText>
              </CardTitle>
              <Smartphone className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {deviceMetrics.total.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {deviceMetrics.active} Active, {deviceMetrics.nonCompliant}{" "}
                Non-compliant
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
                <GradientText variant="orange">Towers</GradientText>
              </CardTitle>
              <Wifi className="h-6 w-6 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {towerMetrics.total.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {towerMetrics.active} Active
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
                <GradientText variant="purple">Security Score</GradientText>
              </CardTitle>
              <Shield className="h-6 w-6 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {securityMetrics.complianceScore}%
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {securityMetrics.criticalAlerts} Critical Alerts
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass dark:glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
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

          <Card className="glass dark:glass-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
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
