import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// For TypeScript, create our own declaration to suppress errors
declare module "next-auth" {
  function auth(): Promise<{ user?: { id?: string, name?: string, email?: string, image?: string } } | null>;
}

// Try to get the user ID from the session, with fallback for development
export async function getUserIdFromSession() {
  try {
    // For development, return a default user ID
    if (process.env.NODE_ENV !== 'production') {
      return process.env.DEFAULT_USER_ID || '1';
    }
    
    let session;
    
    try {
      // NextAuth v5 approach - use dynamic import to avoid static type checking
      const nextAuth = await import("next-auth");
      session = await (nextAuth as any).auth();
    } catch (e) {
      console.warn("NextAuth auth() failed, trying fallback method");
      try {
        // Fallback for NextAuth v4
        const nextAuth = await import("next-auth");
        const getServerSession = (nextAuth as any).getServerSession;
        if (typeof getServerSession === 'function') {
          session = await getServerSession(authOptions);
        }
      } catch (e2) {
        console.error("All NextAuth session methods failed", e2);
      }
    }
    
    return session?.user?.id;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
} 