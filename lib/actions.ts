"use server"

import { query, transaction, getDatabase } from "./sqlite"
import type { Product, Order, BakeSalePeriod } from "./data"

// Helper function to handle database errors
const handleDatabaseError = (error: any, operation: string) => {
  console.error(`Error ${operation}:`, error)

  // Check if it's a connection error or if we should fallback to local data
  if (
    error.message === "FALLBACK_TO_LOCAL_DATA" ||
    (error.message &&
      (error.message.includes("connection") ||
        error.message.includes("connect") ||
        error.message.includes("timeout") ||
        error.message.includes("database")))
  ) {
    // Signal to use local data
    throw new Error("FALLBACK_TO_LOCAL_DATA")
  }

  throw error
}

// Products actions
export async function getProducts(): Promise<Product[]> {
  try {
    const products = await query<any>(`
      SELECT * FROM products
      ORDER BY name
    `)

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      stock: Number(product.stock),
      initialStock: Number(product.initial_stock),
      image: product.image,
      isLimited: Boolean(product.is_limited),
    })) as Product[]
  } catch (error) {
    return handleDatabaseError(error, "getting products")
  }
}

export async function addProduct(product: Product): Promise<Product[]> {
  try {
    await query(
      `
      INSERT INTO products (
        id, name, category, price, stock, initial_stock, image, is_limited
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?
      )
    `,
      [
        product.id,
        product.name,
        product.category,
        product.price,
        product.stock,
        product.initialStock || product.stock,
        product.image,
        product.isLimited ? 1 : 0,
      ],
    )

    return getProducts()
  } catch (error) {
    return handleDatabaseError(error, "adding product")
  }
}

export async function updateProduct(updatedProduct: Product): Promise<Product[]> {
  try {
    await query(
      `
      UPDATE products
      SET 
        name = ?,
        category = ?,
        price = ?,
        stock = ?,
        initial_stock = ?,
        image = ?,
        is_limited = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        updatedProduct.name,
        updatedProduct.category,
        updatedProduct.price,
        updatedProduct.stock,
        updatedProduct.initialStock || updatedProduct.stock,
        updatedProduct.image,
        updatedProduct.isLimited ? 1 : 0,
        updatedProduct.id,
      ],
    )

    return getProducts()
  } catch (error) {
    return handleDatabaseError(error, "updating product")
  }
}

export async function updateProductStock(productId: string, newStock: number): Promise<Product[]> {
  try {
    await query(
      `
      UPDATE products
      SET 
        stock = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [newStock, productId],
    )

    return getProducts()
  } catch (error) {
    return handleDatabaseError(error, "updating product stock")
  }
}

export async function resetProductStock(productId: string): Promise<Product[]> {
  try {
    // First get the initial stock value
    const product = await query<{ initial_stock: number }>(
      `
      SELECT initial_stock
      FROM products
      WHERE id = ?
    `,
      [productId],
    )

    if (!product.length) {
      throw new Error("Product not found")
    }

    // Then update the stock to match initial stock
    await query(
      `
      UPDATE products
      SET 
        stock = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [product[0].initial_stock, productId],
    )

    return getProducts()
  } catch (error) {
    return handleDatabaseError(error, "resetting product stock")
  }
}

// Orders actions
export async function getOrders(): Promise<Order[]> {
  try {
    // Get all orders
    const orders = await query<any>(`
      SELECT *
      FROM orders
      ORDER BY created_at DESC
    `)

    // Get all order items
    const orderItems = await query<any>(`
      SELECT *
      FROM order_items
    `)

    // Map order items to their respective orders
    const ordersWithItems = orders.map((order) => {
      const items = orderItems
        .filter((item) => item.order_id === order.id)
        .map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.total),
          packed: Boolean(item.packed),
        }))

      return {
        id: order.id,
        customerName: order.customer_name,
        contactNumber: order.contact_number,
        isPickup: Boolean(order.is_pickup),
        deliveryAddress: order.delivery_address,
        deliveryTime: order.delivery_time,
        items,
        totalItems: order.total_items,
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        total: Number(order.total),
        createdAt: new Date(order.created_at),
        status: order.status,
        isPaid: Boolean(order.is_paid),
        isPacked: Boolean(order.is_packed),
        packingNotes: order.packing_notes || "",
        paymentMethod: order.payment_method,
        referenceNumber: order.reference_number,
        bakeSalePeriod: order.bake_sale_period_id,
        sourceImage: order.source_image,
      } as Order
    })

    return ordersWithItems
  } catch (error) {
    return handleDatabaseError(error, "getting orders")
  }
}

export async function addOrder(order: Order): Promise<Order[]> {
  try {
    return await transaction(async (db) => {
      // Insert the order
      await db.run(
        `
        INSERT INTO orders (
          id, customer_name, contact_number, is_pickup, delivery_address, delivery_time,
          total_items, subtotal, discount, total, created_at, status, is_paid,
          payment_method, reference_number, bake_sale_period_id, source_image,
          is_packed, packing_notes
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `,
        [
          order.id,
          order.customerName,
          order.contactNumber,
          order.isPickup ? 1 : 0,
          order.deliveryAddress || null,
          order.deliveryTime || null,
          order.totalItems,
          order.subtotal,
          order.discount,
          order.total,
          order.createdAt.toISOString(),
          order.status,
          order.isPaid ? 1 : 0,
          order.paymentMethod || null,
          order.referenceNumber || null,
          order.bakeSalePeriod || null,
          order.sourceImage || null,
          order.isPacked ? 1 : 0,
          order.packingNotes || null,
        ],
      )

      // Insert order items
      for (const item of order.items) {
        await db.run(
          `
          INSERT INTO order_items (
            order_id, product_id, quantity, price, total, packed
          ) VALUES (
            ?, ?, ?, ?, ?, ?
          )
        `,
          [order.id, item.productId, item.quantity, item.price, item.total, item.packed ? 1 : 0],
        )

        // Update product stock
        const productResult = await db.get(
          `
          SELECT stock FROM products WHERE id = ?
        `,
          [item.productId],
        )

        if (productResult) {
          const currentStock = productResult.stock
          const newStock = Math.max(0, currentStock - item.quantity)

          await db.run(
            `
            UPDATE products
            SET stock = ?
            WHERE id = ?
          `,
            [newStock, item.productId],
          )
        }
      }

      // Return all orders
      return getOrders()
    })
  } catch (error) {
    return handleDatabaseError(error, "adding order")
  }
}

export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<Order[]> {
  try {
    await query(
      `
      UPDATE orders
      SET status = ?
      WHERE id = ?
    `,
      [status, orderId],
    )

    return getOrders()
  } catch (error) {
    return handleDatabaseError(error, "updating order status")
  }
}

export async function updateOrderPayment(
  orderId: string,
  isPaid: boolean,
  paymentMethod?: string,
  referenceNumber?: string,
): Promise<Order[]> {
  try {
    await query(
      `
      UPDATE orders
      SET 
        is_paid = ?,
        payment_method = ?,
        reference_number = ?
      WHERE id = ?
    `,
      [isPaid ? 1 : 0, paymentMethod || null, referenceNumber || null, orderId],
    )

    return getOrders()
  } catch (error) {
    return handleDatabaseError(error, "updating order payment")
  }
}

export async function updateOrderPackingStatus(
  orderId: string,
  isPacked: boolean,
  packingNotes?: string,
): Promise<Order[]> {
  try {
    await query(
      `
      UPDATE orders
      SET 
        is_packed = ?,
        packing_notes = ?
      WHERE id = ?
    `,
      [isPacked ? 1 : 0, packingNotes || null, orderId],
    )

    return getOrders()
  } catch (error) {
    return handleDatabaseError(error, "updating order packing status")
  }
}

export async function updateOrderItemPackingStatus(
  orderId: string,
  productId: string,
  packed: boolean,
): Promise<Order[]> {
  try {
    return await transaction(async (db) => {
      // Update the item's packed status
      await db.run(
        `
        UPDATE order_items
        SET packed = ?
        WHERE order_id = ? AND product_id = ?
      `,
        [packed ? 1 : 0, orderId, productId],
      )

      // Check if all items are packed
      const result = await db.get(
        `
        SELECT COUNT(*) as total, SUM(CASE WHEN packed = 1 THEN 1 ELSE 0 END) as packed
        FROM order_items
        WHERE order_id = ?
      `,
        [orderId],
      )

      // Update the order's packed status if all items are packed
      if (result && result.total === result.packed) {
        await db.run(
          `
          UPDATE orders
          SET is_packed = 1
          WHERE id = ?
        `,
          [orderId],
        )
      } else {
        await db.run(
          `
          UPDATE orders
          SET is_packed = 0
          WHERE id = ?
        `,
          [orderId],
        )
      }

      return getOrders()
    })
  } catch (error) {
    return handleDatabaseError(error, "updating order item packing status")
  }
}

// Bake Sale Period actions
export async function getBakeSalePeriods(): Promise<BakeSalePeriod[]> {
  try {
    const periods = await query<any>(`
      SELECT *
      FROM bake_sale_periods
      ORDER BY start_date
    `)

    return periods.map((period) => ({
      id: period.id,
      name: period.name,
      startDate: new Date(period.start_date),
      endDate: new Date(period.end_date),
      isActive: Boolean(period.is_active),
    })) as BakeSalePeriod[]
  } catch (error) {
    return handleDatabaseError(error, "getting bake sale periods")
  }
}

export async function addBakeSalePeriod(period: BakeSalePeriod): Promise<BakeSalePeriod[]> {
  try {
    return await transaction(async (db) => {
      // If this period is active, deactivate all other periods
      if (period.isActive) {
        await db.run(
          `
          UPDATE bake_sale_periods
          SET is_active = 0
          WHERE id != ?
        `,
          [period.id],
        )
      }

      // Insert the new period
      await db.run(
        `
        INSERT INTO bake_sale_periods (
          id, name, start_date, end_date, is_active
        ) VALUES (
          ?, ?, ?, ?, ?
        )
      `,
        [period.id, period.name, period.startDate.toISOString(), period.endDate.toISOString(), period.isActive ? 1 : 0],
      )

      return getBakeSalePeriods()
    })
  } catch (error) {
    return handleDatabaseError(error, "adding bake sale period")
  }
}

export async function updateBakeSalePeriod(updatedPeriod: BakeSalePeriod): Promise<BakeSalePeriod[]> {
  try {
    return await transaction(async (db) => {
      // If this period is active, deactivate all other periods
      if (updatedPeriod.isActive) {
        await db.run(
          `
          UPDATE bake_sale_periods
          SET is_active = 0
          WHERE id != ?
        `,
          [updatedPeriod.id],
        )
      }

      // Update the period
      await db.run(
        `
        UPDATE bake_sale_periods
        SET 
          name = ?,
          start_date = ?,
          end_date = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [
          updatedPeriod.name,
          updatedPeriod.startDate.toISOString(),
          updatedPeriod.endDate.toISOString(),
          updatedPeriod.isActive ? 1 : 0,
          updatedPeriod.id,
        ],
      )

      return getBakeSalePeriods()
    })
  } catch (error) {
    return handleDatabaseError(error, "updating bake sale period")
  }
}

// Initialize the database
export async function initializeDatabase() {
  try {
    const db = await getDatabase()

    // Create tables if they don't exist
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
      );

      CREATE TABLE IF NOT EXISTS bake_sale_periods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        is_active INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

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
      );

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
      );

      CREATE INDEX IF NOT EXISTS idx_orders_bake_sale_period ON orders(bake_sale_period_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
    `)

    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}
