"use client";

import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  loadSeedData,
  Tower,
  DashboardMetrics,
} from "../../lib/data/loadSeedData";
import { RadioTower, Activity, Wrench, Link } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner";

// Define columns for the data table
const columns: Column<Tower>[] = [
  {
    key: "id",
    label: "Tower ID",
    sortable: true,
    searchable: true,
  },
  {
    key: "name",
    label: "Tower Name",
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
      { label: "Maintenance", value: "maintenance" },
      { label: "Inactive", value: "inactive" },
    ],
    render: (value: Tower["status"]) => (
      <Badge
        variant={
          value === "active"
            ? "default"
            : value === "maintenance"
            ? "secondary"
            : "destructive"
        }
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "location",
    label: "Location",
    sortable: true,
    searchable: true,
    render: (value: Tower["location"]) => (
      <span className="text-sm">{value.address}</span>
    ),
  },
  {
    key: "carriers",
    label: "Carriers",
    sortable: true,
    render: (value: Tower["carriers"]) => (
      <div className="flex flex-wrap gap-1">
        {value.map((carrier, i) => (
          <Badge key={i} variant="outline" className="w-fit">
            {carrier.carrier}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: "coverage",
    label: "Coverage",
    sortable: true,
    render: (value: Tower["coverage"]) => (
      <div className="text-sm">
        <div>Radius: {value.radius}km</div>
        <div>Signal: {value.signalStrength}dBm</div>
        <div>Capacity: {value.capacity} devices</div>
      </div>
    ),
  },
  {
    key: "equipment",
    label: "Equipment",
    sortable: true,
    render: (value: Tower["equipment"]) => (
      <div className="flex flex-wrap gap-1">
        {value.map((item, i) => (
          <Badge
            key={i}
            variant={
              item.status === "operational"
                ? "default"
                : item.status === "maintenance"
                ? "secondary"
                : "destructive"
            }
            className="w-fit"
          >
            {item.type}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: "integrationStatus",
    label: "Integration",
    sortable: true,
    render: (value: Tower["integrationStatus"]) => (
      <Badge
        variant={value.isActive ? "default" : "secondary"}
        className="w-fit"
      >
        {value.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];

export default function TowersPage() {
  const [towers, setTowers] = useState<Tower[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [towersData, metricsData] = await Promise.all([
          loadSeedData("towers"),
          loadSeedData("dashboardMetrics"),
        ]);
        setTowers(towersData);
        setMetrics(metricsData);
        setError(null);
      } catch (error) {
        console.error("Error loading tower data:", error);
        setError("Failed to load tower data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <FullPageLoadingSpinner text="Loading tower data..." />;
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

  const { total, active, byStatus } = metrics?.towers ?? {
    total: 0,
    active: 0,
    byStatus: {
      active: 0,
      maintenance: 0,
      inactive: 0,
    },
  };

  const totalCarrierConnections = towers.reduce(
    (sum, tower) => sum + tower.carriers.length,
    0
  );

  const cards = [
    {
      title: "Total Towers",
      value: total.toLocaleString(),
      description: "Network infrastructure",
      icon: RadioTower,
    },
    {
      title: "Active Towers",
      value: active.toLocaleString(),
      description: "Currently operational",
      icon: Activity,
    },
    {
      title: "Maintenance",
      value: byStatus.maintenance.toLocaleString(),
      description: "Under maintenance",
      icon: Wrench,
    },
    {
      title: "Carrier Connections",
      value: totalCarrierConnections.toLocaleString(),
      description: "Total carrier links",
      icon: Link,
    },
  ];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <RadioTower className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Towers</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr mb-8">
          {cards.map((card) => (
            <Card
              key={card.title}
              variant={
                card.title === "Total Towers"
                  ? "blue"
                  : card.title === "Active Towers"
                  ? "green"
                  : card.title === "Maintenance"
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
                      card.title === "Total Towers"
                        ? "blue"
                        : card.title === "Active Towers"
                        ? "green"
                        : card.title === "Maintenance"
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
                    card.title === "Total Towers"
                      ? "text-gradient"
                      : card.title === "Active Towers"
                      ? "text-green-500"
                      : card.title === "Maintenance"
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
          data={towers}
          pageSize={20}
          title="Tower Directory"
          description="Manage and monitor all towers in your network"
          className="col-span-full"
        />
      </div>
    </PageTransition>
  );
}
