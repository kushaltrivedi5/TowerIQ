import { Device, Tower, Enterprise, Policy, DashboardMetrics } from './domain-types';


type SeedDataType = {
  devices: Device[];
  towers: Tower[];
  enterprises: Enterprise[];
  policies: Policy[];
  dashboardMetrics: DashboardMetrics;
};

const emptyDashboardMetrics: DashboardMetrics = {
  enterprises: {
    total: 0,
    active: 0,
    bySubscription: {
      basic: 0,
      standard: 0,
      premium: 0,
      enterprise: 0
    }
  },
  devices: {
    total: 0,
    active: 0,
    byOS: {
      iOS: 0,
      Android: 0,
      Windows: 0,
      Other: 0,
    },
    byCarrier: {
      'AT&T': 0,
      'Verizon': 0,
      'T-Mobile': 0,
      'Sprint': 0,
      'US Cellular': 0
    },
    nonCompliant: 0
  },
  towers: {
    total: 0,
    active: 0,
    byCarrier: {
      'AT&T': 0,
      'Verizon': 0,
      'T-Mobile': 0,
      'Sprint': 0,
      'US Cellular': 0
    },
    byStatus: {
      active: 0,
      maintenance: 0,
      inactive: 0
    }
  },
  policies: {
    total: 0,
    active: 0,
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    },
    enforcementStats: {
      allowed: 0,
      denied: 0,
      notified: 0,
      quarantined: 0
    }
  },
  security: {
    totalAlerts: 0,
    criticalAlerts: 0,
    complianceScore: 0,
    recentIncidents: []
  }
};

export async function loadSeedData<T extends keyof SeedDataType>(type: T): Promise<SeedDataType[T]> {
  try {
    const response = await fetch(`/api/seed-data?type=${type}`);
    if (!response.ok) {
      throw new Error(`Failed to load seed data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading seed data for ${type}:`, error);
    // Return appropriate empty value based on type
    switch (type) {
      case 'dashboardMetrics':
        return emptyDashboardMetrics as SeedDataType[T];
      case 'devices':
        return ([] as Device[]) as SeedDataType[T];
      case 'towers':
        return ([] as Tower[]) as SeedDataType[T];
      case 'enterprises':
        return ([] as Enterprise[]) as SeedDataType[T];
      case 'policies':
        return ([] as Policy[]) as SeedDataType[T];
      default:
        return ([] as any[]) as SeedDataType[T];
    }
  }
}

// Helper functions for data manipulation
export function searchData<T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm) return data;
  const term = searchTerm.toLowerCase();
  return data.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    })
  );
}

export function filterData<T extends Record<string, any>>(
  data: T[],
  filters: Partial<Record<keyof T, any>>
): T[] {
  return data.filter(item =>
    Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const itemValue = item[key as keyof T];
      return Array.isArray(value)
        ? value.includes(itemValue)
        : itemValue === value;
    })
  );
}

export function sortData<T extends Record<string, any>>(
  data: T[],
  sortKey: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...data].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle date strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const aDate = new Date(aValue).getTime();
      const bDate = new Date(bValue).getTime();
      if (!isNaN(aDate) && !isNaN(bDate)) {
        return direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
    }
    
    return 0;
  });
}

export function paginateData<T>(
  data: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; totalPages: number } {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = data.slice(start, end);
  
  return {
    data: paginatedData,
    total: data.length,
    totalPages: Math.ceil(data.length / pageSize)
  };
}

// Export types for use in components
export type { Device, Tower, Enterprise, Policy, DashboardMetrics }; 