import { Pool, type PoolClient } from "pg"

// Create a singleton pool instance
let pool: Pool | null = null

// Initialize the PostgreSQL connection pool
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL

    if (!connectionString) {
      throw new Error("POSTGRES_URL environment variable is not set")
    }

    pool = new Pool({
      connectionString,
      // You can also use individual connection parameters:
      // user: process.env.POSTGRES_USER,
      // password: process.env.POSTGRES_PASSWORD,
      // host: process.env.POSTGRES_HOST,
      // port: parseInt(process.env.POSTGRES_PORT || '5432'),
      // database: process.env.POSTGRES_DATABASE,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Log connection errors
    pool.on("error", (err) => {
      console.error("Unexpected error on idle PostgreSQL client", err)
      process.exit(-1)
    })
  }

  return pool
}

// Helper function to execute queries with error handling
export async function query<T>(text: string, params: any[] = []): Promise<T[]> {
  const pool = getPool()
  try {
    const result = await pool.query(text, params)
    return result.rows as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function to execute a transaction
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Transaction error:", error)
    throw error
  } finally {
    client.release()
  }
}

// Helper function to check if the database is connected
export async function checkConnection(): Promise<boolean> {
  try {
    const pool = getPool()
    const result = await pool.query("SELECT NOW()")
    return result.rowCount > 0
  } catch (error) {
    console.error("Database connection error:", error)
    return false
  }
}

// Helper function to check if tables exist
export async function checkTables(): Promise<Record<string, boolean>> {
  try {
    const tables = ["products", "orders", "order_items", "bake_sale_periods"]
    const tableStatus: Record<string, boolean> = {}

    for (const table of tables) {
      try {
        const result = await query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )`,
          [table],
        )
        tableStatus[table] = result[0]?.exists || false
      } catch (err) {
        tableStatus[table] = false
      }
    }

    return tableStatus
  } catch (error) {
    console.error("Error checking tables:", error)
    return {
      products: false,
      orders: false,
      order_items: false,
      bake_sale_periods: false,
    }
  }
}

// Close the pool (useful for tests and when shutting down)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
