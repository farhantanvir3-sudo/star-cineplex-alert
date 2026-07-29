import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const alerts = await prisma.alertRequest.findMany({
      where: {
        isFulfilled: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { targetDate } = await request.json();

    if (!targetDate) {
      return NextResponse.json({ error: 'Target date is required' }, { status: 400 });
    }

    const newAlert = await prisma.alertRequest.create({
      data: {
        targetDate,
      },
    });

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}
