"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Shield,
  RadioTower,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
} from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";
import PageTransition from "@/components/PageTransition";

interface AdminOverviewProps {
  params: Promise<{ id: string }>;
}

export default function AdminOverview({ params }: AdminOverviewProps) {
  const resolvedParams = use(params);

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              <GradientText variant="multi">Admin Overview</GradientText>
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              Security Report
            </Button>
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card
            variant="blue"
            intensity="medium"
            className="glassEffect-medium"
            icon={RadioTower}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="blue">Total Towers</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">25</div>
            </CardContent>
          </Card>

          <Card
            variant="green"
            intensity="medium"
            className="glassEffect-medium"
            icon={Shield}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="green">Security Score</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">85%</div>
            </CardContent>
          </Card>

          <Card
            variant="orange"
            intensity="medium"
            className="glassEffect-medium"
            icon={AlertTriangle}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="orange">Active Alerts</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">3</div>
            </CardContent>
          </Card>

          <Card
            variant="purple"
            intensity="medium"
            className="glassEffect-medium"
            icon={Wrench}
          >
            <CardHeader>
              <CardTitle>
                <GradientText variant="purple">Pending Actions</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">5</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glassEffect-medium">
          <CardHeader>
            <CardTitle>
              <GradientText variant="multi">Recent Activity</GradientText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    Security Alert: Unauthorized Access Attempt
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Detected on Tower T-001
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">2h ago</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Maintenance Completed</p>
                  <p className="text-sm text-muted-foreground">
                    Tower T-002 equipment updated
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">5h ago</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Policy Update</p>
                  <p className="text-sm text-muted-foreground">
                    New security policy deployed
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">1d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions and System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glassEffect-medium">
            <CardHeader>
              <CardTitle>
                <GradientText variant="multi">Quick Actions</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <RadioTower className="h-5 w-5" />
                  <span>Add Tower</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <Shield className="h-5 w-5" />
                  <span>Security Scan</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <Wrench className="h-5 w-5" />
                  <span>Maintenance</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span>View Alerts</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glassEffect-medium">
            <CardHeader>
              <CardTitle>
                <GradientText variant="multi">System Status</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tower Connectivity</span>
                  <span className="text-sm font-medium text-green-500">
                    98%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Security Systems</span>
                  <span className="text-sm font-medium text-green-500">
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Policy Enforcement</span>
                  <span className="text-sm font-medium text-green-500">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last System Check</span>
                  <span className="text-sm font-medium">5m ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
