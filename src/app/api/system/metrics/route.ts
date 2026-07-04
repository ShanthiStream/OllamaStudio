import { NextResponse } from 'next/server';
import { getSystemMetrics } from '@/lib/systemMetrics';

export async function GET() {
  try {
    const metrics = await getSystemMetrics();
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
