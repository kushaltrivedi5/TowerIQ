import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";
import {
  getDashboardMetrics,
  getDevices,
  getTowers,
  getPolicies,
} from "@/lib/data/seed";

export default function DashboardPage() {
  const metrics = getDashboardMetrics();
  const devices = getDevices();
  const towers = getTowers();
  const policies = getPolicies();

  // Calculate trend (mock calculation for now)
  const trendPercent = Math.floor(Math.random() * 20) - 10;

  return (
    <PageTransition>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            <GradientText variant="multi">Dashboard Overview</GradientText>
          </h1>
          <Badge variant="default" className="text-sm px-4 py-1">
            System Health: {metrics.systemHealth}%
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="blue" intensity="medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                <GradientText variant="blue">Devices</GradientText>
              </CardTitle>
              <Shield className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {metrics.totalDevices}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {metrics.activeDevices} active devices
              </div>
            </CardContent>
          </Card>

          <Card variant="purple" intensity="medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                <GradientText variant="purple">Towers</GradientText>
              </CardTitle>
              <ArrowUpRight className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {metrics.totalTowers}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <span className="mr-1">
                  {metrics.activeTowers} active towers
                </span>
              </div>
            </CardContent>
          </Card>

          <Card variant="green" intensity="medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                <GradientText variant="green">Policies</GradientText>
              </CardTitle>
              <AlertTriangle className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {metrics.activePolicies}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Active policies
              </div>
            </CardContent>
          </Card>

          <Card variant="orange" intensity="medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                <GradientText variant="orange">System Health</GradientText>
              </CardTitle>
              <Clock className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {metrics.systemHealth}%
              </div>
              <Progress value={metrics.systemHealth} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-gradient-primary">
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.recentAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        {new Date(alert.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            alert.type === "error"
                              ? "destructive"
                              : alert.type === "warning"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {alert.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{alert.message}</TableCell>
                      <TableCell>
                        {alert.deviceId
                          ? devices.find((d) => d.id === alert.deviceId)?.name
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gradient-primary">
                Active Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>{policy.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{policy.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            policy.priority === "critical"
                              ? "destructive"
                              : policy.priority === "high"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {policy.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            policy.status === "active" ? "default" : "secondary"
                          }
                        >
                          {policy.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
