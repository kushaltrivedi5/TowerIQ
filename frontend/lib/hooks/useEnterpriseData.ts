import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PaginatedResponse } from '@/lib/data/domain-types';

interface UseEnterpriseDataOptions {
  type: 'devices' | 'policies' | 'towers';
  pageSize?: number;
  initialPage?: number;
}

export function useEnterpriseData<T>({
  type,
  pageSize = 500,
  initialPage = 1,
}: UseEnterpriseDataOptions) {
  const { data: session } = useSession();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.enterpriseId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/enterprises/${session.user.enterpriseId}/data?type=${type}&page=${page}&pageSize=${pageSize}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: PaginatedResponse<T> = await response.json();
        
        setData(result.data);
        setTotalPages(result.totalPages);
        setTotalItems(result.total);
        setHasMore(result.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session?.user?.enterpriseId, type, page, pageSize]);

  const nextPage = () => {
    if (page < totalPages) {
      setPage(p => p + 1);
    }
  };

  const previousPage = () => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    hasMore,
    nextPage,
    previousPage,
    goToPage,
  };
} 