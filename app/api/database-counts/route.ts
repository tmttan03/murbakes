import { NextResponse } from "next/server"
import { query } from "@/lib/postgres"

export async function GET() {
  try {
    // Get product count
    const productResult = await query<{ count: string }>("SELECT COUNT(*) as count FROM products")
    const productCount = Number.parseInt(productResult[0]?.count || "0")

    // Get order count
    const orderResult = await query<{ count: string }>("SELECT COUNT(*) as count FROM orders")
    const orderCount = Number.parseInt(orderResult[0]?.count || "0")

    return NextResponse.json({
      success: true,
      productCount,
      orderCount,
    })
  } catch (error) {
    console.error("Error getting database counts:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
