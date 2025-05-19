"use client"

import type React from "react"

import { useState } from "react"
import { useStore } from "@/lib/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { MinusCircle, PlusCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { calculateDiscount } from "@/lib/utils"
import type { Order, OrderItem } from "@/lib/data"
import { updateOrder } from "@/lib/context"


interface OrderEditDialogProps {
  order: Order
  onClose: () => void
  onSave: (updatedOrder: Order) => void
}

export function OrderEditDialog({ order, onClose, onSave }: OrderEditDialogProps) {
  const { products } = useStore()
  const [customerName, setCustomerName] = useState(order.customerName)
  const [contactNumber, setContactNumber] = useState(order.contactNumber)
  const [isPickup, setIsPickup] = useState(order.isPickup)
  const [deliveryAddress, setDeliveryAddress] = useState(order.deliveryAddress || "")
  const [deliveryTime, setDeliveryTime] = useState(order.deliveryTime || "")
  const [orderItems, setOrderItems] = useState<OrderItem[]>(JSON.parse(JSON.stringify(order.items)))
  const [availableProducts, setAvailableProducts] = useState(products)

  // Calculate totals
  const totalItems = orderItems.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = orderItems.reduce((acc, item) => acc + item.total, 0)
  const discount = calculateDiscount(totalItems)
  const total = subtotal - discount

  // Update item total when quantity changes
  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return

    const updatedItems = [...orderItems]
    const item = updatedItems[index]

    // Find the product to check stock
    const product = products.find((p) => p.id === item.productId)

    // Calculate how many more items we're adding compared to the original order
    const originalItem = order.items.find((i) => i.productId === item.productId)
    const originalQuantity = originalItem ? originalItem.quantity : 0
    const additionalQuantity = quantity - originalQuantity

    // Check if we have enough stock
    if (product && additionalQuantity > 0 && product.stock < additionalQuantity) {
      alert(`Not enough stock for ${product.name}. Only ${product.stock} available.`)
      return
    }

    updatedItems[index] = {
      ...item,
      quantity,
      total: item.price * quantity,
    }

    setOrderItems(updatedItems)
  }

  // Remove item from order
  const removeItem = (index: number) => {
    const updatedItems = [...orderItems]
    updatedItems.splice(index, 1)
    setOrderItems(updatedItems)
  }

  // Add product to order
  const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    // Check if product is already in order
    const existingItemIndex = orderItems.findIndex((item) => item.productId === productId)

    if (existingItemIndex >= 0) {
      // Update existing item
      updateItemQuantity(existingItemIndex, orderItems[existingItemIndex].quantity + 1)
    } else {
      // Add new item
      const newItem: OrderItem = {
        productId,
        quantity: 1,
        price: product.price,
        total: product.price,
        packed: false,
      }
      setOrderItems([...orderItems, newItem])
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (orderItems.length === 0) {
      alert("Order must have at least one item")
      return
    }

    const updatedOrder: Order = {
      ...order,
      customerName,
      contactNumber,
      isPickup,
      deliveryAddress: isPickup ? undefined : deliveryAddress,
      deliveryTime: isPickup ? undefined : deliveryTime,
      items: orderItems,
      totalItems,
      subtotal,
      discount,
      total,
    }

    updateOrder(updatedOrder)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Edit Order #{order.id}</DialogTitle>
        <DialogDescription>Update customer information, delivery details, and order items.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid gap-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contactNumber">Contact Number</Label>
          <Input id="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="isPickup" checked={isPickup} onCheckedChange={(checked) => setIsPickup(checked as boolean)} />
          <Label htmlFor="isPickup">Pickup order</Label>
        </div>

        {!isPickup && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Textarea
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required={!isPickup}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deliveryTime">Delivery Time</Label>
              <Input
                id="deliveryTime"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                required={!isPickup}
              />
            </div>
          </>
        )}

        <Separator className="my-2" />

        <div>
          <Label className="mb-2 block">Order Items</Label>

          {orderItems.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No items in this order. Add some products below.
            </div>
          ) : (
            <div className="space-y-2">
              {orderItems.map((item, index) => {
                const product = products.find((p) => p.id === item.productId)
                return (
                  <div key={index} className="flex items-center justify-between border p-2 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{product?.name || "Unknown Product"}</div>
                      <div className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateItemQuantity(index, item.quantity - 1)}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateItemQuantity(index, item.quantity + 1)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeItem(index)}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-4">
            <Label className="mb-2 block">Add Products</Label>
            <div className="grid grid-cols-2 gap-2">
              {products.map((product) => (
                <Button
                  key={product.id}
                  type="button"
                  variant="outline"
                  className="justify-start h-auto py-2"
                  onClick={() => addProduct(product.id)}
                  disabled={product.stock <= 0}
                >
                  <div className="flex flex-col items-start">
                    <span>{product.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(product.price)} - {product.stock} in stock
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal ({totalItems} items)</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount (orders ≥ 8 cookies)</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  )
}
