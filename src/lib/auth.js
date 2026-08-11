import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getServerSession as getNextAuthServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "./supabase";

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
        
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', inputEmail)
          .eq('is_active', true)
          .single();
          
        if (error || !user) {
          throw new Error("No user found with the email");
        }
        
        const isPasswordMatch = await bcrypt.compare(inputPassword, user.password);
        
        if (!isPasswordMatch) {
          throw new Error("Invalid password");
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          schoolId: user.school_id
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
