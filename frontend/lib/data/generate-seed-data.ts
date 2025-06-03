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
  SeedConfig,
  EnterpriseData,
  EnterpriseTier
} from './domain-types';

// Configuration
const CONFIG: SeedConfig = {
  enterprises: {
    count: 100,
    usersPerEnterprise: { min: 50, max: 1000 },
    devicesPerUser: { min: 1, max: 3 },
    policiesPerEnterprise: { min: 10, max: 50 }
  },
  towers: {
    count: 5000,
    carriersPerTower: { min: 1, max: 3 },
    devicesPerTower: { min: 1, max: 5 }
  },
  carriers: ['AT&T', 'Verizon', 'T-Mobile', 'Sprint', 'US Cellular'],
  operatingSystems: ['iOS', 'Android', 'Windows', 'macOS', 'Linux'],
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

// Helper functions
const getRandomElement = <T>(array: T[]): T => 
  array[Math.floor(Math.random() * array.length)];

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomDate = (start: Date, end: Date): string =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();

// Helper function to generate a random enterprise tier
function generateEnterpriseTier(): EnterpriseTier {
  return faker.helpers.arrayElement(['standard', 'premium']);
}

// Helper function to generate enterprise features based on tier
function generateEnterpriseFeatures(tier: EnterpriseTier) {
  return {
    autoRemediation: tier === 'premium',
    realTimeMonitoring: tier === 'premium',
    customPolicies: tier === 'premium',
    deviceDiscovery: true, // Available for both tiers
    apiAccess: tier === 'premium'
  };
}

// Generate individual entities
const generateDevice = (
  id: number,
  enterpriseId: string,
  userId: string,
  carrier: Carrier,
  os: OperatingSystem,
  towerId?: string
): Device => ({
  id: `dev_${id.toString().padStart(8, '0')}`,
  name: `${faker.company.name()} ${getRandomElement(CONFIG.deviceTypes)} ${faker.string.alphanumeric(4).toUpperCase()}`,
  type: getRandomElement(CONFIG.deviceTypes),
  os,
  carrier,
  model: `${os} Device ${faker.string.alphanumeric(4)}`,
  serialNumber: faker.string.alphanumeric(12).toUpperCase(),
  status: getRandomElement(['active', 'inactive', 'quarantined']),
  lastSeen: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
  enterpriseId,
  userId,
  towerId,
  location: {
    latitude: parseFloat(faker.location.latitude().toString()),
    longitude: parseFloat(faker.location.longitude().toString()),
    address: faker.location.streetAddress()
  },
  securityStatus: {
    isCompliant: Math.random() > 0.2,
    lastScan: getRandomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
    vulnerabilities: getRandomInt(0, 5),
    patchLevel: faker.system.semver()
  },
  appUsage: []
});

const generateTower = (id: number): Tower => {
  const carrierCount = getRandomInt(CONFIG.towers.carriersPerTower.min, CONFIG.towers.carriersPerTower.max);
  const selectedCarriers = faker.helpers.arrayElements(CONFIG.carriers, carrierCount);

  return {
    id: `tower_${id.toString().padStart(8, '0')}`,
    name: `${faker.company.name()} Tower ${faker.string.alphanumeric(4).toUpperCase()}`,
    status: getRandomElement(['active', 'maintenance', 'inactive']),
    location: {
      latitude: parseFloat(faker.location.latitude().toString()),
      longitude: parseFloat(faker.location.longitude().toString()),
      address: faker.location.streetAddress()
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
    },
    connectedDevices: []
  };
};

const generatePolicy = (enterpriseId: string): Policy => ({
  id: `pol_${faker.string.alphanumeric(8).toUpperCase()}`,
  enterpriseId,
  name: `${faker.company.name()} Security Policy`,
  description: faker.lorem.sentence(),
  priority: getRandomElement(['low', 'medium', 'high', 'critical']),
  status: getRandomElement(['active', 'inactive']),
  rules: [
    {
      appId: faker.string.uuid(),
      actions: [
        {
          actionId: faker.string.uuid(),
          allowedRoles: faker.helpers.arrayElements(CONFIG.userRoles, getRandomInt(1, 3)),
          conditions: {
            deviceTypes: faker.helpers.arrayElements(CONFIG.deviceTypes, getRandomInt(1, 3)),
            operatingSystems: faker.helpers.arrayElements(CONFIG.operatingSystems, getRandomInt(1, 3)),
            carriers: faker.helpers.arrayElements(CONFIG.carriers, getRandomInt(1, 3))
          }
        }
      ]
    }
  ],
  enforcement: {
    action: getRandomElement(['allow', 'deny', 'notify', 'quarantine']),
    notifyUsers: [],
    autoRemediation: Math.random() > 0.5
  },
  createdAt: getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()),
  updatedAt: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
});

const generateEnterprise = (id: number): Enterprise => {
  const userCount = getRandomInt(CONFIG.enterprises.usersPerEnterprise.min, CONFIG.enterprises.usersPerEnterprise.max);
  const tier = generateEnterpriseTier();
  
  // Generate users with all roles
  const users = Array.from({ length: userCount }, (_, i) => {
    // Determine role based on index
    let role: UserRole;
    if (i < userCount * 0.1) role = 'admin';
    else if (i < userCount * 0.3) role = 'manager';
    else if (i < userCount * 0.7) role = 'employee';
    else if (i < userCount * 0.9) role = 'contractor';
    else role = 'guest';

    return {
      id: `usr_${id}_${i.toString().padStart(6, '0')}`,
      email: faker.internet.email(),
      role,
      department: faker.commerce.department(),
      devices: [] as string[]
    };
  });
  
  return {
    id: `ent_${id.toString().padStart(8, '0')}`,
    name: `${faker.company.name()} ${faker.helpers.arrayElement(['Inc', 'LLC', 'Corp', 'Ltd', 'Group'])}`,
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
      endDate: getRandomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      status: 'active',
      features: generateEnterpriseFeatures(tier)
    },
    metrics: {
      devices: {
        total: 0, // Will be updated after device generation
        active: 0,
        nonCompliant: 0
      },
      policies: {
        total: 0, // Will be updated after policy generation
        active: 0
      },
      towers: {
        total: 0, // Will be updated after tower connection
        active: 0
      },
      security: {
        complianceScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        criticalAlerts: Math.floor(Math.random() * 5),
        recentIncidents: []
      }
    },
    users,
    policies: [],
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
    ],
    connectedTowers: []
  };
};

// Main generation function
export const generateDataset = async () => {
  console.log('Generating enterprises...');
  const enterprises = Array.from({ length: ENTERPRISE_COUNT }, (_, i) => generateEnterprise(i + 1));

  // Create users.json with all users but only admin users will be able to log in
  const allUsers = enterprises.flatMap(enterprise => 
    enterprise.users.map(user => ({
      id: user.id,
      name: faker.person.fullName(),
      email: user.email,
      password: HASHED_PASSWORD, // All users have the same password for demo
      role: user.role,
      enterpriseId: enterprise.id,
      enterpriseName: enterprise.name,
      lastLogin: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
      status: 'active',
      preferences: {
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    }))
  );

  // Write users.json
  await fs.writeFile(
    path.join(process.cwd(), 'lib/data/seed-data/users.json'),
    JSON.stringify(allUsers, null, 2)
  );

  console.log('Generating towers...');
  const towers = Array.from({ length: TOWERS_PER_ENTERPRISE }, (_, i) => generateTower(i + 1));

  // Create base directory for seed data
  const seedDataDir = path.join(process.cwd(), 'lib/data/seed-data');
  await fs.mkdir(seedDataDir, { recursive: true });

  // Create enterprises directory
  const enterprisesDir = path.join(seedDataDir, 'enterprises');
  await fs.mkdir(enterprisesDir, { recursive: true });

  // Generate data for each enterprise
  for (const enterprise of enterprises) {
    console.log(`\nGenerating data for enterprise ${enterprise.id}...`);
    const enterpriseDir = path.join(enterprisesDir, enterprise.id);
    await fs.mkdir(enterpriseDir, { recursive: true });

    // Generate devices for each user
    const devices: Device[] = [];
    enterprise.users.forEach(user => {
      const deviceCount = getRandomInt(CONFIG.enterprises.devicesPerUser.min, CONFIG.enterprises.devicesPerUser.max);
      const userDevices = Array.from({ length: deviceCount }, (_, i) => {
        const carrier = getRandomElement(CONFIG.carriers);
        const os = getRandomElement(CONFIG.operatingSystems);
        // Find a compatible tower
        const compatibleTower = towers.find(tower => 
          tower.carriers.some(c => 
            c.carrier === carrier && 
            c.supportedOS.includes(os) && 
            c.supportedDevices.includes(getRandomElement(CONFIG.deviceTypes))
          )
        );
        return generateDevice(devices.length + 1, enterprise.id, user.id, carrier, os, compatibleTower?.id);
      });
      devices.push(...userDevices);
      user.devices = userDevices.map(d => d.id);
    });

    // Generate policies
    const policies = Array.from(
      { length: POLICIES_PER_ENTERPRISE },
      () => generatePolicy(enterprise.id)
    );
    enterprise.policies = policies.map(p => p.id);

    // Connect towers to enterprise
    const connectedTowers = faker.helpers.arrayElements(
      towers,
      getRandomInt(5, 20)
    );
    enterprise.connectedTowers = connectedTowers.map(t => t.id);

    // Update tower connected devices
    connectedTowers.forEach(tower => {
      const towerDevices = devices.filter(d => 
        tower.carriers.some(c => 
          c.carrier === d.carrier && 
          c.supportedOS.includes(d.os) && 
          c.supportedDevices.includes(d.type)
        )
      );
      tower.connectedDevices = towerDevices.map(d => d.id);
    });

    // Calculate enterprise metrics
    const metrics = {
      deviceCount: devices.length,
      activeDevices: devices.filter(d => d.status === 'active').length,
      nonCompliantDevices: devices.filter(d => !d.securityStatus.isCompliant).length,
      policyCount: policies.length,
      activePolicies: policies.filter(p => p.status === 'active').length,
      towerConnections: enterprise.connectedTowers.length,
      securityScore: Math.floor(Math.random() * 40) + 60 // Random score between 60-100
    };

    // Create enterprise data object
    const enterpriseData: EnterpriseData = {
      enterprise,
      devices,
      policies,
      connectedTowers: connectedTowers,
      metrics
    };

    // Write enterprise data to separate files
    await fs.writeFile(
      path.join(enterpriseDir, 'enterprise.json'),
      JSON.stringify(enterprise, null, 2)
    );
    await fs.writeFile(
      path.join(enterpriseDir, 'devices.json'),
      JSON.stringify(devices, null, 2)
    );
    await fs.writeFile(
      path.join(enterpriseDir, 'policies.json'),
      JSON.stringify(policies, null, 2)
    );
    await fs.writeFile(
      path.join(enterpriseDir, 'towers.json'),
      JSON.stringify(connectedTowers, null, 2)
    );
    await fs.writeFile(
      path.join(enterpriseDir, 'metrics.json'),
      JSON.stringify(metrics, null, 2)
    );
  }

  // Write global data
  await fs.writeFile(
    path.join(seedDataDir, 'enterprises.json'),
    JSON.stringify(enterprises.map(e => ({ id: e.id, name: e.name })), null, 2)
  );
  await fs.writeFile(
    path.join(seedDataDir, 'towers.json'),
    JSON.stringify(towers.map(t => ({ id: t.id, name: t.name })), null, 2)
  );

  console.log('\nDataset generation complete!');
  console.log(`Generated:
    - ${enterprises.length} enterprises
    - ${towers.length} towers
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