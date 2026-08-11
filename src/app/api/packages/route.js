import connectDB from "@/lib/mongodb";
import Package from "@/models/Package";
import InstallmentPlan from "@/models/InstallmentPlan";
import { requireRole, getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request) {
  await connectDB();
  const session = await getServerSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const packages = await Package.find({ schoolId: session.user.schoolId, isActive: true });
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = await request.json();
    const { installments, ...packageData } = body;

    const newPackage = new Package({ ...packageData, schoolId: auth.session.user.schoolId });
    await newPackage.save({ session });

    if (installments && Array.isArray(installments)) {
      const installmentDocs = installments.map((inst, index) => ({
        packageId: newPackage._id,
        trancheNumber: index + 1,
        percentageOfTotal: inst.percentageOfTotal,
        dueDaysAfterEnrollment: inst.dueDaysAfterEnrollment
      }));
      await InstallmentPlan.insertMany(installmentDocs, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
