"use client";

import { useState } from "react";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { loadSeedData, Enterprise } from "@/lib/data/loadSeedData";
import { Building2, Users, Shield, Activity } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";

// Load enterprises data
const enterprises = loadSeedData<"enterprises">("enterprises");

// Define columns for the data table
const columns: Column<Enterprise>[] = [
  {
    key: "id",
    label: "Enterprise ID",
    sortable: true,
    searchable: true,
  },
  {
    key: "name",
    label: "Enterprise Name",
    sortable: true,
    searchable: true,
  },
  {
    key: "subscription",
    label: "Subscription",
    sortable: true,
    filterable: true,
    options: [
      { label: "Basic", value: "basic" },
      { label: "Standard", value: "standard" },
      { label: "Premium", value: "premium" },
      { label: "Enterprise", value: "enterprise" },
    ],
    render: (value: Enterprise["subscription"]) => (
      <Badge
        variant={
          value.tier === "enterprise"
            ? "default"
            : value.tier === "premium"
            ? "secondary"
            : value.tier === "standard"
            ? "outline"
            : "secondary"
        }
      >
        {value.tier.charAt(0).toUpperCase() + value.tier.slice(1)}
      </Badge>
    ),
  },
  {
    key: "users",
    label: "Users",
    sortable: true,
    render: (value: Enterprise["users"]) => value.length.toLocaleString(),
  },
  {
    key: "policies",
    label: "Policies",
    sortable: true,
    render: (value: Enterprise["policies"]) => value.length.toLocaleString(),
  },
  {
    key: "subscription",
    label: "Status",
    sortable: true,
    filterable: true,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
    render: (value: Enterprise["subscription"]) => (
      <Badge variant={value.status === "active" ? "default" : "secondary"}>
        {value.status}
      </Badge>
    ),
  },
  {
    key: "subscription",
    label: "Subscription Period",
    sortable: true,
    render: (value: Enterprise["subscription"]) =>
      `${new Date(value.startDate).toLocaleDateString()} - ${new Date(
        value.endDate
      ).toLocaleDateString()}`,
  },
  {
    key: "integrations",
    label: "Integrations",
    sortable: true,
    render: (value: Enterprise["integrations"]) => (
      <div className="flex flex-col gap-1">
        {value.map((integration, i) => (
          <Badge
            key={i}
            variant={
              integration.status === "active"
                ? "default"
                : integration.status === "pending"
                ? "secondary"
                : "destructive"
            }
            className="w-fit"
          >
            {integration.type} ({integration.provider})
          </Badge>
        ))}
      </div>
    ),
  },
];

export default function EnterprisesPage() {
  // Compute dashboard metrics
  const totalEnterprises = enterprises.length;
  const activeEnterprises = enterprises.filter(
    (e: Enterprise) => e.subscription.status === "active"
  ).length;
  const premiumEnterprises = enterprises.filter(
    (e: Enterprise) =>
      e.subscription.tier === "premium" || e.subscription.tier === "enterprise"
  ).length;
  const totalUsers = enterprises.reduce(
    (sum: number, e: Enterprise) => sum + e.users.length,
    0
  );

  return (
    <PageTransition>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            <GradientText variant="multi">Enterprise Management</GradientText>
          </h1>
          <Badge variant="outline" className="text-sm px-4 py-1">
            {totalEnterprises.toLocaleString()} Enterprises
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
                <GradientText variant="blue">Total Enterprises</GradientText>
              </CardTitle>
              <Building2 className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {totalEnterprises.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Registered organizations
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
                <GradientText variant="green">Active Enterprises</GradientText>
              </CardTitle>
              <Activity className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {activeEnterprises.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Currently active
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
                <GradientText variant="orange">Premium Tier</GradientText>
              </CardTitle>
              <Shield className="h-6 w-6 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {premiumEnterprises.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Premium & Enterprise plans
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
                <GradientText variant="purple">Total Users</GradientText>
              </CardTitle>
              <Users className="h-6 w-6 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {totalUsers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Across all enterprises
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable
          columns={columns}
          data={enterprises}
          pageSize={20}
          title="Enterprise Directory"
          description="Manage and monitor all enterprises in your network"
        />
      </div>
    </PageTransition>
  );
}
