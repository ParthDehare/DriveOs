import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getServerSession as getNextAuthServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const inputEmail = (credentials?.email || '').trim();
        const inputPassword = (credentials?.password || '').trim();
        console.log(`authorize() called with: '${inputEmail}', password length: ${inputPassword.length}`);
        
        await connectDB();
        
        const user = await User.findOne({ email: inputEmail, isActive: true });
        console.log("User found:", user ? user.email : "none");
        
        if (!user) {
          throw new Error("No user found with the email");
        }
        
        const isPasswordMatch = await bcrypt.compare(inputPassword, user.password);
        console.log("Password match:", isPasswordMatch);
        
        if (!isPasswordMatch) {
          throw new Error("Invalid password");
        }
        
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          schoolId: user.schoolId ? user.schoolId.toString() : null
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.schoolId = user.schoolId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.schoolId = token.schoolId;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret",
};

export function getServerSession() {
  return getNextAuthServerSession(authOptions);
}

export async function requireRole(roles) {
  const session = await getServerSession();
  
  if (!session || !session.user) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  
  if (roles && !roles.includes(session.user.role)) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  
  return { session };
}
