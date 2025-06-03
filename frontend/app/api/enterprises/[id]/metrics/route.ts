import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import fs from 'fs/promises';
import path from 'path';
import { use } from 'react';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication and enterprise access
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Check if user has access to this enterprise and is an admin
    if (token.enterpriseId !== id || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Access denied' },
        { status: 403 }
      );
    }

    // Read enterprise data to get metrics
    const enterprisePath = path.join(
      process.cwd(),
      'lib/data/seed-data/enterprises',
      id,
      'enterprise.json'
    );

    try {
      const data = await fs.readFile(enterprisePath, 'utf-8');
      const enterprise = JSON.parse(data);
      
      // Return metrics in the expected format
      return NextResponse.json({
        devices: enterprise.metrics.devices,
        policies: enterprise.metrics.policies,
        towers: enterprise.metrics.towers,
        users: {
          total: enterprise.users.length,
          byRole: enterprise.users.reduce((acc: Record<string, number>, user: any) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {}),
          byStatus: enterprise.users.reduce((acc: Record<string, number>, user: any) => {
            acc[user.status] = (acc[user.status] || 0) + 1;
            return acc;
          }, {}),
          byDepartment: enterprise.users.reduce((acc: Record<string, number>, user: any) => {
            acc[user.department] = (acc[user.department] || 0) + 1;
            return acc;
          }, {}),
          activeDevices: enterprise.users.reduce((total: number, user: any) => {
            return total + (user.devices?.length || 0);
          }, 0)
        },
        security: enterprise.metrics.security,
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json(
          { error: 'Enterprise not found' },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching enterprise metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 