import { NextResponse } from 'next/server';
import { getMetricsHistory } from '@/lib/systemMetrics';

export async function GET() {
  const history = getMetricsHistory();
  return NextResponse.json(history);
}
