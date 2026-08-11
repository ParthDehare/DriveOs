import { markOverduePayments } from "@/services/payments";
import { NextResponse } from "next/server";

export async function GET(request) {
  const cronKey = request.headers.get('x-cron-key');
  const secret = process.env.CRON_SECRET;

  if (secret && cronKey !== secret) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const count = await markOverduePayments();
    return NextResponse.json({ message: 'Overdue payments marked successfully', count });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
