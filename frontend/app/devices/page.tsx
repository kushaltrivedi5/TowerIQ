"use client";

import { useState } from "react";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  loadSeedData,
  Device,
  DashboardMetrics,
} from "../../lib/data/loadSeedData";
import { Smartphone, Shield, AlertTriangle, Lock } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";

// Load devices data and metrics
const devices = loadSeedData<"devices">("devices");
const metrics = loadSeedData<"dashboardMetrics">("dashboardMetrics");

// Define columns for the data table
const columns: Column<Device>[] = [
  {
    key: "id",
    label: "Device ID",
    sortable: true,
    searchable: true,
  },
  {
    key: "name",
    label: "Device Name",
    sortable: true,
    searchable: true,
  },
  {
    key: "type",
    label: "Type",
    sortable: true,
    filterable: true,
    options: [
      { label: "Smartphone", value: "smartphone" },
      { label: "Tablet", value: "tablet" },
      { label: "IoT", value: "iot" },
      { label: "Other", value: "other" },
    ],
    render: (value: Device["type"]) => (
      <Badge variant="outline" className="w-fit">
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "os",
    label: "Operating System",
    sortable: true,
    filterable: true,
    options: [
      { label: "iOS", value: "ios" },
      { label: "Android", value: "android" },
      { label: "Windows", value: "windows" },
      { label: "Linux", value: "linux" },
    ],
    render: (value: Device["os"]) => (
      <Badge variant="outline" className="w-fit">
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "carrier",
    label: "Carrier",
    sortable: true,
    filterable: true,
    options: [
      { label: "AT&T", value: "ATT" },
      { label: "T-Mobile", value: "TMO" },
      { label: "Verizon", value: "VZW" },
    ],
    render: (value: Device["carrier"]) => (
      <Badge variant="outline" className="w-fit">
        {value}
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
      { label: "Quarantined", value: "quarantined" },
    ],
    render: (value: Device["status"]) => (
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
    key: "lastSeen",
    label: "Last Seen",
    sortable: true,
    render: (value: string) => (
      <span className="text-sm">{new Date(value).toLocaleString()}</span>
    ),
  },
  {
    key: "securityStatus",
    label: "Security",
    sortable: true,
    filterable: true,
    options: [
      { label: "Compliant", value: "compliant" },
      { label: "Non-compliant", value: "non-compliant" },
      { label: "At Risk", value: "at-risk" },
    ],
    render: (value: Device["securityStatus"]) => (
      <Badge
        variant={
          value.isCompliant
            ? "default"
            : value.vulnerabilities > 0
            ? "destructive"
            : "secondary"
        }
      >
        {value.isCompliant
          ? "Compliant"
          : value.vulnerabilities > 0
          ? "Non-compliant"
          : "At Risk"}
      </Badge>
    ),
  },
];

export default function DevicesPage() {
  // Get device metrics from dashboard metrics
  const { total, active, byOS, byCarrier, nonCompliant } = metrics.devices;

  return (
    <PageTransition>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            <GradientText variant="multi">Device Management</GradientText>
          </h1>
          <Badge variant="outline" className="text-sm px-4 py-1">
            {total.toLocaleString()} Devices
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
                <GradientText variant="blue">Total Devices</GradientText>
              </CardTitle>
              <Smartphone className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {total.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Network devices
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
                <GradientText variant="green">Active Devices</GradientText>
              </CardTitle>
              <Shield className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {active.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Currently online
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
                <GradientText variant="orange">Non-compliant</GradientText>
              </CardTitle>
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {nonCompliant.toLocaleString()}
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
                {devices
                  .filter((d: Device) => d.status === "quarantined")
                  .length.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Isolated devices
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          columns={columns}
          data={devices}
          pageSize={20}
          title="Device Directory"
          description="Manage and monitor all devices in your network"
        />
      </div>
    </PageTransition>
  );
}
