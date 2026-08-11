import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const payment = await Payment.findOne({
      _id: params.id,
      schoolId: auth.session.user.schoolId
    }).populate({
      path: 'enrollmentId',
      populate: { path: 'studentId', select: 'name email' }
    });

    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const updateData = {};
    
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.method !== undefined) updateData.method = body.method;
    
    // Auto-set paidAt if status is changing to paid and not already paid
    if (body.status === 'paid' && updateData.paidAt === undefined) {
       updateData.paidAt = new Date();
    }

    const payment = await Payment.findOneAndUpdate(
      { _id: params.id, schoolId: auth.session.user.schoolId },
      updateData,
      { new: true }
    );

    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
