import NextAuth from "next-auth"
import type { Session, DefaultSession, NextAuthConfig } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcrypt"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { AdapterUser } from "@auth/core/adapters"
import { Account } from "@auth/core/types"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

type User = {
  id: string
  name: string | null
  email: string
  image: string | null
}

export const authOptions = {
  adapter: PrismaAdapter(prisma) as any,
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
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }