/**
 * Core domain types and interfaces for the Telecom Mission Control platform.
 * These types define the data model and relationships between entities,
 * with Enterprise being the central entity that connects all other entities.
 * 
 * Data Structure:
 * - Enterprise is the root entity
 * - Each enterprise has its own directory with:
 *   - devices.json: Enterprise's devices
 *   - policies.json: Enterprise's policies
 *   - towers.json: Connected towers
 *   - metrics.json: Enterprise metrics
 *   - enterprise.json: Enterprise details
 */

// Base types
export type Carrier = 'AT&T' | 'Verizon' | 'T-Mobile' | 'Sprint' | 'US Cellular';
export type OperatingSystem = 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux';
export type DeviceType = 'smartphone' | 'tablet' | 'laptop' | 'IoT' | 'gateway';
export type UserRole = 'admin' | 'manager' | 'employee' | 'contractor' | 'guest';
export type SubscriptionTier = 'basic' | 'standard' | 'premium' | 'enterprise';
export type AppCategory = 'productivity' | 'security' | 'communication' | 'enterprise' | 'custom';
export type IntegrationType = 'real_estate' | 'carrier' | 'device_management' | 'security';
export type EnterpriseTier = 'standard' | 'premium';

// Entity interfaces
export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  os: OperatingSystem;
  carrier: Carrier;
  model: string;
  serialNumber: string;
  status: 'active' | 'inactive' | 'quarantined';
  lastSeen: string;
  enterpriseId: string;
  userId: string;
  towerId?: string; // Connected tower
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  securityStatus: {
    isCompliant: boolean;
    lastScan: string;
    vulnerabilities: number;
    patchLevel: string;
  };
  appUsage: {
    appId: string;
    lastUsed: string;
    actions: {
      actionId: string;
      timestamp: string;
      status: 'allowed' | 'denied' | 'notified';
    }[];
  }[];
}

export interface Tower {
  id: string;
  name: string;
  status: 'active' | 'maintenance' | 'inactive';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  carriers: {
    carrier: Carrier;
    supportedOS: OperatingSystem[];
    supportedDevices: DeviceType[];
    bandwidth: number;
    frequency: number;
  }[];
  equipment: {
    type: string;
    model: string;
    status: 'operational' | 'maintenance' | 'faulty';
    lastMaintenance: string;
  }[];
  coverage: {
    radius: number;
    signalStrength: number;
    capacity: number;
  };
  realEstateProvider: string;
  integrationStatus: {
    isActive: boolean;
    lastSync: string;
    provider: string;
  };
  connectedDevices: string[]; // Device IDs
}

export interface Enterprise {
  id: string;
  name: string;
  tier: EnterpriseTier;
  createdAt: string;
  updatedAt: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  subscription: {
    startDate: string;
    endDate: string;
    status: 'active' | 'suspended' | 'cancelled';
    features: {
      autoRemediation: boolean;
      realTimeMonitoring: boolean;
      customPolicies: boolean;
      deviceDiscovery: boolean;
      apiAccess: boolean;
    };
  };
  metrics: {
    devices: {
      total: number;
      active: number;
      nonCompliant: number;
    };
    policies: {
      total: number;
      active: number;
    };
    towers: {
      total: number;
      active: number;
    };
    security: {
      complianceScore: number;
      criticalAlerts: number;
      recentIncidents: Array<{
        id: string;
        type: string;
        severity: string;
        description: string;
        timestamp: string;
        affectedEntities: Array<{
          type: string;
          id: string;
        }>;
      }>;
    };
  };
  users: {
    id: string;
    email: string;
    role: UserRole;
    department: string;
    devices: string[]; // Device IDs
  }[];
  policies: string[]; // Policy IDs
  integrations: {
    type: IntegrationType;
    provider: string;
    status: 'active' | 'inactive' | 'pending';
    lastSync: string;
  }[];
  connectedTowers: string[]; // Tower IDs
}

export interface Policy {
  id: string;
  enterpriseId: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive';
  rules: {
    appId: string;
    actions: {
      actionId: string;
      allowedRoles: UserRole[];
      conditions?: {
        deviceTypes?: DeviceType[];
        operatingSystems?: OperatingSystem[];
        carriers?: Carrier[];
        timeRestrictions?: {
          start: string;
          end: string;
          days: number[];
        };
      };
    }[];
  }[];
  enforcement: {
    action: 'allow' | 'deny' | 'notify' | 'quarantine';
    notifyUsers: string[]; // User IDs
    autoRemediation: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface EnterpriseData {
  enterprise: Enterprise;
  devices: Device[];
  policies: Policy[];
  connectedTowers: Tower[];
  metrics: {
    deviceCount: number;
    activeDevices: number;
    nonCompliantDevices: number;
    policyCount: number;
    activePolicies: number;
    towerConnections: number;
    securityScore: number;
  };
}

// Configuration types
export interface SeedConfig {
  enterprises: {
    count: number;
    usersPerEnterprise: { min: number; max: number };
    devicesPerUser: { min: number; max: number };
    policiesPerEnterprise: { min: number; max: number };
  };
  towers: {
    count: number;
    carriersPerTower: { min: number; max: number };
    devicesPerTower: { min: number; max: number };
  };
  carriers: Carrier[];
  operatingSystems: OperatingSystem[];
  deviceTypes: DeviceType[];
  userRoles: UserRole[];
  subscriptionTiers: SubscriptionTier[];
  appCategories: AppCategory[];
  realEstateProviders: string[];
} 