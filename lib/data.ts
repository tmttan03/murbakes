export type Product = {
  id: string
  name: string
  category: "nut" | "oat" | "new"
  price: number
  stock: number
  image: string
  isLimited?: boolean
  initialStock?: number
}

export type OrderItem = {
  productId: string
  quantity: number
  price: number
  total: number
  packed?: boolean
}

export type PaymentMethod = "GCash" | "BDO" | "UnionBank" | "Cash" | "Other" | undefined

export type Order = {
  id: string
  customerName: string
  contactNumber: string
  isPickup: boolean
  deliveryAddress?: string
  deliveryTime?: string
  items: OrderItem[]
  totalItems: number
  subtotal: number
  discount: number
  total: number
  createdAt: Date
  status: "pending" | "completed" | "cancelled"
  isPaid?: boolean
  paymentMethod?: PaymentMethod
  referenceNumber?: string
  bakeSalePeriod?: string
  sourceImage?: string
  isPacked?: boolean
  packingNotes?: string
}

export type BakeSalePeriod = {
  id: string
  name: string
  startDate: Date
  endDate: Date
  isActive: boolean
}

// Add the BakeSale type if it doesn't exist already:

// Add this type definition if it doesn't exist:
export interface BakeSale {
  id: string
  name: string
  startDate: Date
  endDate: Date
  description?: string
  isActive?: boolean
}

// Change the export statements to be mutable
// This allows us to modify the data during runtime
export const products: Product[] = [
  {
    id: "og-walnut",
    name: "OG Walnut",
    category: "nut",
    price: 50,
    stock: 40,
    initialStock: 40,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "pecan-pie",
    name: "Pecan Pie",
    category: "nut",
    price: 60,
    stock: 40,
    initialStock: 40,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "coco-chia",
    name: "Coco Chia",
    category: "oat",
    price: 45,
    stock: 40,
    initialStock: 40,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "pb-choco",
    name: "PB Choco",
    category: "oat",
    price: 50,
    stock: 40,
    initialStock: 40,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "miso-cc",
    name: "Miso CC",
    category: "new",
    price: 45,
    stock: 40,
    initialStock: 40,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "rye-cc",
    name: "Rye CC",
    category: "new",
    price: 40,
    stock: 10,
    initialStock: 10,
    image: "/placeholder.svg?height=100&width=100",
    isLimited: true,
  },
]

export const sampleOrders: Order[] = []

export const bakeSalePeriods: BakeSalePeriod[] = []

// Add an empty array for initial bake sales if it doesn't exist:
export const bakeSales: BakeSale[] = []