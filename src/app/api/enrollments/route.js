import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import Package from "@/models/Package";
import InstallmentPlan from "@/models/InstallmentPlan";
import Payment from "@/models/Payment";
import { requireRole, getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request) {
  await connectDB();
  const session = await getServerSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    let query = {};
    if (session.user.role === 'student') {
      query.studentId = session.user.id;
    } else if (session.user.role === 'admin') {
      query.schoolId = session.user.schoolId;
    } else {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const enrollments = await Enrollment.find(query).populate('studentId packageId');
    return NextResponse.json(enrollments);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const body = await request.json();
    const { studentId, packageId, startDate } = body;
    const schoolId = auth.session.user.schoolId;

    const pkg = await Package.findById(packageId);
    if (!pkg) throw new Error("Package not found");

    const enrollment = new Enrollment({
      studentId,
      packageId,
      schoolId,
      startDate: startDate || new Date()
    });

    await enrollment.save({ session: dbSession });

    const installments = await InstallmentPlan.find({ packageId }).session(dbSession);

    if (installments.length > 0) {
      const paymentDocs = installments.map(inst => {
        const dueDate = new Date(enrollment.startDate);
        dueDate.setDate(dueDate.getDate() + inst.dueDaysAfterEnrollment);

        return {
          enrollmentId: enrollment._id,
          schoolId,
          amount: (pkg.price * inst.percentageOfTotal) / 100,
          dueDate,
          status: 'pending',
          trancheNumber: inst.trancheNumber
        };
      });

      await Payment.insertMany(paymentDocs, { session: dbSession });
    } else {
      // Full payment upfront
      const payment = new Payment({
        enrollmentId: enrollment._id,
        schoolId,
        amount: pkg.price,
        dueDate: enrollment.startDate,
        status: 'pending',
        trancheNumber: 1
      });
      await payment.save({ session: dbSession });
    }

    await dbSession.commitTransaction();
    dbSession.endSession();

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
