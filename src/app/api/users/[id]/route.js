import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { requireRole, getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await connectDB();
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== 'admin' && session.user.id !== params.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const user = await User.findById(params.id).select('-password');
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json(user);
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
    const user = await User.findByIdAndUpdate(params.id, body, { new: true }).select('-password');
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const user = await User.findByIdAndUpdate(params.id, { isActive: false }, { new: true }).select('-password');
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ message: "User deactivated successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
