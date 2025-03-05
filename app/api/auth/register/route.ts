import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { z } from "zod"
import prisma from "@/lib/prisma"

// Input validation schema
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(req: NextRequest) {
  try {
    // Get and validate request body
    const body = await req.json()
    const result = userSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.format() },
        { status: 400 }
      )
    }
    
    const { name, email, password } = result.data
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user in the database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })
    
    // Return success but don't expose the password
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 