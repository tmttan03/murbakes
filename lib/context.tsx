"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  loadOrders,
  saveOrders,
  loadProducts,
  saveProducts,
  loadBakeSales,
  saveBakeSales,
  saveBakeSalePeriods,
} from "./storage"
import type { Order, Product, BakeSale, BakeSalePeriod } from "./data"
import { useToast } from "@/hooks/use-toast"
import { bakeSalePeriods as initialBakeSalePeriods } from "./data"
import type { PaymentMethod } from "./data"

interface StoreContextType {
  orders: Order[]
  products: Product[]
  bakeSales: BakeSale[]
  bakeSalePeriods: BakeSalePeriod[]
  activeBakeSalePeriod: BakeSalePeriod | null
  loading: boolean
  isUsingFallbackData: boolean
  refreshData: () => Promise<void>
  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: string, status: "pending" | "completed" | "cancelled") => void
  updateOrderPayment: (orderId: string, isPaid: boolean, paymentMethod?: string, referenceNumber?: string) => void
  updateOrderPackingStatus: (orderId: string, isPacked: boolean, packingNotes?: string) => void
  updateOrderPackingNotes: (orderId: string, notes: string) => void
  updateOrderItemPackingStatus: (orderId: string, productId: string, packed: boolean) => void
  addProduct: (product: Product) => void
  updateProduct: (productId: string, product: Partial<Product>) => void
  deleteProduct: (productId: string) => void
  addBakeSale: (bakeSale: BakeSale) => void
  updateBakeSale: (bakeSaleId: string, bakeSale: Partial<BakeSale>) => void
  deleteBakeSale: (bakeSaleId: string) => void
  updateProductStock: (productId: string, newStock: number) => void
  resetProductStock: (productId: string) => void
  addBakeSalePeriod: (period: BakeSalePeriod) => void
  updateBakeSalePeriod: (period: BakeSalePeriod) => void
  setActiveBakeSalePeriod: (periodId: string) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [bakeSales, setBakeSales] = useState<BakeSale[]>([])
  const [bakeSalePeriods, setBakeSalePeriods] = useState<BakeSalePeriod[]>([])
  const [activeBakeSalePeriod, setActiveBakeSalePeriod] = useState<BakeSalePeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false)
  const { toast } = useToast()

  // Load data from storage
  const refreshData = async () => {
    try {
      setLoading(true)
      const loadedOrders = await loadOrders()
      const loadedProducts = await loadProducts()
      const loadedBakeSales = await loadBakeSales()

      // Ensure all orders have packing status fields
      const updatedOrders = loadedOrders.map((order) => ({
        ...order,
        isPacked: order.isPacked || false,
        packingNotes: order.packingNotes || "",
      }))

      setOrders(updatedOrders)
      setProducts(loadedProducts)
      setBakeSales(loadedBakeSales)

      // Set bake sale periods
      setBakeSalePeriods(loadedBakeSales)

      // Set active bake sale period
      const activePeriod = loadedBakeSales.find((p) => p.isActive)
      setActiveBakeSalePeriod(activePeriod || null)

      setIsUsingFallbackData(false)
    } catch (error) {
      console.error("Error loading data:", error)
      setIsUsingFallbackData(true)
      toast({
        title: "Error loading data",
        description: "There was a problem loading your data. Using fallback data instead.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  const addOrder = async (order: Order) => {
    try {
      // Update product stock based on order items
      const updatedProducts = [...products]

      for (const item of order.items) {
        const productIndex = updatedProducts.findIndex((p) => p.id === item.productId)
        if (productIndex !== -1) {
          // Ensure we don't go below 0 stock
          const newStock = Math.max(0, updatedProducts[productIndex].stock - item.quantity)
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            stock: newStock,
          }
        }
      }

      // Save updated products
      setProducts(updatedProducts)
      await saveProducts(updatedProducts)

      // Save the new order
      const newOrders = [...orders, order]
      setOrders(newOrders)
      await saveOrders(newOrders)

      toast({
        title: "Order added",
        description: `Order #${order.id} has been added successfully.`,
      })
    } catch (error) {
      console.error("Error adding order:", error)
      toast({
        title: "Error adding order",
        description: "There was a problem adding the order.",
        variant: "destructive",
      })
    }
  }

  const updateOrder = async (updatedOrder: Order) => {
    try {
      const updatedOrders = orders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
      setOrders(updatedOrders)
      await saveOrders(updatedOrders)
  
      toast({
        title: "Order updated",
        description: `Order #${updatedOrder.id} has been updated successfully.`,
      })
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error updating order",
        description: "There was a problem updating the order.",
        variant: "destructive",
      })
    }
  }



  const updateOrderStatus = async (
    orderId: string,
    status: "pending" | "completed" | "cancelled"
  ) => {
    try {
      console.log("Updating status of", orderId, "to", status)
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
      setOrders(updatedOrders)
      await saveOrders(updatedOrders)
      toast({
        title: "Order status updated",
        description: `Order #${orderId} has been marked as ${status}.`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error updating order",
        description: "There was a problem updating the order status.",
        variant: "destructive",
      })
    }
  }
  

  const updateOrderPayment = async (
    orderId: string,
    isPaid: boolean,
    paymentMethod?: string,
    referenceNumber?: string,
  ) => {
    try {
      const updatedOrders = orders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            isPaid,
            paymentMethod: (paymentMethod as PaymentMethod) || order.paymentMethod,
            referenceNumber: referenceNumber || order.referenceNumber,
          }
        }
        return order
      })
      setOrders(updatedOrders)
      await saveOrders(updatedOrders)
      toast({
        title: isPaid ? "Payment recorded" : "Payment status updated",
        description: isPaid
          ? `Order #${orderId} has been marked as paid${paymentMethod ? ` via ${paymentMethod}` : ""}.`
          : `Order #${orderId} has been marked as unpaid.`,
      })
    } catch (error) {
      console.error("Error updating order payment:", error)
      toast({
        title: "Error updating payment",
        description: "There was a problem updating the payment status.",
        variant: "destructive",
      })
    }
  }

  const updateOrderPackingStatus = async (orderId: string, isPacked: boolean, packingNotes?: string) => {
    try {
      const updatedOrders = orders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            isPacked,
            packingNotes: packingNotes !== undefined ? packingNotes : order.packingNotes,
          }
        }
        return order
      })
      setOrders(updatedOrders)
      await saveOrders(updatedOrders)
      toast({
        title: "Packing status updated",
        description: `Order #${orderId} has been marked as ${isPacked ? "packed" : "not packed"}.`,
      })
    } catch (error) {
      console.error("Error updating order packing status:", error)
      toast({
        title: "Error updating packing status",
        description: "There was a problem updating the packing status.",
        variant: "destructive",
      })
    }
  }

  const updateOrderPackingNotes = async (orderId: string, packingNotes: string) => {
    try {
      const updatedOrders = orders.map((order) => {
        if (order.id === orderId) {
          return { ...order, packingNotes }
        }
        return order
      })
      setOrders(updatedOrders)
      await saveOrders(updatedOrders)
      toast({
        title: "Packing notes updated",
        description: `Packing notes for order #${orderId} have been updated.`,
      })
    } catch (error) {
      console.error("Error updating order packing notes:", error)
      toast({
        title: "Error updating packing notes",
        description: "There was a problem updating the packing notes.",
        variant: "destructive",
      })
    }
  }

  const updateOrderItemPackingStatus = async (orderId: string, productId: string, packed: boolean) => {
    try {
      const updatedOrders = [...orders]
      const orderIndex = updatedOrders.findIndex((o) => o.id === orderId)

      if (orderIndex !== -1) {
        const order = updatedOrders[orderIndex]
        const itemIndex = order.items.findIndex((item) => item.productId === productId)

        if (itemIndex !== -1) {
          // Update the item's packed status
          updatedOrders[orderIndex] = {
            ...order,
            items: order.items.map((item, idx) => (idx === itemIndex ? { ...item, packed } : item)),
          }

          // Check if all items are packed
          const allPacked = updatedOrders[orderIndex].items.every((item) => item.packed === true)
          updatedOrders[orderIndex].isPacked = allPacked

          setOrders(updatedOrders)
          await saveOrders(updatedOrders)

          toast({
            title: "Item packing status updated",
            description: `Item has been marked as ${packed ? "packed" : "not packed"}.`,
          })
        }
      }
    } catch (error) {
      console.error("Error updating item packing status:", error)
      toast({
        title: "Error updating item status",
        description: "There was a problem updating the item packing status.",
        variant: "destructive",
      })
    }
  }

  const addProduct = async (product: Product) => {
    try {
      const newProducts = [...products, product]
      setProducts(newProducts)
      await saveProducts(newProducts)
      toast({
        title: "Product added",
        description: `${product.name} has been added successfully.`,
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error adding product",
        description: "There was a problem adding the product.",
        variant: "destructive",
      })
    }
  }

  const updateProduct = async (productId: string, product: Partial<Product>) => {
    try {
      const updatedProducts = products.map((p) => {
        if (p.id === productId) {
          return { ...p, ...product }
        }
        return p
      })
      setProducts(updatedProducts)
      await saveProducts(updatedProducts)
      toast({
        title: "Product updated",
        description: `Product has been updated successfully.`,
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error updating product",
        description: "There was a problem updating the product.",
        variant: "destructive",
      })
    }
  }

  const deleteProduct = async (productId: string) => {
    try {
      const updatedProducts = products.filter((p) => p.id !== productId)
      setProducts(updatedProducts)
      await saveProducts(updatedProducts)
      toast({
        title: "Product deleted",
        description: `Product has been deleted successfully.`,
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error deleting product",
        description: "There was a problem deleting the product.",
        variant: "destructive",
      })
    }
  }

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const updatedProducts = products.map((p) => {
        if (p.id === productId) {
          return { ...p, stock: newStock }
        }
        return p
      })
      setProducts(updatedProducts)
      await saveProducts(updatedProducts)
      const product = products.find((p) => p.id === productId)
      toast({
        title: "Stock updated",
        description: `${product?.name || "Product"} stock has been updated to ${newStock}.`,
      })
    } catch (error) {
      console.error("Error updating product stock:", error)
      toast({
        title: "Error updating stock",
        description: "There was a problem updating the product stock.",
        variant: "destructive",
      })
    }
  }

  const resetProductStock = async (productId: string) => {
    try {
      const product = products.find((p) => p.id === productId)
      if (product) {
        const initialStock = product.initialStock || product.stock
        const updatedProducts = products.map((p) => {
          if (p.id === productId) {
            return { ...p, stock: initialStock }
          }
          return p
        })
        setProducts(updatedProducts)
        await saveProducts(updatedProducts)
        toast({
          title: "Stock reset",
          description: `${product.name} stock has been reset to initial value.`,
        })
      }
    } catch (error) {
      console.error("Error resetting product stock:", error)
      toast({
        title: "Error resetting stock",
        description: "There was a problem resetting the product stock.",
        variant: "destructive",
      })
    }
  }

  const addBakeSale = async (bakeSale: BakeSale) => {
    try {
      const newBakeSales = [...bakeSales, bakeSale]
      setBakeSales(newBakeSales)
      await saveBakeSales(newBakeSales)
      toast({
        title: "Bake sale added",
        description: `${bakeSale.name} has been added successfully.`,
      })
    } catch (error) {
      console.error("Error adding bake sale:", error)
      toast({
        title: "Error adding bake sale",
        description: "There was a problem adding the bake sale.",
        variant: "destructive",
      })
    }
  }

  const updateBakeSale = async (bakeSaleId: string, bakeSale: Partial<BakeSale>) => {
    try {
      const updatedBakeSales = bakeSales.map((bs) => {
        if (bs.id === bakeSaleId) {
          return { ...bs, ...bakeSale }
        }
        return bs
      })
      setBakeSales(updatedBakeSales)
      await saveBakeSales(updatedBakeSales)
      toast({
        title: "Bake sale updated",
        description: `Bake sale has been updated successfully.`,
      })
    } catch (error) {
      console.error("Error updating bake sale:", error)
      toast({
        title: "Error updating bake sale",
        description: "There was a problem updating the bake sale.",
        variant: "destructive",
      })
    }
  }

  const deleteBakeSale = async (bakeSaleId: string) => {
    try {
      const updatedBakeSales = bakeSales.filter((bs) => bs.id !== bakeSaleId)
      setBakeSales(updatedBakeSales)
      await saveBakeSales(updatedBakeSales)
      toast({
        title: "Bake sale deleted",
        description: `Bake sale has been deleted successfully.`,
      })
    } catch (error) {
      console.error("Error deleting bake sale:", error)
      toast({
        title: "Error deleting bake sale",
        description: "There was a problem deleting the bake sale.",
        variant: "destructive",
      })
    }
  }

  const addBakeSalePeriod = async (period: BakeSalePeriod) => {
    try {
      // If this period is active, deactivate all others
      let updatedPeriods = [...bakeSalePeriods]
      if (period.isActive) {
        updatedPeriods = updatedPeriods.map((p) => ({ ...p, isActive: false }))
      }
      updatedPeriods.push(period)
      setBakeSalePeriods(updatedPeriods)
      await saveBakeSalePeriods(updatedPeriods)

      // If this is the first period or it's marked as active, set it as active
      if (period.isActive || updatedPeriods.length === 1) {
        setActiveBakeSalePeriod(period)
      }

      toast({
        title: "Bake Sale Period added",
        description: `${period.name} has been added successfully.`,
      })
    } catch (error) {
      console.error("Error adding bake sale period:", error)
      toast({
        title: "Error adding period",
        description: "There was a problem adding the bake sale period.",
        variant: "destructive",
      })
    }
  }

  const updateBakeSalePeriod = async (period: BakeSalePeriod) => {
    try {
      // If this period is active, deactivate all others
      const updatedPeriods = bakeSalePeriods.map((p) =>
        p.id === period.id ? period : period.isActive ? { ...p, isActive: false } : p,
      )
      setBakeSalePeriods(updatedPeriods)
      await saveBakeSalePeriods(updatedPeriods)

      // If this period is active, update the active period
      if (period.isActive) {
        setActiveBakeSalePeriod(period)
      } else if (activeBakeSalePeriod?.id === period.id) {
        // If this was the active period but is no longer active, find a new active period
        const newActivePeriod = updatedPeriods.find((p) => p.isActive)
        setActiveBakeSalePeriod(newActivePeriod || null)
      }

      toast({
        title: "Bake Sale Period updated",
        description: `${period.name} has been updated successfully.`,
      })
    } catch (error) {
      console.error("Error updating bake sale period:", error)
      toast({
        title: "Error updating period",
        description: "There was a problem updating the bake sale period.",
        variant: "destructive",
      })
    }
  }

  const handleSetActiveBakeSalePeriod = async (periodId: string) => {
    try {
      // Find the period to set as active
      const periodToActivate = bakeSalePeriods.find((p) => p.id === periodId)

      if (!periodToActivate) {
        throw new Error("Bake sale period not found")
      }

      // Update all periods to set the selected one as active
      const updatedPeriods = bakeSalePeriods.map((p) => ({
        ...p,
        isActive: p.id === periodId,
      }))
      setBakeSalePeriods(updatedPeriods)
      await saveBakeSalePeriods(updatedPeriods)

      // Set the active period
      setActiveBakeSalePeriod({ ...periodToActivate, isActive: true })

      toast({
        title: "Active period changed",
        description: `${periodToActivate.name} is now the active bake sale period.`,
      })
    } catch (error) {
      console.error("Error setting active bake sale period:", error)
      toast({
        title: "Error changing active period",
        description: "There was a problem changing the active bake sale period.",
        variant: "destructive",
      })
    }
  }

  return (
    <StoreContext.Provider
      value={{
        orders,
        products,
        bakeSales,
        bakeSalePeriods,
        activeBakeSalePeriod,
        loading,
        isUsingFallbackData,
        refreshData,
        addOrder,
        updateOrderStatus,
        updateOrderPayment,
        updateOrderPackingStatus,
        updateOrderPackingNotes,
        updateOrderItemPackingStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        addBakeSale,
        updateBakeSale,
        deleteBakeSale,
        updateProductStock,
        resetProductStock,
        addBakeSalePeriod,
        updateBakeSalePeriod,
        setActiveBakeSalePeriod: handleSetActiveBakeSalePeriod,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
