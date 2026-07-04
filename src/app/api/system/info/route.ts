import { NextResponse } from 'next/server';
import { getSystemInfo } from '@/lib/systemMetrics';

export async function GET() {
  try {
    const info = await getSystemInfo();
    return NextResponse.json(info);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
