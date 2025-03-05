import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider`
   */
  interface Session {
    user: {
      /** The user's unique identifier */
      id: string
    } & DefaultSession["user"]
  }
  
  interface User {
    /** The user's unique identifier */
    id: string
    name?: string
    email?: string
    image?: string
  }
} 