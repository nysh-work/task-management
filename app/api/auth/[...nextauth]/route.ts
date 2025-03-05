import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcrypt"
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { z } from "zod"
import prisma from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
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
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
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
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 