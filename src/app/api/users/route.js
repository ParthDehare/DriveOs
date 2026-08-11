import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(request) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');

  const query = {};
  if (role) query.role = role;

  try {
    const users = await User.find(query).select('-password');
    return NextResponse.json(users);
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
    const { name, email, phone, password, role, schoolId, avatar } = body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      schoolId,
      avatar,
      isActive: true
    });

    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
