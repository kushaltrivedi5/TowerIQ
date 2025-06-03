import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';
import { Device, Tower, Enterprise, Policy, DashboardMetrics } from '@/lib/data/generate-seed-data';

type SeedDataType = {
  devices: Device[];
  towers: Tower[];
  enterprises: Enterprise[];
  policies: Policy[];
  dashboardMetrics: DashboardMetrics;
};

const SEED_DATA_DIR = path.join(process.cwd(), 'lib/data/seed-data');

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
      macOS: 0,
      Linux: 0
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as keyof SeedDataType;

  if (!type) {
    return NextResponse.json({ error: 'Type parameter is required' }, { status: 400 });
  }

  try {
    const filePath = path.join(SEED_DATA_DIR, `${type}.json`);
    const data = readFileSync(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error(`Error loading seed data for ${type}:`, error);
    // Return empty data based on type
    switch (type) {
      case 'dashboardMetrics':
        return NextResponse.json(emptyDashboardMetrics);
      case 'devices':
        return NextResponse.json([]);
      case 'towers':
        return NextResponse.json([]);
      case 'enterprises':
        return NextResponse.json([]);
      case 'policies':
        return NextResponse.json([]);
      default:
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 });
    }
  }
} 