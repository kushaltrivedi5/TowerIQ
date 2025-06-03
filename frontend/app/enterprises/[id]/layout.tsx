"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Enterprise } from "@/lib/data/domain-types";
import Sidebar from "@/components/Sidebar";
import { ContentLoadingSpinner } from "@/components/ui/loading-spinner";

interface EnterpriseLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}

export default function EnterpriseLayout({
  children,
  params,
}: EnterpriseLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = use(params);

  useEffect(() => {
    async function loadEnterprise() {
      if (status === "loading") return;

      if (
        !session?.user ||
        session.user.role !== "admin" ||
        session.user.enterpriseId !== id
      ) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`/api/enterprises/${id}`);
        if (!response.ok) {
          throw new Error("Failed to load enterprise data");
        }
        const data = await response.json();
        setEnterprise(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load enterprise data"
        );
      } finally {
        setLoading(false);
      }
    }

    loadEnterprise();
  }, [session, status, id, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)]">
        <div className="hidden md:block fixed inset-y-20 bottom-0 w-72 h-[calc(100vh-5rem)]">
          <Sidebar enterpriseId={id} />
        </div>
        <div className="hidden md:block w-72 flex-shrink-0" />
        <main className="flex-1 p-4 md:p-8 overflow-auto w-full md:ml-0">
          <ContentLoadingSpinner text="Loading enterprise..." />
        </main>
      </div>
    );
  }

  if (error || !enterprise) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)]">
        <div className="hidden md:block fixed inset-y-20 bottom-0 w-72 h-[calc(100vh-5rem)]">
          <Sidebar enterpriseId={id} />
        </div>
        <div className="hidden md:block w-72 flex-shrink-0" />
        <main className="flex-1 p-4 md:p-8 overflow-auto w-full md:ml-0">
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-destructive mb-2">
                {error || "Failed to load enterprise data"}
              </h1>
              <p className="text-muted-foreground">
                Please try refreshing the page or contact support if the issue
                persists.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      <div className="hidden md:block fixed inset-y-20 bottom-0 w-72 h-[calc(100vh-5rem)]">
        <Sidebar enterpriseId={enterprise.id} />
      </div>
      <div className="hidden md:block w-72 flex-shrink-0" />
      <main className="flex-1 p-4 md:p-8 overflow-auto w-full md:ml-0">
        {children}
      </main>
    </div>
  );
}
