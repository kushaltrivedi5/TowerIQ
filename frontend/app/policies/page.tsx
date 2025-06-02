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
import { policies, apps, users } from "@/lib/seed";
import { Shield, Lock, Unlock, AlertTriangle } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";

// Calculate policy metrics
const calculatePolicyMetrics = () => {
  const totalRoles = policies.length;
  const totalApps = apps.length;
  const totalActions = apps.reduce((acc, app) => acc + app.actions.length, 0);
  const totalUsers = users.length;

  // Calculate compliance score (mock)
  const complianceScore = Math.floor(Math.random() * 100);

  return {
    totalRoles,
    totalApps,
    totalActions,
    totalUsers,
    complianceScore,
  };
};

// Get role distribution
const getRoleDistribution = () => {
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(roleCounts).map(([role, count]) => ({
    role,
    count,
    percentage: (count / users.length) * 100,
  }));
};

export default function PoliciesPage() {
  const metrics = calculatePolicyMetrics();
  const roleDistribution = getRoleDistribution();

  return (
    <PageTransition>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            <GradientText variant="multi">Policy Management</GradientText>
          </h1>
          <Badge variant="outline" className="text-sm px-4 py-1">
            {metrics.totalRoles} Roles, {metrics.totalApps} Apps
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card variant="blue" intensity="medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                <GradientText variant="blue">Active Policies</GradientText>
              </CardTitle>
              <Shield className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {metrics.totalRoles}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Across {metrics.totalApps} applications
              </div>
            </CardContent>
          </Card>

          <Card variant="purple" intensity="medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                <GradientText variant="purple">Enforced Policies</GradientText>
              </CardTitle>
              <Lock className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {metrics.totalActions}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Protected by policies
              </div>
            </CardContent>
          </Card>

          <Card variant="orange" intensity="medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                <GradientText variant="orange">Policy Violations</GradientText>
              </CardTitle>
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {metrics.complianceScore}%
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Overall policy adherence
              </div>
            </CardContent>
          </Card>

          <Card variant="green" intensity="medium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                <GradientText variant="green">Policy Compliance</GradientText>
              </CardTitle>
              <Unlock className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {metrics.totalUsers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Protected by role-based policies
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gradient-primary">
                Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roleDistribution.map(({ role, count, percentage }) => (
                  <div key={role} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{role}</span>
                      <span className="text-sm text-muted-foreground">
                        {count.toLocaleString()} users
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gradient-primary">
                Policy Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>App</TableHead>
                    <TableHead>Allowed Actions</TableHead>
                    <TableHead>Denied Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) =>
                    Object.entries(policy.appPermissions).map(
                      ([appId, permissions]) => {
                        const app = apps.find((a) => a.appId === appId);
                        if (!app) return null;

                        return (
                          <TableRow key={`${policy.roleId}-${appId}`}>
                            <TableCell className="font-medium">
                              {policy.roleId}
                            </TableCell>
                            <TableCell>{app.appName}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {permissions.allowed.map((action) => (
                                  <Badge key={action} variant="secondary">
                                    {action === "*" ? "All Actions" : action}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {permissions.denied.map((action) => (
                                  <Badge key={action} variant="destructive">
                                    {action}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
