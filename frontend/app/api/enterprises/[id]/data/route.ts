import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getToken } from 'next-auth/jwt';
import { PaginatedResponse } from '@/lib/data/domain-types';

const PAGE_SIZE = 500; // Simulate cloud throttling

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const type = searchParams.get('type') || 'devices'; // devices, policies, towers, users

    // Validate type parameter
    if (!['devices', 'policies', 'towers', 'users'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid data type' },
        { status: 400 }
      );
    }

    // Read enterprise-specific data
    let items: any[] = [];
    if (type === 'users') {
      // Read users from enterprise.json
      const enterprisePath = path.join(
        process.cwd(),
        'lib/data/seed-data/enterprises',
        id,
        'enterprise.json'
      );
      try {
        const data = await fs.readFile(enterprisePath, 'utf-8');
        const enterprise = JSON.parse(data);
        items = enterprise.users || [];
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          return NextResponse.json(
            { error: 'Enterprise data not found' },
            { status: 404 }
          );
        }
        throw error;
      }
    } else {
      // Read from the respective file
      const dataPath = path.join(
        process.cwd(),
        'lib/data/seed-data/enterprises',
        id,
        `${type}.json`
      );
      try {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 100));
        const data = await fs.readFile(dataPath, 'utf-8');
        items = JSON.parse(data);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          return NextResponse.json(
            { error: 'Enterprise data not found' },
            { status: 404 }
          );
        }
        throw error;
      }
    }

    // Calculate pagination
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const paginatedData = items.slice(start, end);

    const response: PaginatedResponse<any> = {
      data: paginatedData,
      total: items.length,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(items.length / PAGE_SIZE),
      hasMore: end < items.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching enterprise data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 