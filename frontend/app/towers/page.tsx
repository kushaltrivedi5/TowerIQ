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
import { towers, carriers } from "@/lib/seed";
import { MapPin, Wifi, Shield, AlertTriangle } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";

type CarrierId = "ATT" | "TMO" | "VZW";

// Mock tower status
const getTowerStatus = (towerId: string) => {
  const statuses = [
    "operational",
    "maintenance",
    "degraded",
    "critical",
  ] as const;
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Mock tower metrics
const getTowerMetrics = (towerId: string) => {
  return {
    activeUsers: Math.floor(Math.random() * 1000),
    deniedActions: Math.floor(Math.random() * 50),
    complianceScore: Math.floor(Math.random() * 100),
  };
};

export default function TowersPage() {
  return (
    <PageTransition>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            <GradientText variant="multi">Tower Management</GradientText>
          </h1>
          <Badge variant="outline" className="text-sm px-4 py-1">
            {towers.length.toLocaleString()} Towers Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="blue" intensity="medium" className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                <GradientText variant="blue">Tower Map</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[16/9] bg-gradient-subtle dark:bg-gradient-card-dark rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <MapPin className="h-12 w-12 mx-auto text-primary" />
                  <p className="text-muted-foreground">
                    Map visualization coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="purple" intensity="medium">
            <CardHeader>
              <CardTitle>
                <GradientText variant="purple">Tower Status</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carriers.map((carrier) => {
                  const towerCount = towers.filter((t) =>
                    t.carriersSupported.includes(carrier.id as CarrierId)
                  ).length;
                  const percentage = (towerCount / towers.length) * 100;

                  return (
                    <div key={carrier.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {carrier.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {towerCount.toLocaleString()} towers
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card variant="green" intensity="medium">
            <CardHeader>
              <CardTitle>
                <GradientText variant="green">Tower Health</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tower ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Carriers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active Users</TableHead>
                    <TableHead>Denied Actions</TableHead>
                    <TableHead>Compliance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {towers.slice(0, 10).map((tower) => {
                    const status = getTowerStatus(tower.towerId);
                    const metrics = getTowerMetrics(tower.towerId);

                    return (
                      <TableRow key={tower.towerId}>
                        <TableCell className="font-medium">
                          {tower.towerId}
                        </TableCell>
                        <TableCell>
                          {tower.latitude.toFixed(4)},{" "}
                          {tower.longitude.toFixed(4)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {tower.carriersSupported.map((carrier) => (
                              <Badge key={carrier} variant="secondary">
                                {carrier}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status === "operational"
                                ? "default"
                                : status === "maintenance"
                                ? "secondary"
                                : status === "degraded"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{metrics.activeUsers}</TableCell>
                        <TableCell>{metrics.deniedActions}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  metrics.complianceScore >= 80
                                    ? "bg-green-500"
                                    : metrics.complianceScore >= 60
                                    ? "bg-yellow-500"
                                    : "bg-destructive"
                                }`}
                                style={{ width: `${metrics.complianceScore}%` }}
                              />
                            </div>
                            <span className="text-sm">
                              {metrics.complianceScore}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
