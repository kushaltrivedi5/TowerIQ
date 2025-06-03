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
 *   - apps.json: Enterprise's app definitions
 *   - app-usage.json: App usage tracking
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
export type PolicyAction = 'allow' | 'deny' | 'notify' | 'quarantine';
export type PolicyPriority = 'low' | 'medium' | 'high' | 'critical';
export type DeviceStatus = 'active' | 'inactive' | 'quarantined' | 'discovered';
export type TowerStatus = 'active' | 'maintenance' | 'inactive';
export type RealEstateProvider = 'American Tower Corporation' | 'Crown Castle' | 'SBA Communications' | 'Vertical Bridge' | 'Uniti Group';

// App and Action definitions
export interface App {
  id: string;
  name: string;
  category: AppCategory;
  description: string;
  vendor: string;
  version: string;
  actions: {
    id: string;
    name: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }[];
  supportedOS: OperatingSystem[];
  supportedDevices: DeviceType[];
  createdAt: string;
  updatedAt: string;
}

export interface AppUsage {
  appId: string;
  deviceId: string;
  userId: string;
  enterpriseId: string;
  lastUsed: string;
  actions: {
    actionId: string;
    timestamp: string;
    status: 'allowed' | 'denied' | 'notified';
    policyId?: string;
    towerId?: string;
    details: {
      location: {
        latitude: number;
        longitude: number;
        address: string;
      };
      signalStrength: number;
      carrier: Carrier;
    };
  }[];
}

// Entity interfaces
export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  os: OperatingSystem;
  carrier: Carrier;
  model: string;
  serialNumber: string;
  status: DeviceStatus;
  lastSeen: string;
  enterpriseId: string;
  userId: string;
  towerId?: string;
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
    securityScore: number;
    lastPolicyCheck: string;
    policyViolations: {
      policyId: string;
      timestamp: string;
      action: PolicyAction;
      resolved: boolean;
    }[];
  };
  discovery: {
    discoveredAt: string;
    discoveredBy: string; // Tower ID
    autoApproved: boolean;
    approvedBy?: string; // User ID
    approvedAt?: string;
  };
}

export interface Tower {
  id: string;
  name: string;
  status: TowerStatus;
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
    coverage: {
      radius: number;
      signalStrength: number;
    };
  }[];
  equipment: {
    type: string;
    model: string;
    status: 'operational' | 'maintenance' | 'faulty';
    lastMaintenance: string;
    capabilities: {
      deviceDiscovery: boolean;
      policyEnforcement: boolean;
      appMonitoring: boolean;
    };
  }[];
  realEstateProvider: RealEstateProvider;
  integrationStatus: {
    isActive: boolean;
    lastSync: string;
    provider: string;
    features: {
      deviceDiscovery: boolean;
      policyEnforcement: boolean;
      appMonitoring: boolean;
    };
  };
  deviceDiscovery: {
    enabled: boolean;
    lastScan: string;
    discoveredDevices: {
      deviceId: string;
      discoveredAt: string;
      status: 'pending' | 'approved' | 'rejected';
      autoApproval: boolean;
      details: {
        type: DeviceType;
        os: OperatingSystem;
        carrier: Carrier;
        signalStrength: number;
      };
    }[];
  };
  policyEnforcement: {
    activePolicies: string[]; // Policy IDs
    lastEnforcement: string;
    violations: {
      policyId: string;
      deviceId: string;
      timestamp: string;
      action: PolicyAction;
      resolved: boolean;
    }[];
  };
  connectedDevices: string[]; // Device IDs
}

export interface Policy {
  id: string;
  enterpriseId: string;
  name: string;
  description: string;
  priority: PolicyPriority;
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
        locationRestrictions?: {
          towers?: string[]; // Tower IDs
          radius?: number;
        };
      };
    }[];
  }[];
  enforcement: {
    action: PolicyAction;
    notifyUsers: string[]; // User IDs
    autoRemediation: boolean;
    towerEnforcement: {
      enabled: boolean;
      priority: number;
      affectedTowers: string[]; // Tower IDs
      lastEnforced: string;
    };
  };
  metrics: {
    totalEnforcements: number;
    violations: number;
    autoRemediated: number;
    lastViolation?: string;
  };
  createdAt: string;
  updatedAt: string;
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
    tier: SubscriptionTier;
    features: {
      autoRemediation: boolean;
      realTimeMonitoring: boolean;
      customPolicies: boolean;
      deviceDiscovery: boolean;
      apiAccess: boolean;
      towerEnforcement: boolean;
      appMonitoring: boolean;
    };
  };
  metrics: {
    devices: {
      total: number;
      active: number;
      nonCompliant: number;
      discovered: number;
      byType: Record<DeviceType, number>;
      byOS: Record<OperatingSystem, number>;
      byCarrier: Record<Carrier, number>;
    };
    policies: {
      total: number;
      active: number;
      byPriority: Record<PolicyPriority, number>;
      enforcementStats: {
        total: number;
        violations: number;
        autoRemediated: number;
      };
    };
    towers: {
      total: number;
      active: number;
      byCarrier: Record<Carrier, number>;
      byStatus: Record<TowerStatus, number>;
    };
    security: {
      complianceScore: number;
      criticalAlerts: number;
      recentIncidents: Array<{
        id: string;
        type: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        timestamp: string;
        affectedEntities: Array<{
          type: 'device' | 'tower' | 'policy' | 'user';
          id: string;
        }>;
        status: 'open' | 'investigating' | 'resolved';
        resolution?: {
          action: string;
          resolvedBy: string;
          resolvedAt: string;
        };
      }>;
    };
    apps: {
      total: number;
      byCategory: Record<AppCategory, number>;
      usageStats: {
        totalActions: number;
        violations: number;
        byApp: Record<string, {
          total: number;
          violations: number;
          lastUsed: string;
        }>;
      };
    };
  };
  users: {
    id: string;
    email: string;
    role: UserRole;
    department: string;
    devices: string[]; // Device IDs
    lastLogin: string;
    status: 'active' | 'inactive' | 'suspended';
    preferences: {
      theme: 'light' | 'dark' | 'system';
      notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
      };
    };
  }[];
  policies: string[]; // Policy IDs
  apps: string[]; // App IDs
  integrations: {
    type: IntegrationType;
    provider: string;
    status: 'active' | 'inactive' | 'pending';
    lastSync: string;
    features: {
      deviceDiscovery: boolean;
      policyEnforcement: boolean;
      appMonitoring: boolean;
    };
  }[];
  connectedTowers: string[]; // Tower IDs
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
  apps: App[];
  appUsage: AppUsage[];
  connectedTowers: Tower[];
  metrics: Enterprise['metrics'];
}

// Configuration types
export interface SeedConfig {
  enterprises: {
    count: number;
    usersPerEnterprise: { min: number; max: number };
    devicesPerUser: { min: number; max: number };
    policiesPerEnterprise: { min: number; max: number };
    appsPerEnterprise: { min: number; max: number };
  };
  towers: {
    count: number;
    carriersPerTower: { min: number; max: number };
    devicesPerTower: { min: number; max: number };
    discoveryEnabled: boolean;
  };
  apps: {
    count: number;
    actionsPerApp: { min: number; max: number };
    categories: AppCategory[];
  };
  carriers: Carrier[];
  operatingSystems: OperatingSystem[];
  deviceTypes: DeviceType[];
  userRoles: UserRole[];
  subscriptionTiers: SubscriptionTier[];
  appCategories: AppCategory[];
  realEstateProviders: RealEstateProvider[];
} 