import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getToken } from 'next-auth/jwt';
import { Enterprise } from '@/lib/data/domain-types';
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

    // Read enterprise data
    const enterprisePath = path.join(
      process.cwd(),
      'lib/data/seed-data/enterprises',
      id,
      'enterprise.json'
    );

    try {
      const data = await fs.readFile(enterprisePath, 'utf-8');
      const enterprise = JSON.parse(data) as Enterprise;
      return NextResponse.json(enterprise);
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
    console.error('Error fetching enterprise data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 