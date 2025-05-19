import { NextResponse } from "next/server"
import { checkConnection } from "@/lib/postgres"

export async function GET() {
  try {
    const isConnected = await checkConnection()

    if (isConnected) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({
        success: false,
        error: "Failed to connect to PostgreSQL database",
      })
    }
  } catch (error) {
    console.error("Error checking PostgreSQL connection:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
