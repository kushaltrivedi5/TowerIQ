"use client";

import { useState } from "react";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { loadSeedData, Tower } from "@/lib/data/loadSeedData";
import { MapPin, Wifi, Shield, Activity } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";

// Load towers data
const towers = loadSeedData<"towers">("towers");

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
    render: (value: Tower["location"]) => (
      <div className="flex flex-col">
        <span>{value.address}</span>
        <span className="text-xs text-muted-foreground">
          {value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
        </span>
      </div>
    ),
  },
  {
    key: "carriers",
    label: "Carriers",
    sortable: true,
    render: (value: Tower["carriers"]) => (
      <div className="flex flex-col gap-1">
        {value.map((carrier, i) => (
          <div key={i} className="flex items-center gap-2">
            <Badge variant="outline" className="w-fit">
              {carrier.carrier}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {carrier.bandwidth}Mbps
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "coverage",
    label: "Coverage",
    sortable: true,
    render: (value: Tower["coverage"]) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs">Radius:</span>
          <span className="text-sm font-medium">{value.radius}km</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">Signal:</span>
          <span className="text-sm font-medium">{value.signalStrength}dBm</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">Capacity:</span>
          <span className="text-sm font-medium">{value.capacity} devices</span>
        </div>
      </div>
    ),
  },
  {
    key: "equipment",
    label: "Equipment",
    sortable: true,
    render: (value: Tower["equipment"]) => (
      <div className="flex flex-col gap-1">
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
            {item.type} ({item.model})
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
      <div className="flex flex-col gap-1">
        <Badge
          variant={value.isActive ? "default" : "destructive"}
          className="w-fit"
        >
          {value.provider}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Last sync: {new Date(value.lastSync).toLocaleString()}
        </span>
      </div>
    ),
  },
];

export default function TowersPage() {
  // Compute dashboard metrics
  const totalTowers = towers.length;
  const activeTowers = towers.filter(
    (t: Tower) => t.status === "active"
  ).length;
  const maintenanceTowers = towers.filter(
    (t: Tower) => t.status === "maintenance"
  ).length;
  const totalCarriers = towers.reduce(
    (sum: number, t: Tower) => sum + t.carriers.length,
    0
  );

  return (
    <PageTransition>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            <GradientText variant="multi">Tower Management</GradientText>
          </h1>
          <Badge variant="outline" className="text-sm px-4 py-1">
            {totalTowers.toLocaleString()} Towers
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
                <GradientText variant="blue">Total Towers</GradientText>
              </CardTitle>
              <MapPin className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {totalTowers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Network infrastructure
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
                <GradientText variant="green">Active Towers</GradientText>
              </CardTitle>
              <Activity className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {activeTowers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Currently operational
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
                <GradientText variant="orange">Maintenance</GradientText>
              </CardTitle>
              <Shield className="h-6 w-6 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {maintenanceTowers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Under maintenance
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
                <GradientText variant="purple">
                  Carrier Connections
                </GradientText>
              </CardTitle>
              <Wifi className="h-6 w-6 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {totalCarriers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Active carrier connections
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          columns={columns}
          data={towers}
          pageSize={20}
          title="Tower Directory"
          description="Manage and monitor all towers in your network"
        />
      </div>
    </PageTransition>
  );
}
