"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner";

export default function EnterprisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { status } = useSession();
  const { id } = use(params);

  useEffect(() => {
    if (status === "loading") return;

    // Redirect to the enterprise dashboard
    router.push(`/enterprises/${id}/dashboard`);
  }, [status, id, router]);

  return <FullPageLoadingSpinner text="Redirecting to dashboard..." />;
}
