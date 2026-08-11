import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import { recordManualPayment, markOverduePayments } from "@/services/payments";

export async function GET(request) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const enrollmentId = searchParams.get('enrollmentId');

  const query = { schoolId: auth.session.user.schoolId };
  if (status) query.status = status;
  if (enrollmentId) query.enrollmentId = enrollmentId;

  try {
    const payments = await Payment.find(query)
      .populate({
        path: 'enrollmentId',
        populate: { path: 'studentId', select: 'name email' }
      })
      .sort({ dueDate: -1 });

    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();

    if (body.action === 'record_payment') {
      const payment = await recordManualPayment(body.paymentId, body.method, body.transactionId);
      return NextResponse.json(payment);
    } else if (body.action === 'mark_overdue') {
      const count = await markOverduePayments();
      return NextResponse.json({ message: 'Overdue payments marked', count });
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
