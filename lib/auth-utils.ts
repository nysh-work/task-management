import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { headers, cookies } from "next/headers";

// Try to get the user ID from the session, with fallback for development
export async function getUserIdFromSession() {
  try {
    // For development, return a default user ID
    if (process.env.NODE_ENV !== 'production') {
      return process.env.DEFAULT_USER_ID || '1';
    }
    
    // During prerendering on Vercel, just return null to prevent errors
    if (typeof window === 'undefined' && process.env.VERCEL) {
      return null;
    }
    
    try {
      // Safer approach that doesn't rely on specific NextAuth imports
      // This should work with both v4 and v5
      const response = await fetch('/api/auth/session');
      
      if (response.ok) {
        const session = await response.json();
        return session?.user?.id;
      }
    } catch (error) {
      console.warn("Failed to fetch session via API", error);
      // Continue to fallback methods
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}

// For API routes and server-side code
export async function getUserIdFromSessionServer() {
  try {
    // For development, return a default user ID
    if (process.env.NODE_ENV !== 'production') {
      return process.env.DEFAULT_USER_ID || '1';
    }
    
    // Create a basic session endpoint handler for server components
    const cookieStore = cookies();
    const headersList = headers();
    
    // Use fetch with the session cookie to hit our own session endpoint
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/session`, {
      headers: {
        cookie: cookieStore.toString(),
        ...Object.fromEntries(headersList.entries())
      }
    });
    
    if (response.ok) {
      const session = await response.json();
      return session?.user?.id;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user ID from server:", error);
    return null;
  }
} 