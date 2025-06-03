"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientText } from "@/components/ui/gradient-text";
import { Shield, RadioTower, Users, Zap, Globe, Lock } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: RadioTower,
    title: "Multi-Carrier Support",
    description:
      "Manage towers supporting multiple carriers with intelligent device and OS compatibility tracking",
    variant: "blue",
  },
  {
    icon: Shield,
    title: "Policy Enforcement",
    description:
      "Role-based access control and policy enforcement for app usage and device actions",
    variant: "purple",
  },
  {
    icon: Zap,
    title: "Real-Time Monitoring",
    description:
      "Live security health dashboard with automated remedial actions for enterprise policies",
    variant: "green",
  },
  {
    icon: Globe,
    title: "Nationwide Coverage",
    description:
      "Comprehensive tower management across the nation with carrier integration",
    variant: "orange",
  },
  {
    icon: Users,
    title: "Device Management",
    description:
      "Seamless device onboarding and auto-discovery through cell towers",
    variant: "blue",
  },
  {
    icon: Lock,
    title: "Edge Security",
    description:
      "Advanced security measures at the network edge with enterprise-defined policies",
    variant: "purple",
  },
];

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Show loading state while checking auth
  if (status === "loading") {
    return null; // or a loading spinner if you prefer
  }

  // If not authenticated, show landing page
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="container px-4 mx-auto">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <GradientText variant="blue">TowerIQ</GradientText>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Intelligent tower management and security for modern enterprises
              </p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="glassEffect-medium hover:glassEffect-heavy"
                >
                  <Link href="/login">Get Started</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="glassEffect-light hover:glassEffect-medium"
                >
                  <Link href="#features">Learn More</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-background/50">
          <div className="container px-4 mx-auto">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                <GradientText variant="blue">
                  Enterprise-Grade Tower Management
                </GradientText>
              </h2>
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    className="h-full"
                  >
                    <Card
                      intensity="medium"
                      variant={
                        feature.variant as
                          | "blue"
                          | "purple"
                          | "green"
                          | "orange"
                      }
                      className="h-full flex flex-col glass dark:glass-dark"
                    >
                      <CardHeader className="flex flex-row items-center gap-3 pb-2">
                        <feature.icon
                          className={`h-8 w-8 text-${feature.variant}-500`}
                        />
                        <CardTitle>
                          <GradientText
                            variant={
                              feature.variant as
                                | "blue"
                                | "purple"
                                | "green"
                                | "orange"
                            }
                          >
                            {feature.title}
                          </GradientText>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container px-4 mx-auto">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <GradientText variant="blue">
                  Ready to Transform Your Tower Management?
                </GradientText>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join leading enterprises in securing and optimizing their
                telecom infrastructure
              </p>
              <Button
                asChild
                size="lg"
                className="glassEffect-medium hover:glassEffect-heavy"
              >
                <Link href="/login">Start Your Journey</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return null; // This won't be shown as we redirect authenticated users
}
