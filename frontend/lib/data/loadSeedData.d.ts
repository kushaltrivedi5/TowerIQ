import { Device, Tower, Enterprise, Policy, DashboardMetrics } from './generate-seed-data';

type SeedDataType = {
  devices: Device[];
  towers: Tower[];
  enterprises: Enterprise[];
  policies: Policy[];
  dashboardMetrics: DashboardMetrics;
};

export function loadSeedData<T extends keyof SeedDataType>(type: T): SeedDataType[T];
export function searchData<T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[];
export function filterData<T extends Record<string, any>>(
  data: T[],
  filters: Partial<Record<keyof T, any>>
): T[];
export function sortData<T extends Record<string, any>>(
  data: T[],
  sortKey: keyof T,
  direction?: 'asc' | 'desc'
): T[];
export function paginateData<T>(
  data: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; totalPages: number };

export type { Device, Tower, Enterprise, Policy, DashboardMetrics }; 