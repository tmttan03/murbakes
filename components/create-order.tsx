"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import type { Product } from "@/lib/data"
import { calculateDiscount, formatCurrency, generateOrderId } from "@/lib/utils"
import { MinusCircle, PlusCircle, Receipt } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/context"
import { LoadingSpinner } from "./loading-spinner"

export default function CreateOrder() {
  const { toast } = useToast()
  const { products, loading, addOrder } = useStore()
  const [isPickup, setIsPickup] = useState(true)
  const [orderItems, setOrderItems] = useState<
    {
      product: Product
      quantity: number
    }[]
  >([])

  if (loading) {
    return <LoadingSpinner className="h-64" />
  }

  const addProduct = (product: Product) => {
    const existingItem = orderItems.find((item) => item.product.id === product.id)

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setOrderItems([...orderItems, { product, quantity: 1 }])
    }
  }

  const removeProduct = (productId: string) => {
    const existingItem = orderItems.find((item) => item.product.id === productId)

    if (existingItem && existingItem.quantity > 1) {
      setOrderItems(
        orderItems.map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item)),
      )
    } else {
      setOrderItems(orderItems.filter((item) => item.product.id !== productId))
    }
  }

  const totalItems = orderItems.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = orderItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  const discount = calculateDiscount(totalItems)
  const total = subtotal - discount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    // Create order object
    const order = {
      id: generateOrderId(),
      customerName: formData.get("customerName") as string,
      contactNumber: formData.get("contactNumber") as string,
      isPickup,
      deliveryAddress: !isPickup ? (formData.get("deliveryAddress") as string) : undefined,
      deliveryTime: !isPickup ? (formData.get("deliveryTime") as string) : undefined,
      items: orderItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        total: item.product.price * item.quantity,
        packed: false,
      })),
      totalItems,
      subtotal,
      discount,
      total,
      createdAt: new Date(),
      status: "pending" as const,
      isPaid: false,
      isPacked: false,
      packedItems: [],
      packingNotes: "",
    }

    // Save the order
    await addOrder(order)

    // Show success message
    toast({
      title: "Order Created",
      description: `Order ${order.id} has been created successfully.`,
    })

    // Reset form
    form.reset()
    setOrderItems([])
    setIsPickup(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Create New Order</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Enter the customer details for this order.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input id="customerName" name="customerName" required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input id="contactNumber" name="contactNumber" required />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPickup"
                    checked={isPickup}
                    onCheckedChange={(checked) => setIsPickup(checked as boolean)}
                  />
                  <Label htmlFor="isPickup">Pickup order</Label>
                </div>

                {!isPickup && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="deliveryAddress">Delivery Address</Label>
                      <Textarea id="deliveryAddress" name="deliveryAddress" required={!isPickup} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="deliveryTime">Delivery Time</Label>
                      <Input id="deliveryTime" name="deliveryTime" required={!isPickup} />
                    </div>
                  </>
                )}
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={orderItems.length === 0}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Create Order
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Select products to add to this order.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-auto py-2 justify-start"
                    onClick={() => addProduct(product)}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No items added to the order yet</div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(item.product.price)} each</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeProduct(item.product.id)}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => addProduct(item.product)}
                          disabled={item.product.stock <= item.quantity}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Separator />

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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
