import sqlite3 from "sqlite3"
import { open, type Database } from "sqlite"
import path from "path"

let db: Database | null = null

// Initialize the SQLite database connection
export async function getDatabase(): Promise<Database> {
  if (!db) {
    // Determine the database path - in production, use a persistent path
    // const dbPath = process.env.NODE_ENV === "production" ? path.join(process.cwd(), "murbakes.db") : ":memory:" // Use in-memory database for development
    const dbPath = "db.sqlite3"

    // Open the database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON")
  }

  return db
}

// Helper function to execute queries with error handling
export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    const db = await getDatabase()
    return await db.all(sql, ...params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function to execute a single query and get the first result
export async function queryOne<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  try {
    const db = await getDatabase()
    return await db.get(sql, ...params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function to execute a transaction
export async function transaction<T>(callback: (db: Database) => Promise<T>): Promise<T> {
  const db = await getDatabase()

  try {
    await db.exec("BEGIN TRANSACTION")
    const result = await callback(db)
    await db.exec("COMMIT")
    return result
  } catch (error) {
    await db.exec("ROLLBACK")
    console.error("Transaction error:", error)
    throw error
  }
}

// Helper function to check if the database is connected
export async function checkConnection(): Promise<boolean> {
  try {
    const db = await getDatabase()
    const result = await db.get("SELECT 1 as connected")
    return !!result
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
    const db = await getDatabase()

    for (const table of tables) {
      try {
        const result = await db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, table)
        tableStatus[table] = !!result
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

// Close the database connection (useful for tests and when shutting down)
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close()
    db = null
  }
}

// Initialize the database schema
export async function initializeDatabase(): Promise<void> {
  const db = await getDatabase()

  await transaction(async (db) => {
    // Create products table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        initial_stock INTEGER NOT NULL,
        image TEXT NOT NULL,
        is_limited INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create bake_sale_periods table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bake_sale_periods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        is_active INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create orders table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        contact_number TEXT NOT NULL,
        is_pickup INTEGER NOT NULL,
        delivery_address TEXT,
        delivery_time TEXT,
        total_items INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL NOT NULL,
        total REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL,
        is_paid INTEGER DEFAULT 0,
        payment_method TEXT,
        reference_number TEXT,
        bake_sale_period_id TEXT,
        source_image TEXT,
        is_packed INTEGER DEFAULT 0,
        packing_notes TEXT,
        FOREIGN KEY (bake_sale_period_id) REFERENCES bake_sale_periods(id)
      )
    `)

    // Create order_items table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        total REAL NOT NULL,
        packed INTEGER DEFAULT 0,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `)

    // Create indexes for better performance
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_bake_sale_period ON orders(bake_sale_period_id)`)
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`)
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)`)
  })
}
