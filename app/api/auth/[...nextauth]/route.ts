import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcrypt"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { z } from "zod"
import prisma from "@/lib/prisma"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate the input
        const credentialsSchema = z.object({
          email: z.string().email(),
          password: z.string().min(6),
        })

        const parsedCredentials = credentialsSchema.safeParse(credentials)
        
        if (!parsedCredentials.success) {
          throw new Error("Invalid credentials")
        }
        
        const { email, password } = parsedCredentials.data
        
        // Find the user in the database
        const user = await prisma.user.findUnique({
          where: { email },
        })
        
        if (!user || !user.password) {
          throw new Error("User not found")
        }
        
        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password)
        
        if (!passwordMatch) {
          throw new Error("Invalid password")
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig

export const { auth, signIn, signOut } = NextAuth(authConfig)