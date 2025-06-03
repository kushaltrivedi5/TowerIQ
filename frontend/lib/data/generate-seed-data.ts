import { promises as fs } from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import {
  Carrier,
  OperatingSystem,
  DeviceType,
  UserRole,
  SubscriptionTier,
  AppCategory,
  IntegrationType,
  Device,
  Tower,
  Enterprise,
  Policy,
  App,
  AppUsage,
  SeedConfig,
  EnterpriseData,
  EnterpriseTier,
  RealEstateProvider,
  PolicyAction,
  PolicyPriority,
  DeviceStatus,
  TowerStatus
} from './domain-types';

// Configuration
const CONFIG: SeedConfig = {
  enterprises: {
    count: 10,
    usersPerEnterprise: { min: 50, max: 1000 },
    devicesPerUser: { min: 1, max: 3 },
    policiesPerEnterprise: { min: 10, max: 50 },
    appsPerEnterprise: { min: 20, max: 100 }
  },
  towers: {
    count: 5000,
    carriersPerTower: { min: 1, max: 3 },
    devicesPerTower: { min: 1, max: 5 },
    discoveryEnabled: true
  },
  apps: {
    count: 200,
    actionsPerApp: { min: 5, max: 20 },
    categories: ['productivity', 'security', 'communication', 'enterprise', 'custom']
  },
  carriers: ['AT&T', 'Verizon', 'T-Mobile', 'Sprint', 'US Cellular'],
  operatingSystems: ['iOS', 'Android', 'Windows', 'Other'],
  deviceTypes: ['smartphone', 'tablet', 'laptop', 'IoT', 'gateway'],
  userRoles: ['admin', 'manager', 'employee', 'contractor', 'guest'],
  subscriptionTiers: ['basic', 'standard', 'premium', 'enterprise'],
  appCategories: ['productivity', 'security', 'communication', 'enterprise', 'custom'],
  realEstateProviders: [
    'American Tower Corporation',
    'Crown Castle',
    'SBA Communications',
    'Vertical Bridge',
    'Uniti Group'
  ]
};

// Constants for data generation
const ENTERPRISE_COUNT = 10; // 5 standard + 5 premium enterprises
const DEVICES_PER_ENTERPRISE = 100;
const TOWERS_PER_ENTERPRISE = 20;
const POLICIES_PER_ENTERPRISE = 15;
const INCIDENTS_PER_ENTERPRISE = 25;

// Pre-hashed password for all users (password123)
const HASHED_PASSWORD = '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9Uu';

// Predefined apps with their actions
const PREDEFINED_APPS: App[] = [
  {
    id: "app_00000001",
    name: "Microsoft Teams",
    category: "communication",
    description: "Enterprise communication and collaboration platform",
    vendor: "Microsoft",
    version: "1.0.0",
    actions: [
      {
        id: "teams_join_meeting",
        name: "Join Meeting",
        description: "User joins a Teams meeting",
        riskLevel: "low"
      },
      {
        id: "teams_share_screen",
        name: "Share Screen",
        description: "User shares their screen in a meeting",
        riskLevel: "medium"
      },
      {
        id: "teams_share_file",
        name: "Share File",
        description: "User shares a file in chat or meeting",
        riskLevel: "high"
      }
    ],
    supportedOS: ["iOS", "Android", "Windows"],
    supportedDevices: ["smartphone", "tablet", "laptop"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "app_00000002",
    name: "Slack",
    category: "communication",
    description: "Business communication platform",
    vendor: "Salesforce",
    version: "1.0.0",
    actions: [
      {
        id: "slack_send_message",
        name: "Send Message",
        description: "User sends a message in a channel or DM",
        riskLevel: "low"
      },
      {
        id: "slack_upload_file",
        name: "Upload File",
        description: "User uploads a file to a channel or DM",
        riskLevel: "high"
      },
      {
        id: "slack_join_channel",
        name: "Join Channel",
        description: "User joins a new channel",
        riskLevel: "low"
      }
    ],
    supportedOS: ["iOS", "Android", "Windows"],
    supportedDevices: ["smartphone", "tablet", "laptop"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "app_00000003",
    name: "Zoom",
    category: "communication",
    description: "Video conferencing platform",
    vendor: "Zoom Video Communications",
    version: "1.0.0",
    actions: [
      {
        id: "zoom_join_meeting",
        name: "Join Meeting",
        description: "User joins a Zoom meeting",
        riskLevel: "low"
      },
      {
        id: "zoom_record_meeting",
        name: "Record Meeting",
        description: "User starts recording a meeting",
        riskLevel: "high"
      },
      {
        id: "zoom_share_screen",
        name: "Share Screen",
        description: "User shares their screen in a meeting",
        riskLevel: "medium"
      }
    ],
    supportedOS: ["iOS", "Android", "Windows"],
    supportedDevices: ["smartphone", "tablet", "laptop"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "app_00000004",
    name: "Google Drive",
    category: "productivity",
    description: "Cloud storage and file sharing platform",
    vendor: "Google",
    version: "1.0.0",
    actions: [
      {
        id: "drive_view_file",
        name: "View File",
        description: "User views a file in Drive",
        riskLevel: "low"
      },
      {
        id: "drive_edit_file",
        name: "Edit File",
        description: "User edits a file in Drive",
        riskLevel: "medium"
      },
      {
        id: "drive_share_file",
        name: "Share File",
        description: "User shares a file with others",
        riskLevel: "high"
      }
    ],
    supportedOS: ["iOS", "Android", "Windows"],
    supportedDevices: ["smartphone", "tablet", "laptop"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "app_00000005",
    name: "Microsoft OneDrive",
    category: "productivity",
    description: "Cloud storage and file sharing platform",
    vendor: "Microsoft",
    version: "1.0.0",
    actions: [
      {
        id: "onedrive_sync_file",
        name: "Sync File",
        description: "User syncs a file to local device",
        riskLevel: "medium"
      },
      {
        id: "onedrive_share_file",
        name: "Share File",
        description: "User shares a file with others",
        riskLevel: "high"
      },
      {
        id: "onedrive_edit_file",
        name: "Edit File",
        description: "User edits a file in OneDrive",
        riskLevel: "medium"
      }
    ],
    supportedOS: ["iOS", "Android", "Windows"],
    supportedDevices: ["smartphone", "tablet", "laptop"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "app_00000006",
    name: "Microsoft Outlook",
    category: "communication",
    description: "Email and calendar management platform",
    vendor: "Microsoft",
    version: "1.0.0",
    actions: [
      {
        id: "outlook_send_email",
        name: "Send Email",
        description: "User sends an email",
        riskLevel: "medium"
      },
      {
        id: "outlook_forward_email",
        name: "Forward Email",
        description: "User forwards an email",
        riskLevel: "high"
      },
      {
        id: "outlook_attach_file",
        name: "Attach File",
        description: "User attaches a file to an email",
        riskLevel: "high"
      }
    ],
    supportedOS: ["iOS", "Android", "Windows"],
    supportedDevices: ["smartphone", "tablet", "laptop"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "app_00000007",
    name: "Salesforce",
    category: "enterprise",
    description: "Customer relationship management platform",
    vendor: "Salesforce",
    version: "1.0.0",
    actions: [
      {
        id: "salesforce_view_record",
        name: "View Record",
        description: "User views a customer record",
        riskLevel: "low"
      },
      {
        id: "salesforce_edit_record",
        name: "Edit Record",
        description: "User edits a customer record",
        riskLevel: "high"
      },
      {
        id: "salesforce_export_data",
        name: "Export Data",
        description: "User exports data from Salesforce",
        riskLevel: "high"
      }
    ],
    supportedOS: ["iOS", "Android", "Windows"],
    supportedDevices: ["smartphone", "tablet", "laptop"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "app_00000008",
    name: "ServiceNow",
    category: "enterprise",
    description: "IT service management platform",
    vendor: "ServiceNow",
    version: "1.0.0",
    actions: [
      {
        id: "servicenow_create_ticket",
        name: "Create Ticket",
        description: "User creates a new service ticket",
        riskLevel: "low"
      },
      {
        id: "servicenow_approve_change",
        name: "Approve Change",
        description: "User approves a change request",
        riskLevel: "high"
      },
      {
        id: "servicenow_view_incident",
        name: "View Incident",
        description: "User views an incident record",
        riskLevel: "medium"
      }
    ],
    supportedOS: ["iOS", "Android", "Windows"],
    supportedDevices: ["smartphone", "tablet", "laptop"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "app_00000009",
    name: "Jira",
    category: "enterprise",
    description: "Project management and issue tracking platform",
    vendor: "Atlassian",
    version: "1.0.0",
    actions: [
      {
        id: "jira_create_issue",
        name: "Create Issue",
        description: "User creates a new issue",
        riskLevel: "low"
      },
      {
        id: "jira_assign_issue",
        name: "Assign Issue",
        description: "User assigns an issue to someone",
        riskLevel: "medium"
      },
      {
        id: "jira_export_board",
        name: "Export Board",
        description: "User exports a board's data",
        riskLevel: "high"
      }
    ],
    supportedOS: ["iOS", "Android", "Windows"],
    supportedDevices: ["smartphone", "tablet", "laptop"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "app_00000010",
    name: "Confluence",
    category: "enterprise",
    description: "Team collaboration and documentation platform",
    vendor: "Atlassian",
    version: "1.0.0",
    actions: [
      {
        id: "confluence_view_page",
        name: "View Page",
        description: "User views a Confluence page",
        riskLevel: "low"
      },
      {
        id: "confluence_edit_page",
        name: "Edit Page",
        description: "User edits a Confluence page",
        riskLevel: "medium"
      },
      {
        id: "confluence_export_space",
        name: "Export Space",
        description: "User exports a space's content",
        riskLevel: "high"
      }
    ],
    supportedOS: ["iOS", "Android", "Windows"],
    supportedDevices: ["smartphone", "tablet", "laptop"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper functions
const getRandomElement = <T>(array: T[]): T => 
  array[Math.floor(Math.random() * array.length)];

const getRandomInt = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomDate = (start: Date, end: Date): string => 
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();

const getRandomLocation = () => ({
  latitude: Number(faker.location.latitude()),
  longitude: Number(faker.location.longitude()),
  address: faker.location.streetAddress()
});

// Modify the generateApp function to use predefined apps
const generateApp = (id: number): App => {
  // Use predefined apps instead of generating random ones
  const appIndex = (id - 1) % PREDEFINED_APPS.length;
  return {
    ...PREDEFINED_APPS[appIndex],
    id: `app_${String(id).padStart(8, '0')}`,
    createdAt: getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()),
    updatedAt: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
  };
};

// Generate app usage data
const generateAppUsage = (
  app: App,
  device: Device,
  enterpriseId: string,
  towerId?: string
): AppUsage => {
  const actionCount = getRandomInt(1, 10);
  const lastUsed = getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
  
  return {
    appId: app.id,
    deviceId: device.id,
    userId: device.userId,
    enterpriseId,
    lastUsed,
    actions: Array.from({ length: actionCount }, () => {
      const action = getRandomElement(app.actions);
      const timestamp = getRandomDate(new Date(Date.parse(lastUsed) - 24 * 60 * 60 * 1000), new Date(lastUsed));
      const status = getRandomElement(['allowed', 'denied', 'notified'] as const);
      
      return {
        actionId: action.id,
        timestamp,
        status,
        policyId: status !== 'allowed' ? faker.string.uuid() : undefined,
        towerId,
        details: {
          location: device.location,
          signalStrength: getRandomInt(-90, -40),
          carrier: device.carrier
        }
      };
    })
  };
};

// Generate device with proper relationships
const generateDevice = (
  id: number,
  enterpriseId: string,
  userId: string,
  tower?: Tower
): Device => {
  const type = getRandomElement(CONFIG.deviceTypes);
  const os = getRandomElement(CONFIG.operatingSystems);
  const carrier = getRandomElement(CONFIG.carriers);
  const status = getRandomElement(['active', 'inactive', 'quarantined', 'discovered'] as const);
  const isCompliant = Math.random() > 0.2;
  const vulnerabilities = getRandomInt(0, 5);
  
  const major = String(getRandomInt(1, 9));
  const minor = String(getRandomInt(0, 9));
  const patch = String(getRandomInt(0, 9));
  
  const baseDevice = {
    id: `dev_${String(id).padStart(8, '0')}`,
    name: `${faker.company.name()} ${type} ${faker.string.alphanumeric(4).toUpperCase()}`,
    type,
    os,
    carrier,
    model: `${os} Device ${faker.string.alphanumeric(4)}`,
    serialNumber: faker.string.alphanumeric(12).toUpperCase(),
    status,
    lastSeen: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
    enterpriseId,
    userId,
    towerId: tower?.id,
    location: getRandomLocation(),
    securityStatus: {
      isCompliant,
      lastScan: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
      vulnerabilities,
      patchLevel: `${major}.${minor}.${patch}`,
      securityScore: Math.max(0, 100 - (vulnerabilities * 10) - (isCompliant ? 0 : 20)),
      lastPolicyCheck: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
      policyViolations: isCompliant ? [] : Array.from({ length: getRandomInt(1, 3) }, () => ({
        policyId: faker.string.uuid(),
        timestamp: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
        action: getRandomElement(['deny', 'notify', 'quarantine'] as const),
        resolved: Math.random() > 0.5
      }))
    }
  };

  if (status === 'discovered') {
    return {
      ...baseDevice,
      discovery: {
        discoveredAt: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
        discoveredBy: tower?.id || faker.string.uuid(),
        autoApproved: Math.random() > 0.5,
        approvedBy: Math.random() > 0.5 ? faker.string.uuid() : undefined,
        approvedAt: Math.random() > 0.5 ? getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()) : undefined
      }
    };
  }

  return {
    ...baseDevice,
    discovery: {
      discoveredAt: new Date().toISOString(),
      discoveredBy: tower?.id || faker.string.uuid(),
      autoApproved: false,
      approvedBy: undefined,
      approvedAt: undefined
    }
  };
};

// Generate tower with proper carrier and device support
const generateTower = (id: number): Tower => {
  const carrierCount = getRandomInt(CONFIG.towers.carriersPerTower.min, CONFIG.towers.carriersPerTower.max);
  const selectedCarriers = faker.helpers.arrayElements(CONFIG.carriers, carrierCount);
  const status = getRandomElement(['active', 'maintenance', 'inactive'] as const);
  const location = getRandomLocation();

  return {
    id: `tower_${String(id).padStart(8, '0')}`,
    name: `${faker.company.name()} Tower ${faker.string.alphanumeric(4).toUpperCase()}`,
    status,
    location,
    carriers: selectedCarriers.map(carrier => ({
      carrier,
      supportedOS: faker.helpers.arrayElements(CONFIG.operatingSystems, getRandomInt(1, 3)),
      supportedDevices: faker.helpers.arrayElements(CONFIG.deviceTypes, getRandomInt(1, 3)),
      bandwidth: getRandomInt(100, 1000),
      frequency: getRandomInt(700, 6000),
      coverage: {
        radius: getRandomInt(2, 10),
        signalStrength: getRandomInt(-90, -40)
      }
    })),
    equipment: [
      {
        type: 'Antenna',
        model: faker.helpers.arrayElement(['Ericsson AIR 6449', 'Nokia AirScale', 'Samsung MIMO']),
        status: getRandomElement(['operational', 'maintenance', 'faulty'] as const),
        lastMaintenance: getRandomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()),
        capabilities: {
          deviceDiscovery: true,
          policyEnforcement: true,
          appMonitoring: true
        }
      }
    ],
    realEstateProvider: getRandomElement(CONFIG.realEstateProviders),
    integrationStatus: {
      isActive: Math.random() > 0.1,
      lastSync: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
      provider: getRandomElement(['TowerDB', 'CarrierConnect', 'TowerSync'] as const),
      features: {
        deviceDiscovery: true,
        policyEnforcement: true,
        appMonitoring: true
      }
    },
    deviceDiscovery: {
      enabled: CONFIG.towers.discoveryEnabled,
      lastScan: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
      discoveredDevices: []
    },
    policyEnforcement: {
      activePolicies: [],
      lastEnforcement: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
      violations: []
    },
    connectedDevices: []
  };
};

// Generate policy with proper rules and enforcement
const generatePolicy = (
  id: string,
  enterpriseId: string,
  apps: App[],
  users: { id: string; role: UserRole }[]
): Policy => {
  const priority = getRandomElement(['low', 'medium', 'high', 'critical'] as const);
  const status = getRandomElement(['active', 'inactive'] as const);
  const selectedApps = faker.helpers.arrayElements(apps, getRandomInt(1, 3));
  const selectedUsers = faker.helpers.arrayElements(users, getRandomInt(1, 5));

  return {
    id: `pol_${id}`,
    enterpriseId,
    name: `${faker.company.name()} Security Policy`,
    description: faker.lorem.sentence(),
    priority,
    status,
    rules: selectedApps.map(app => ({
      appId: app.id,
      actions: app.actions.map(action => ({
        actionId: action.id,
        allowedRoles: faker.helpers.arrayElements(CONFIG.userRoles, getRandomInt(1, 3)),
    conditions: {
          deviceTypes: faker.helpers.arrayElements(CONFIG.deviceTypes, getRandomInt(1, 3)),
          operatingSystems: faker.helpers.arrayElements(CONFIG.operatingSystems, getRandomInt(1, 3)),
      carriers: faker.helpers.arrayElements(CONFIG.carriers, getRandomInt(1, 3)),
      timeRestrictions: Math.random() > 0.7 ? {
        start: '09:00',
        end: '17:00',
            days: [1, 2, 3, 4, 5]
      } : undefined,
          locationRestrictions: Math.random() > 0.7 ? {
            radius: getRandomInt(1, 5)
      } : undefined
        }
      }))
    })),
    enforcement: {
      action: getRandomElement(['allow', 'deny', 'notify', 'quarantine'] as const),
      notifyUsers: selectedUsers.map(u => u.id),
      autoRemediation: Math.random() > 0.5,
      towerEnforcement: {
        enabled: Math.random() > 0.3,
        priority: getRandomInt(1, 5),
        affectedTowers: [],
        lastEnforced: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date())
      }
    },
    metrics: {
      totalEnforcements: getRandomInt(0, 1000),
      violations: getRandomInt(0, 100),
      autoRemediated: getRandomInt(0, 50),
      lastViolation: Math.random() > 0.7 ? getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()) : undefined
    },
    createdAt: getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()),
    updatedAt: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
  };
};

// Generate enterprise with all related data
const generateEnterprise = async (id: number): Promise<EnterpriseData> => {
  const tier = getRandomElement(['standard', 'premium'] as const);
  const subscriptionTier = getRandomElement(CONFIG.subscriptionTiers);
  const userCount = getRandomInt(CONFIG.enterprises.usersPerEnterprise.min, CONFIG.enterprises.usersPerEnterprise.max);
  const policyCount = getRandomInt(CONFIG.enterprises.policiesPerEnterprise.min, CONFIG.enterprises.policiesPerEnterprise.max);
  const appCount = getRandomInt(CONFIG.enterprises.appsPerEnterprise.min, CONFIG.enterprises.appsPerEnterprise.max);
  
  // Generate apps first
  const apps = Array.from({ length: appCount }, (_, i) => generateApp(i + 1));
  
  // Generate users
  const users = Array.from({ length: userCount }, (_, i) => ({
    id: `usr_${id}_${i.toString().padStart(6, '0')}`,
    email: faker.internet.email(),
    role: getRandomElement(CONFIG.userRoles),
    department: faker.commerce.department(),
    devices: [] as string[],
    lastLogin: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
    status: getRandomElement(['active', 'inactive', 'suspended'] as const),
    preferences: {
      theme: getRandomElement(['light', 'dark', 'system'] as const),
      notifications: {
        email: Math.random() > 0.2,
        push: Math.random() > 0.2,
        sms: Math.random() > 0.5
      }
    }
  }));

  // Generate policies
  const policies = Array.from({ length: policyCount }, (_, i) => 
    generatePolicy(faker.string.alphanumeric(8).toUpperCase(), `ent_${id.toString().padStart(8, '0')}`, apps, users)
  );

  // Generate towers
  const towerCount = getRandomInt(5, 20);
  const towers = Array.from({ length: towerCount }, (_, i) => generateTower(i + 1));

  // Generate devices for each user
  let deviceId = 1;
  const devices: Device[] = [];
  const appUsage: AppUsage[] = [];

  for (const user of users) {
    const deviceCount = getRandomInt(CONFIG.enterprises.devicesPerUser.min, CONFIG.enterprises.devicesPerUser.max);
    const userDevices: string[] = [];

    for (let i = 0; i < deviceCount; i++) {
      const tower = getRandomElement(towers);
      const device = generateDevice(deviceId++, `ent_${id.toString().padStart(8, '0')}`, user.id, tower);
      devices.push(device);
      userDevices.push(device.id);

      // Generate app usage for each device
      const deviceApps = faker.helpers.arrayElements(apps, getRandomInt(1, 5));
      for (const app of deviceApps) {
        appUsage.push(generateAppUsage(app, device, `ent_${id.toString().padStart(8, '0')}`, tower.id));
      }

      // Update tower's connected devices
      tower.connectedDevices.push(device.id);
    }

    user.devices = userDevices;
  }

  // Update tower discovery and policy enforcement
  for (const tower of towers) {
    // Add discovered devices
    const discoveredCount = getRandomInt(0, 5);
    tower.deviceDiscovery.discoveredDevices = Array.from({ length: discoveredCount }, () => ({
      deviceId: faker.string.uuid(),
      discoveredAt: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
      status: getRandomElement(['pending', 'approved', 'rejected']),
      autoApproval: Math.random() > 0.5,
      details: {
        type: getRandomElement(CONFIG.deviceTypes),
        os: getRandomElement(CONFIG.operatingSystems),
        carrier: getRandomElement(CONFIG.carriers),
        signalStrength: getRandomInt(-90, -40)
      }
    }));

    // Add policy enforcement
    const activePolicies = faker.helpers.arrayElements(policies, getRandomInt(1, 5));
    tower.policyEnforcement.activePolicies = activePolicies.map(p => p.id);
    tower.policyEnforcement.violations = Array.from({ length: getRandomInt(0, 10) }, () => ({
      policyId: getRandomElement(activePolicies).id,
      deviceId: getRandomElement(devices).id,
      timestamp: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
      action: getRandomElement(['deny', 'notify', 'quarantine'] as const),
      resolved: Math.random() > 0.3
    }));
  }

  // Calculate metrics
  const metrics = {
    devices: {
      total: devices.length,
      active: devices.filter(d => d.status === 'active').length,
      nonCompliant: devices.filter(d => !d.securityStatus.isCompliant).length,
      discovered: devices.filter(d => d.status === 'discovered').length,
      byType: CONFIG.deviceTypes.reduce((acc, type) => ({
        ...acc,
        [type]: devices.filter(d => d.type === type).length
      }), {} as Record<DeviceType, number>),
      byOS: CONFIG.operatingSystems.reduce((acc, os) => ({
        ...acc,
        [os]: devices.filter(d => d.os === os).length
      }), {} as Record<OperatingSystem, number>),
      byCarrier: CONFIG.carriers.reduce((acc, carrier) => ({
        ...acc,
        [carrier]: devices.filter(d => d.carrier === carrier).length
      }), {} as Record<Carrier, number>)
    },
    policies: {
      total: policies.length,
      active: policies.filter(p => p.status === 'active').length,
      byPriority: (['low', 'medium', 'high', 'critical'] as const).reduce((acc, priority) => ({
        ...acc,
        [priority]: policies.filter(p => p.priority === priority).length
      }), {} as Record<PolicyPriority, number>),
      enforcementStats: {
        total: policies.reduce((sum, p) => sum + p.metrics.totalEnforcements, 0),
        violations: policies.reduce((sum, p) => sum + p.metrics.violations, 0),
        autoRemediated: policies.reduce((sum, p) => sum + p.metrics.autoRemediated, 0)
      }
    },
    towers: {
      total: towers.length,
      active: towers.filter(t => t.status === 'active').length,
      byCarrier: CONFIG.carriers.reduce((acc, carrier) => ({
        ...acc,
        [carrier]: towers.filter(t => t.carriers.some(c => c.carrier === carrier)).length
      }), {} as Record<Carrier, number>),
      byStatus: (['active', 'maintenance', 'inactive'] as const).reduce((acc, status) => ({
        ...acc,
        [status]: towers.filter(t => t.status === status).length
      }), {} as Record<TowerStatus, number>)
    },
    security: {
      complianceScore: Math.floor(Math.random() * 40) + 60,
      criticalAlerts: getRandomInt(0, 5),
      recentIncidents: Array.from({ length: getRandomInt(0, 5) }, () => ({
        id: faker.string.uuid(),
        type: getRandomElement(['policy_violation', 'device_discovery', 'tower_maintenance', 'security_breach'] as const),
        severity: getRandomElement(['low', 'medium', 'high', 'critical'] as const),
        description: faker.lorem.sentence(),
        timestamp: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
        affectedEntities: Array.from({ length: getRandomInt(1, 3) }, () => ({
          type: getRandomElement(['device', 'tower', 'policy', 'user'] as const),
          id: faker.string.uuid()
        })),
        status: getRandomElement(['open', 'investigating', 'resolved'] as const),
        resolution: Math.random() > 0.5 ? {
          action: faker.lorem.sentence(),
          resolvedBy: faker.string.uuid(),
          resolvedAt: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date())
        } : undefined
      }))
    },
    apps: {
      total: apps.length,
      byCategory: CONFIG.appCategories.reduce((acc, category) => ({
        ...acc,
        [category]: apps.filter(a => a.category === category).length
      }), {} as Record<AppCategory, number>),
      usageStats: {
        totalActions: appUsage.reduce((sum, usage) => sum + usage.actions.length, 0),
        violations: appUsage.reduce((sum, usage) => 
          sum + usage.actions.filter(a => a.status !== 'allowed').length, 0),
        byApp: apps.reduce((acc, app) => {
          const appUsages = appUsage.filter(u => u.appId === app.id);
          const lastUsed = appUsages.length > 0 
            ? appUsages.reduce((latest, u) => 
                new Date(u.lastUsed) > new Date(latest) ? u.lastUsed : latest, '')
            : new Date().toISOString(); // Use current time as fallback
          return {
            ...acc,
            [app.id]: {
              total: appUsages.reduce((sum, u) => sum + u.actions.length, 0),
              violations: appUsages.reduce((sum, u) => 
                sum + u.actions.filter(a => a.status !== 'allowed').length, 0),
              lastUsed
            }
          };
        }, {} as Record<string, { total: number; violations: number; lastUsed: string }>)
      }
    }
  };

  // Create enterprise object
  const enterprise: Enterprise = {
    id: `ent_${id.toString().padStart(8, '0')}`,
    name: `${faker.company.name()} Ltd`,
    tier,
    createdAt: getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()),
    updatedAt: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
    contactEmail: faker.internet.email(),
    contactPhone: faker.phone.number(),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      zipCode: faker.location.zipCode()
    },
    subscription: {
      startDate: getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()),
      endDate: getRandomDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), new Date(Date.now() + 730 * 24 * 60 * 60 * 1000)),
      status: 'active',
      tier: subscriptionTier,
      features: {
        autoRemediation: subscriptionTier === 'premium' || subscriptionTier === 'enterprise',
        realTimeMonitoring: true,
        customPolicies: subscriptionTier !== 'basic',
        deviceDiscovery: true,
        apiAccess: subscriptionTier !== 'basic',
        towerEnforcement: subscriptionTier === 'premium' || subscriptionTier === 'enterprise',
        appMonitoring: true
      }
    },
    metrics,
    users,
    policies: policies.map(p => p.id),
    apps: apps.map(a => a.id),
    integrations: [
      {
        type: 'real_estate',
        provider: getRandomElement(CONFIG.realEstateProviders),
        status: 'active',
        lastSync: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
        features: {
          deviceDiscovery: true,
          policyEnforcement: subscriptionTier === 'premium' || subscriptionTier === 'enterprise',
          appMonitoring: true
        }
      },
      {
        type: 'carrier',
        provider: getRandomElement(CONFIG.carriers),
        status: 'active',
        lastSync: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
        features: {
          deviceDiscovery: true,
          policyEnforcement: true,
          appMonitoring: true
        }
      }
    ],
    connectedTowers: towers.map(t => t.id)
  };

  return {
    enterprise,
    devices,
    policies,
    apps,
    appUsage,
    connectedTowers: towers,
    metrics
  };
};

// Main generation function
export const generateDataset = async () => {
  console.log('Generating enterprises...');
  const enterprises = await Promise.all(
    Array.from({ length: CONFIG.enterprises.count }, (_, i) => generateEnterprise(i + 1))
  );

  // Create base directory for seed data
  const seedDataDir = path.join(process.cwd(), 'lib/data/seed-data');
  await fs.mkdir(seedDataDir, { recursive: true });

  // Create enterprises directory
  const enterprisesDir = path.join(seedDataDir, 'enterprises');
  await fs.mkdir(enterprisesDir, { recursive: true });

  // Write enterprise data
  for (const data of enterprises) {
    const enterpriseDir = path.join(enterprisesDir, data.enterprise.id);
    await fs.mkdir(enterpriseDir, { recursive: true });

    // Write enterprise data to separate files
    await fs.writeFile(
      path.join(enterpriseDir, 'enterprise.json'),
      JSON.stringify(data.enterprise, null, 2)
    );
    await fs.writeFile(
      path.join(enterpriseDir, 'devices.json'),
      JSON.stringify(data.devices, null, 2)
    );
    await fs.writeFile(
      path.join(enterpriseDir, 'policies.json'),
      JSON.stringify(data.policies, null, 2)
    );
    await fs.writeFile(
      path.join(enterpriseDir, 'towers.json'),
      JSON.stringify(data.connectedTowers, null, 2)
    );
    await fs.writeFile(
      path.join(enterpriseDir, 'apps.json'),
      JSON.stringify(data.apps, null, 2)
    );
    await fs.writeFile(
      path.join(enterpriseDir, 'app-usage.json'),
      JSON.stringify(data.appUsage, null, 2)
    );
    await fs.writeFile(
      path.join(enterpriseDir, 'metrics.json'),
      JSON.stringify(data.metrics, null, 2)
    );
  }

  // Write global data
  await fs.writeFile(
    path.join(seedDataDir, 'enterprises.json'),
    JSON.stringify(enterprises.map(e => ({ 
      id: e.enterprise.id, 
      name: e.enterprise.name,
      tier: e.enterprise.tier,
      subscription: e.enterprise.subscription
    })), null, 2)
  );
  
  console.log('\nDataset generation complete!');
  console.log(`Generated:
    - ${enterprises.length} enterprises
    - ${enterprises.reduce((sum, e) => sum + e.devices.length, 0)} devices
    - ${enterprises.reduce((sum, e) => sum + e.policies.length, 0)} policies
    - ${enterprises.reduce((sum, e) => sum + e.apps.length, 0)} apps
    - ${enterprises.reduce((sum, e) => sum + e.connectedTowers.length, 0)} towers
  `);
  console.log(`\nData written to: ${seedDataDir}`);
};

// Add direct execution if this file is run directly
if (require.main === module) {
  generateDataset().catch(error => {
    console.error('Error generating seed data:', error);
    process.exit(1);
  });
} 