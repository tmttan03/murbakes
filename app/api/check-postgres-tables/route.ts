import { NextResponse } from "next/server"
import { checkTables } from "@/lib/postgres"

export async function GET() {
  try {
    const tableStatus = await checkTables()

    return NextResponse.json({
      success: true,
      tables: tableStatus,
    })
  } catch (error) {
    console.error("Error checking PostgreSQL tables:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
