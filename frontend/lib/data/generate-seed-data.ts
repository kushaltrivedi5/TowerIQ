import { writeFileSync, mkdirSync } from 'fs';
import { faker } from '@faker-js/faker';
import path from 'path';

// Export all types
export type Carrier = 'AT&T' | 'Verizon' | 'T-Mobile' | 'Sprint' | 'US Cellular';
export type OperatingSystem = 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux';
export type DeviceType = 'smartphone' | 'tablet' | 'laptop' | 'IoT' | 'gateway';
export type AppCategory = 'productivity' | 'security' | 'communication' | 'enterprise' | 'custom';
export type UserRole = 'admin' | 'manager' | 'employee' | 'contractor' | 'guest';
export type SubscriptionTier = 'basic' | 'standard' | 'premium' | 'enterprise';
export type PolicyAction = 'allow' | 'deny' | 'notify' | 'quarantine';
export type PolicyPriority = 'low' | 'medium' | 'high' | 'critical';
export type TowerStatus = 'active' | 'maintenance' | 'inactive';
export type IntegrationType = 'real_estate' | 'carrier' | 'enterprise' | 'device_management';

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
    bandwidth: number; // in Mbps
    frequency: number; // in MHz
  }[];
  equipment: {
    type: string;
    model: string;
    status: 'operational' | 'maintenance' | 'faulty';
    lastMaintenance: string;
  }[];
  coverage: {
    radius: number; // in kilometers
    signalStrength: number; // in dBm
    capacity: number; // max concurrent devices
  };
  realEstateProvider: string;
  integrationStatus: {
    isActive: boolean;
    lastSync: string;
    provider: string;
  };
}

export interface Enterprise {
  id: string;
  name: string;
  subscription: {
    tier: SubscriptionTier;
    features: {
      autoRemediation: boolean;
      realTimeMonitoring: boolean;
      customPolicies: boolean;
      deviceDiscovery: boolean;
      apiAccess: boolean;
    };
    startDate: string;
    endDate: string;
    status: 'active' | 'inactive';
  };
  users: {
    id: string;
    email: string;
    role: UserRole;
    department: string;
    devices: string[]; // Device IDs
  }[];
  policies: Policy[];
  integrations: {
    type: IntegrationType;
    provider: string;
    status: 'active' | 'inactive' | 'pending';
    lastSync: string;
  }[];
}

export interface App {
  id: string;
  name: string;
  category: AppCategory;
  vendor: string;
  version: string;
  actions: {
    id: string;
    name: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
    requiresAuth: boolean;
  }[];
  supportedOS: OperatingSystem[];
  supportedDevices: DeviceType[];
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  enterpriseId: string;
  priority: PolicyPriority;
  status: 'active' | 'inactive' | 'draft';
  conditions: {
    carriers?: Carrier[];
    os?: OperatingSystem[];
    deviceTypes?: DeviceType[];
    apps?: string[]; // App IDs
    actions?: string[]; // Action IDs
    userRoles?: UserRole[];
    timeRestrictions?: {
      start: string;
      end: string;
      days: number[]; // 0-6 for Sunday-Saturday
    };
    location?: {
      type: 'tower' | 'area' | 'country';
      value: string[]; // Tower IDs or area codes
    };
  };
  actions: {
    type: PolicyAction;
    parameters?: Record<string, any>;
  }[];
  createdAt: string;
  updatedAt: string;
  lastEnforced: string;
}

export interface DashboardMetrics {
  enterprises: {
    total: number;
    active: number;
    bySubscription: Record<SubscriptionTier, number>;
  };
  devices: {
    total: number;
    active: number;
    byOS: Record<OperatingSystem, number>;
    byCarrier: Record<Carrier, number>;
    nonCompliant: number;
  };
  towers: {
    total: number;
    active: number;
    byCarrier: Record<Carrier, number>;
    byStatus: Record<TowerStatus, number>;
  };
  policies: {
    total: number;
    active: number;
    byPriority: Record<PolicyPriority, number>;
    enforcementStats: {
      allowed: number;
      denied: number;
      notified: number;
      quarantined: number;
    };
  };
  security: {
    totalAlerts: number;
    criticalAlerts: number;
    complianceScore: number;
    recentIncidents: {
      id: string;
      type: 'security' | 'compliance' | 'performance';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      timestamp: string;
      affectedEntities: {
        type: 'device' | 'tower' | 'user' | 'enterprise';
        id: string;
      }[];
    }[];
  };
}

// Configuration
const CONFIG = {
  carriers: ['AT&T', 'Verizon', 'T-Mobile', 'Sprint', 'US Cellular'] as Carrier[],
  operatingSystems: ['iOS', 'Android', 'Windows', 'macOS', 'Linux'] as OperatingSystem[],
  deviceTypes: ['smartphone', 'tablet', 'laptop', 'IoT', 'gateway'] as DeviceType[],
  userRoles: ['admin', 'manager', 'employee', 'contractor', 'guest'] as UserRole[],
  subscriptionTiers: ['basic', 'standard', 'premium', 'enterprise'] as SubscriptionTier[],
  appCategories: ['productivity', 'security', 'communication', 'enterprise', 'custom'] as AppCategory[],
  realEstateProviders: [
    'American Tower Corporation',
    'Crown Castle',
    'SBA Communications',
    'Vertical Bridge',
    'Uniti Group'
  ],
  deviceModels: {
    smartphone: {
      iOS: ['iPhone 13', 'iPhone 14', 'iPhone 15'],
      Android: ['Samsung Galaxy S23', 'Google Pixel 8', 'OnePlus 11'],
      Windows: ['Microsoft Surface Duo']
    },
    tablet: {
      iOS: ['iPad Pro', 'iPad Air', 'iPad Mini'],
      Android: ['Samsung Galaxy Tab S9', 'Google Pixel Tablet'],
      Windows: ['Microsoft Surface Pro']
    },
    laptop: {
      Windows: ['Dell Latitude', 'HP EliteBook', 'Lenovo ThinkPad'],
      macOS: ['MacBook Pro', 'MacBook Air'],
      Linux: ['System76 Lemur Pro', 'Dell XPS Developer Edition']
    },
    IoT: {
      iOS: ['Apple HomePod'],
      Android: ['Google Nest Hub'],
      Windows: ['Microsoft Azure Sphere'],
      Linux: ['Raspberry Pi'],
      macOS: ['Apple TV']
    },
    gateway: {
      Linux: ['Cisco ISR', 'Juniper SRX', 'Fortinet FortiGate'],
      Windows: ['Microsoft Azure Stack Edge'],
      macOS: ['Apple Mac Mini Server']
    }
  } as Record<DeviceType, Partial<Record<OperatingSystem, string[]>>>,
  enterpriseApps: [
    {
      id: 'app_ms_teams',
      name: 'Microsoft Teams',
      category: 'communication' as AppCategory,
      vendor: 'Microsoft',
      version: '1.0.0',
      actions: [
        { id: 'act_join_meeting', name: 'Join Meeting', description: 'Join a Teams meeting', riskLevel: 'low', requiresAuth: true },
        { id: 'act_share_screen', name: 'Share Screen', description: 'Share screen in a meeting', riskLevel: 'medium', requiresAuth: true },
        { id: 'act_record_meeting', name: 'Record Meeting', description: 'Record a Teams meeting', riskLevel: 'high', requiresAuth: true }
      ],
      supportedOS: ['iOS', 'Android', 'Windows', 'macOS'] as OperatingSystem[],
      supportedDevices: ['smartphone', 'tablet', 'laptop'] as DeviceType[]
    },
    {
      id: 'app_slack',
      name: 'Slack',
      category: 'communication' as AppCategory,
      vendor: 'Salesforce',
      version: '1.0.0',
      actions: [
        { id: 'act_send_msg', name: 'Send Message', description: 'Send a message in Slack', riskLevel: 'low', requiresAuth: true },
        { id: 'act_share_file', name: 'Share File', description: 'Share a file in Slack', riskLevel: 'medium', requiresAuth: true },
        { id: 'act_create_channel', name: 'Create Channel', description: 'Create a new Slack channel', riskLevel: 'high', requiresAuth: true }
      ],
      supportedOS: ['iOS', 'Android', 'Windows', 'macOS', 'Linux'] as OperatingSystem[],
      supportedDevices: ['smartphone', 'tablet', 'laptop'] as DeviceType[]
    },
    {
      id: 'app_salesforce',
      name: 'Salesforce',
      category: 'enterprise' as AppCategory,
      vendor: 'Salesforce',
      version: '1.0.0',
      actions: [
        { id: 'act_view_records', name: 'View Records', description: 'View Salesforce records', riskLevel: 'low', requiresAuth: true },
        { id: 'act_edit_records', name: 'Edit Records', description: 'Edit Salesforce records', riskLevel: 'medium', requiresAuth: true },
        { id: 'act_delete_records', name: 'Delete Records', description: 'Delete Salesforce records', riskLevel: 'high', requiresAuth: true }
      ],
      supportedOS: ['iOS', 'Android', 'Windows', 'macOS'] as OperatingSystem[],
      supportedDevices: ['smartphone', 'tablet', 'laptop'] as DeviceType[]
    }
  ] as App[],
  counts: {
    enterprises: 100,
    usersPerEnterprise: { min: 50, max: 1000 },
    devicesPerUser: { min: 1, max: 3 },
    towers: 5000,
    carriersPerTower: { min: 1, max: 3 },
    policiesPerEnterprise: { min: 10, max: 50 }
  }
};

// Helper functions
const getRandomElement = <T>(array: T[]): T => 
  array[Math.floor(Math.random() * array.length)];

const getRandomInt = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomDate = (start: Date, end: Date): string => 
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();

const generateDevice = (
  id: number,
  enterpriseId: string,
  userId: string,
  carrier: Carrier,
  os: OperatingSystem
): Device => {
  const type = getRandomElement(CONFIG.deviceTypes);
  const model = CONFIG.deviceModels[type]?.[os]?.[0] || `${type} ${os} Device`;

  return {
    id: `dev_${id.toString().padStart(8, '0')}`,
    name: `${faker.company.name()} ${type} ${faker.string.alphanumeric(4).toUpperCase()}`,
    type,
    os,
    carrier,
    model,
    serialNumber: faker.string.alphanumeric(12).toUpperCase(),
    status: getRandomElement(['active', 'inactive', 'quarantined']),
    lastSeen: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
    enterpriseId,
    userId,
    location: {
      latitude: parseFloat(faker.location.latitude().toString()),
      longitude: parseFloat(faker.location.longitude().toString()),
      address: `${faker.location.buildingNumber().toString()} ${faker.location.street()}, ${faker.location.city()}`
    },
    securityStatus: {
      isCompliant: Math.random() > 0.2,
      lastScan: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
      vulnerabilities: getRandomInt(0, 5),
      patchLevel: faker.system.semver()
    }
  };
};

const generateTower = (id: number): Tower => {
  const carrierCount = getRandomInt(CONFIG.counts.carriersPerTower.min, CONFIG.counts.carriersPerTower.max);
  const selectedCarriers = faker.helpers.arrayElements(CONFIG.carriers, carrierCount);

  return {
    id: `tower_${id.toString().padStart(8, '0')}`,
    name: `${faker.company.name()} Tower ${faker.string.alphanumeric(4).toUpperCase()}`,
    status: getRandomElement(['active', 'maintenance', 'inactive']),
    location: {
      latitude: parseFloat(faker.location.latitude().toString()),
      longitude: parseFloat(faker.location.longitude().toString()),
      address: `${faker.location.buildingNumber().toString()} ${faker.location.street()}, ${faker.location.city()}`
    },
    carriers: selectedCarriers.map(carrier => ({
      carrier,
      supportedOS: faker.helpers.arrayElements(CONFIG.operatingSystems, getRandomInt(1, 3)),
      supportedDevices: faker.helpers.arrayElements(CONFIG.deviceTypes, getRandomInt(1, 3)),
      bandwidth: getRandomInt(100, 1000),
      frequency: getRandomInt(700, 6000)
    })),
    equipment: [
      {
        type: 'Antenna',
        model: faker.helpers.arrayElement(['Ericsson AIR 6449', 'Nokia AirScale', 'Samsung MIMO']),
        status: getRandomElement(['operational', 'maintenance', 'faulty']),
        lastMaintenance: getRandomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date())
      },
      {
        type: 'Base Station',
        model: faker.helpers.arrayElement(['Ericsson Radio 8843', 'Nokia AirScale', 'Samsung Radio']),
        status: getRandomElement(['operational', 'maintenance', 'faulty']),
        lastMaintenance: getRandomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date())
      }
    ],
    coverage: {
      radius: getRandomInt(2, 10),
      signalStrength: getRandomInt(-90, -40),
      capacity: getRandomInt(100, 1000)
    },
    realEstateProvider: getRandomElement(CONFIG.realEstateProviders),
    integrationStatus: {
      isActive: Math.random() > 0.1,
      lastSync: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
      provider: getRandomElement(['TowerDB', 'CarrierConnect', 'TowerSync'])
    }
  };
};

const generateEnterprise = (id: number): Enterprise => {
  const userCount = getRandomInt(CONFIG.counts.usersPerEnterprise.min, CONFIG.counts.usersPerEnterprise.max);
  const subscriptionTier = getRandomElement(CONFIG.subscriptionTiers);
  
  return {
    id: `ent_${id.toString().padStart(8, '0')}`,
    name: `${faker.company.name()} ${faker.helpers.arrayElement(['Inc', 'LLC', 'Corp', 'Ltd', 'Group'])}`,
    subscription: {
      tier: subscriptionTier,
      features: {
        autoRemediation: subscriptionTier !== 'basic',
        realTimeMonitoring: subscriptionTier !== 'basic',
        customPolicies: subscriptionTier !== 'basic',
        deviceDiscovery: subscriptionTier !== 'basic',
        apiAccess: subscriptionTier === 'enterprise'
      },
      startDate: getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()),
      endDate: getRandomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      status: 'active'
    },
    users: Array.from({ length: userCount }, (_, i) => ({
      id: `usr_${id}_${i.toString().padStart(6, '0')}`,
      email: faker.internet.email(),
      role: getRandomElement(CONFIG.userRoles),
      department: faker.commerce.department(),
      devices: [] // Will be populated after device generation
    })),
    policies: [], // Will be populated after policy generation
    integrations: [
      {
        type: 'real_estate',
        provider: getRandomElement(CONFIG.realEstateProviders),
        status: 'active',
        lastSync: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date())
      },
      {
        type: 'carrier',
        provider: getRandomElement(CONFIG.carriers),
        status: 'active',
        lastSync: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date())
      }
    ]
  };
};

const generatePolicy = (enterpriseId: string, apps: App[]): Policy => {
  const app = getRandomElement(apps);
  const action = getRandomElement(app.actions);

  return {
    id: `pol_${faker.string.alphanumeric(8).toUpperCase()}`,
    name: `${faker.company.buzzPhrase()} Policy`,
    description: faker.company.catchPhrase(),
    enterpriseId,
    priority: getRandomElement(['low', 'medium', 'high', 'critical']),
    status: getRandomElement(['active', 'inactive', 'draft']),
    conditions: {
      carriers: faker.helpers.arrayElements(CONFIG.carriers, getRandomInt(1, 3)),
      os: faker.helpers.arrayElements(CONFIG.operatingSystems, getRandomInt(1, 3)),
      deviceTypes: faker.helpers.arrayElements(CONFIG.deviceTypes, getRandomInt(1, 3)),
      apps: [app.id],
      actions: [action.id],
      userRoles: faker.helpers.arrayElements(CONFIG.userRoles, getRandomInt(1, 3)),
      timeRestrictions: Math.random() > 0.7 ? {
        start: '09:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5] // Monday to Friday
      } : undefined,
      location: Math.random() > 0.5 ? {
        type: 'tower',
        value: [`tower_${faker.string.alphanumeric(8).toUpperCase()}`]
      } : undefined
    },
    actions: [
      {
        type: getRandomElement(['allow', 'deny', 'notify', 'quarantine']),
        parameters: {
          notifyUsers: Math.random() > 0.5,
          logLevel: getRandomElement(['info', 'warning', 'error']),
          quarantineDuration: getRandomInt(1, 24) // hours
        }
      }
    ],
    createdAt: getRandomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()),
    updatedAt: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
    lastEnforced: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date())
  };
};

const generateDashboardMetrics = (
  enterprises: Enterprise[],
  devices: Device[],
  towers: Tower[],
  policies: Policy[]
): DashboardMetrics => {
  const activeEnterprises = enterprises.filter(e => e.subscription.status === 'active');
  const activeDevices = devices.filter(d => d.status === 'active');
  const activeTowers = towers.filter(t => t.status === 'active');
  const activePolicies = policies.filter(p => p.status === 'active');

  return {
    enterprises: {
      total: enterprises.length,
      active: activeEnterprises.length,
      bySubscription: CONFIG.subscriptionTiers.reduce((acc, tier) => ({
        ...acc,
        [tier]: enterprises.filter(e => e.subscription.tier === tier).length
      }), {} as Record<SubscriptionTier, number>)
    },
    devices: {
      total: devices.length,
      active: activeDevices.length,
      byOS: CONFIG.operatingSystems.reduce((acc, os) => ({
        ...acc,
        [os]: devices.filter(d => d.os === os).length
      }), {} as Record<OperatingSystem, number>),
      byCarrier: CONFIG.carriers.reduce((acc, carrier) => ({
        ...acc,
        [carrier]: devices.filter(d => d.carrier === carrier).length
      }), {} as Record<Carrier, number>),
      nonCompliant: devices.filter(d => !d.securityStatus.isCompliant).length
    },
    towers: {
      total: towers.length,
      active: activeTowers.length,
      byCarrier: CONFIG.carriers.reduce((acc, carrier) => ({
        ...acc,
        [carrier]: towers.filter(t => t.carriers.some(c => c.carrier === carrier)).length
      }), {} as Record<Carrier, number>),
      byStatus: {
        active: towers.filter(t => t.status === 'active').length,
        maintenance: towers.filter(t => t.status === 'maintenance').length,
        inactive: towers.filter(t => t.status === 'inactive').length
      }
    },
    policies: {
      total: policies.length,
      active: activePolicies.length,
      byPriority: {
        low: policies.filter(p => p.priority === 'low').length,
        medium: policies.filter(p => p.priority === 'medium').length,
        high: policies.filter(p => p.priority === 'high').length,
        critical: policies.filter(p => p.priority === 'critical').length
      },
      enforcementStats: {
        allowed: getRandomInt(1000, 10000),
        denied: getRandomInt(100, 1000),
        notified: getRandomInt(500, 5000),
        quarantined: getRandomInt(10, 100)
      }
    },
    security: {
      totalAlerts: getRandomInt(100, 1000),
      criticalAlerts: getRandomInt(10, 100),
      complianceScore: getRandomInt(70, 100),
      recentIncidents: Array.from({ length: 10 }, (_, i) => ({
        id: `inc_${i.toString().padStart(6, '0')}`,
        type: getRandomElement(['security', 'compliance', 'performance']),
        severity: getRandomElement(['low', 'medium', 'high', 'critical']),
        description: faker.company.catchPhrase(),
        timestamp: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
        affectedEntities: [
          {
            type: getRandomElement(['device', 'tower', 'user', 'enterprise']),
            id: faker.string.alphanumeric(8).toUpperCase()
          }
        ]
      }))
    }
  };
};

// Export the generateDataset function
export const generateDataset = async () => {
  console.log('Generating enterprises...');
  const enterprises = Array.from({ length: CONFIG.counts.enterprises }, (_, i) => generateEnterprise(i + 1));

  console.log('Generating towers...');
  const towers = Array.from({ length: CONFIG.counts.towers }, (_, i) => generateTower(i + 1));

  console.log('Generating devices and users...');
  const devices: Device[] = [];
  enterprises.forEach(enterprise => {
    enterprise.users.forEach(user => {
      const deviceCount = getRandomInt(CONFIG.counts.devicesPerUser.min, CONFIG.counts.devicesPerUser.max);
      const userDevices = Array.from({ length: deviceCount }, (_, i) => {
        const carrier = getRandomElement(CONFIG.carriers);
        const os = getRandomElement(CONFIG.operatingSystems);
        return generateDevice(devices.length + 1, enterprise.id, user.id, carrier, os);
      });
      devices.push(...userDevices);
      user.devices = userDevices.map(d => d.id);
    });
  });

  console.log('Generating policies...');
  const policies = enterprises.flatMap(enterprise => 
    Array.from({ length: getRandomInt(CONFIG.counts.policiesPerEnterprise.min, CONFIG.counts.policiesPerEnterprise.max) }, 
      () => generatePolicy(enterprise.id, CONFIG.enterpriseApps))
  );

  console.log('Generating dashboard metrics...');
  const dashboardMetrics = generateDashboardMetrics(enterprises, devices, towers, policies);

  const dataset = {
    enterprises,
    devices,
    towers,
    policies,
    dashboardMetrics,
    generatedAt: new Date().toISOString(),
    version: '1.0.0'
  };

  // Create seed-data directory if it doesn't exist
  const seedDataDir = path.join(process.cwd(), 'lib/data/seed-data');
  mkdirSync(seedDataDir, { recursive: true });

  // Write each dataset to its own file
  const files = {
    'enterprises.json': dataset.enterprises,
    'devices.json': dataset.devices,
    'towers.json': dataset.towers,
    'policies.json': dataset.policies,
    'dashboard-metrics.json': dataset.dashboardMetrics
  };

  console.log('\nWriting data to separate files...');
  for (const [filename, data] of Object.entries(files)) {
    const filePath = path.join(seedDataDir, filename);
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`- ${filename}`);
  }
  
  console.log('\nDataset generation complete!');
  console.log(`Generated:
    - ${enterprises.length} enterprises
    - ${devices.length} devices
    - ${towers.length} towers
    - ${policies.length} policies
  `);
  console.log(`\nData written to: ${seedDataDir}`);

  return dataset;
};

// Add direct execution if this file is run directly
if (require.main === module) {
  generateDataset().catch(error => {
    console.error('Error generating seed data:', error);
    process.exit(1);
  });
} 