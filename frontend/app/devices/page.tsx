import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartTable } from "@/components/ui/SmartTable";
import { loadSeedData } from "@/lib/data/loadSeedData";
import { Smartphone, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";

// Load devices data from seed-data/devices.json
const devices = loadSeedData<{
  deviceSerial: string;
  status: string;
  lastSeen: string;
  deniedActions: number;
  complianceScore: number;
  enterprise: string;
  carrier: string;
  os: string;
  model: string;
}>("devices.json");

// Define columns for SmartTable (with search, filter, sort)
const columns = [
  {
    key: "deviceSerial",
    label: "Device Serial",
    sortable: true,
    searchKey: "deviceSerial",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Non-Compliant", value: "non-compliant" },
      { label: "Blocked", value: "blocked" },
    ],
  },
  {
    key: "lastSeen",
    label: "Last Seen",
    sortable: true,
    render: (val: string) =>
      new Date(val).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  { key: "deniedActions", label: "Denied Actions", sortable: true },
  {
    key: "complianceScore",
    label: "Compliance",
    sortable: true,
    render: (val: number, row: any) => (
      <div className="flex items-center gap-2">
        {" "}
        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
          {" "}
          <div
            className={
              val >= 80
                ? "h-full bg-green-500"
                : val >= 60
                ? "h-full bg-yellow-500"
                : "h-full bg-destructive"
            }
            style={{ width: `${val}%` }}
          />{" "}
        </div>{" "}
        <span className="text-sm">{val}%</span>{" "}
      </div>
    ),
  },
  {
    key: "enterprise",
    label: "Enterprise",
    sortable: true,
    filterable: true,
    options: Array.from(new Set(devices.map((d) => d.enterprise))).map((e) => ({
      label: e,
      value: e,
    })),
  },
  {
    key: "carrier",
    label: "Carrier",
    sortable: true,
    filterable: true,
    options: Array.from(new Set(devices.map((d) => d.carrier))).map((c) => ({
      label: c,
      value: c,
    })),
  },
  {
    key: "os",
    label: "OS",
    sortable: true,
    filterable: true,
    options: Array.from(new Set(devices.map((d) => d.os))).map((o) => ({
      label: o,
      value: o,
    })),
  },
  {
    key: "model",
    label: "Model",
    sortable: true,
    filterable: true,
    options: Array.from(new Set(devices.map((d) => d.model))).map((m) => ({
      label: m,
      value: m,
    })),
  },
];

export default function DevicesPage() {
  // (Optional) Compute dashboard metrics (e.g. total devices, devices at risk, blocked devices) from devices data
  const totalDevices = devices.length;
  const devicesAtRisk = devices.filter(
    (d) => d.status === "non-compliant"
  ).length;
  const blockedDevices = devices.filter((d) => d.status === "blocked").length;

  return (
    <PageTransition>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            <GradientText variant="multi">Device Management</GradientText>
          </h1>
          <Badge variant="outline" className="text-sm px-4 py-1">
            {totalDevices.toLocaleString()} Devices Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {totalDevices.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Across enterprises
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
                <GradientText variant="orange">Devices at Risk</GradientText>
              </CardTitle>
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {devicesAtRisk.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Requires attention
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
                <GradientText variant="purple">Blocked Devices</GradientText>
              </CardTitle>
              <Shield className="h-6 w-6 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {blockedDevices.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Security policy violation
              </div>
            </CardContent>
          </Card>
        </div>

        <Card
          variant="blue"
          intensity="medium"
          className="glass dark:glass-dark"
        >
          <CardHeader>
            <CardTitle>
              <GradientText variant="blue">Device List</GradientText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SmartTable
              columns={columns}
              data={devices}
              searchKey="deviceSerial"
              pageSize={20}
            />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
