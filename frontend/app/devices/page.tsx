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
  DashboardMetrics,
} from "../../lib/data/loadSeedData";
import { Smartphone, Shield, AlertTriangle, Lock } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";

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
  const [devices, setDevices] = useState<Device[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [devicesData, metricsData] = await Promise.all([
          loadSeedData("devices"),
          loadSeedData("dashboardMetrics"),
        ]);
        setDevices(devicesData);
        setMetrics(metricsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading || !metrics) {
    return <FullPageLoadingSpinner text="Loading device data..." />;
  }

  const { total, active, nonCompliant } = metrics.devices;

  return (
    <PageTransition>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Smartphone className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Devices</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr mb-8">
          {[
            {
              title: "Total Devices",
              value: total.toLocaleString(),
              description: "Network devices",
              icon: Smartphone,
              variant: "blue",
            },
            {
              title: "Active Devices",
              value: active.toLocaleString(),
              description: "Currently online",
              icon: Shield,
              variant: "green",
            },
            {
              title: "Non-compliant",
              value: nonCompliant.toLocaleString(),
              description: "Policy violations",
              icon: AlertTriangle,
              variant: "orange",
            },
            {
              title: "Quarantined",
              value: devices
                .filter((d) => d.status === "quarantined")
                .length.toLocaleString(),
              description: "Isolated devices",
              icon: Lock,
              variant: "purple",
            },
          ].map((card) => (
            <Card
              key={card.title}
              variant={card.variant as any}
              intensity="medium"
              className="glass dark:glass-dark h-full"
              icon={card.icon}
            >
              <CardHeader>
                <CardTitle>
                  <GradientText variant={card.variant as any}>
                    {card.title}
                  </GradientText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${
                    card.variant === "blue"
                      ? "text-gradient"
                      : card.variant === "green"
                      ? "text-green-500"
                      : card.variant === "orange"
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
          data={devices}
          pageSize={20}
          title="Device Directory"
          description="Manage and monitor all devices in your network"
          className="col-span-full"
        />
      </div>
    </PageTransition>
  );
}
