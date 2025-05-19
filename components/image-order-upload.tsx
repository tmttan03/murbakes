"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/context"
import { calculateDiscount, formatCurrency, generateOrderId } from "@/lib/utils"
import { Upload, FileText, Check, Info } from "lucide-react"
import { LoadingSpinner } from "./loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ImageOrderUpload() {
  const { toast } = useToast()
  const { products, addOrder, loading } = useStore()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrStatus, setOcrStatus] = useState("")
  const [orderData, setOrderData] = useState({
    customerName: "",
    contactNumber: "",
    isPickup: false,
    deliveryAddress: "",
    deliveryTime: "",
    items: [] as { productId: string; quantity: number }[],
  })

  if (loading) {
    return <LoadingSpinner className="h-64" />
  }

  // Simulated OCR function
  const simulateOCR = async (imageData: string) => {
    try {
      setIsProcessing(true)
      setOcrProgress(0)
      setOcrStatus("Simulating OCR processing...")

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setOcrProgress((prev) => {
          const newProgress = prev + 10
          if (newProgress >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return newProgress
        })
      }, 300)

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a template for order text
      const simulatedText = `Name: Customer Name
Contact No: 0123456789
Pickup: Yes
Delivery address: 123 Main St
Delivery time: 3:00 PM

Order:
Chocolate Chip Cookie - 3
Red Velvet Cookie - 2`

      setExtractedText(simulatedText)
      setOcrStatus("Text extraction complete")
      setOcrProgress(100)
      clearInterval(progressInterval)

      // Try to parse the text automatically
      parseExtractedText(simulatedText)
    } catch (error) {
      console.error("OCR simulation error:", error)
      toast({
        title: "Error",
        description: "Failed to simulate OCR. Please try again or enter the details manually.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const parseExtractedText = (text: string) => {
    try {
      // Extract name
      const nameMatch = text.match(/Name:?\s*([^\n]+)/) || text.match(/Customer:?\s*([^\n]+)/)
      const name = nameMatch ? nameMatch[1].trim() : ""

      // Extract contact number
      const contactMatch =
        text.match(/Contact:?\s*([^\n]+)/) ||
        text.match(/Phone:?\s*([^\n]+)/) ||
        text.match(/Number:?\s*([^\n]+)/) ||
        text.match(/Contact No:?\s*([^\n]+)/)
      const contactNumber = contactMatch ? contactMatch[1].trim() : ""

      // Extract pickup status
      const pickupMatch = text.match(/Pickup:?\s*([^\n]+)/) || text.match(/Delivery:?\s*([^\n]+)/)
      const isPickup = pickupMatch
        ? pickupMatch[1].toLowerCase().includes("yes") ||
          pickupMatch[1].toLowerCase().includes("pickup") ||
          !pickupMatch[1].toLowerCase().includes("delivery")
        : false

      // Extract delivery address
      const addressMatch = text.match(/Address:?\s*([^\n]+)/) || text.match(/Delivery address:?\s*([^\n]+)/)
      const deliveryAddress = addressMatch ? addressMatch[1].trim() : ""

      // Extract delivery time
      const timeMatch = text.match(/Time:?\s*([^\n]+)/) || text.match(/Delivery time:?\s*([^\n]+)/)
      const deliveryTime = timeMatch ? timeMatch[1].trim() : ""

      // Extract order items - look for product names and quantities
      const items: { productId: string; quantity: number }[] = []

      products.forEach((product) => {
        // Create a case-insensitive regex to find the product name
        const regex = new RegExp(
          `${product.name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\s*[-:]?\\s*(\\d+)\\s*(?:pcs|pieces|pc|piece)?`,
          "i",
        )
        const match = text.match(regex)

        if (match) {
          const quantity = Number.parseInt(match[1], 10)
          if (!isNaN(quantity) && quantity > 0) {
            items.push({
              productId: product.id,
              quantity,
            })
          }
        }
      })

      setOrderData({
        customerName: name,
        contactNumber,
        isPickup,
        deliveryAddress,
        deliveryTime,
        items,
      })
    } catch (error) {
      console.error("Error parsing text:", error)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageData = event.target.result as string
        setImageUrl(imageData)
        // Don't automatically run OCR, wait for user to click the button
      }
    }
    reader.readAsDataURL(file)
  }

  const handleExtractedTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExtractedText(e.target.value)
    parseExtractedText(e.target.value)
  }

  const handleCreateOrder = () => {
    if (!orderData.customerName || !orderData.contactNumber || orderData.items.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and add at least one item to the order.",
        variant: "destructive",
      })
      return
    }

    // Calculate order totals
    const orderItems = orderData.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      const price = product?.price || 0
      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
        total: price * item.quantity,
      }
    })

    const totalItems = orderItems.reduce((acc, item) => acc + item.quantity, 0)
    const subtotal = orderItems.reduce((acc, item) => acc + item.total, 0)
    const discount = calculateDiscount(totalItems)
    const total = subtotal - discount

    // Create the order
    const order = {
      id: generateOrderId(),
      customerName: orderData.customerName,
      contactNumber: orderData.contactNumber,
      isPickup: orderData.isPickup,
      deliveryAddress: !orderData.isPickup ? orderData.deliveryAddress : undefined,
      deliveryTime: !orderData.isPickup ? orderData.deliveryTime : undefined,
      items: orderItems,
      totalItems,
      subtotal,
      discount,
      total,
      createdAt: new Date(),
      status: "pending" as const,
      isPaid: false,
      sourceImage: imageUrl || undefined,
      isPacked: false,
      packedItems: [],
      packingNotes: "",
    }

    addOrder(order)

    // Reset form
    setImageUrl(null)
    setExtractedText(null)
    setOrderData({
      customerName: "",
      contactNumber: "",
      isPickup: false,
      deliveryAddress: "",
      deliveryTime: "",
      items: [],
    })

    toast({
      title: "Order Created",
      description: `Order ${order.id} has been created successfully.`,
    })
  }

  const handleAddItem = (productId: string, quantity: number) => {
    const existingItemIndex = orderData.items.findIndex((item) => item.productId === productId)

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderData.items]
      updatedItems[existingItemIndex].quantity = quantity
      setOrderData({ ...orderData, items: updatedItems })
    } else {
      // Add new item
      setOrderData({
        ...orderData,
        items: [...orderData.items, { productId, quantity }],
      })
    }
  }

  const handleRemoveItem = (productId: string) => {
    setOrderData({
      ...orderData,
      items: orderData.items.filter((item) => item.productId !== productId),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Upload Order from Image</h2>
      </div>

      <Alert className="bg-amber-50 border-amber-200">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">OCR Simulation Mode</AlertTitle>
        <AlertDescription className="text-amber-700">
          This feature is currently in simulation mode. For real OCR functionality, install tesseract.js:
          <pre className="mt-2 p-2 bg-amber-100 rounded text-sm">npm install tesseract.js --save</pre>
          Then update the code to use the actual OCR library. For now, the system will generate placeholder text that
          you can edit manually.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
          <TabsTrigger value="extract">Extract Text</TabsTrigger>
          <TabsTrigger value="review">Review Order</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Order Image</CardTitle>
              <CardDescription>Upload a screenshot of an order from Instagram or Facebook Messenger</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="image-upload">Order Image</Label>
                  <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} />
                </div>

                {imageUrl && (
                  <div className="grid gap-2">
                    <Label>Preview</Label>
                    <div className="border rounded-md overflow-hidden">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt="Order preview"
                        className="w-full max-h-[300px] object-contain"
                      />
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{ocrStatus}</span>
                      <span>{Math.round(ocrProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${ocrProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={!imageUrl || isProcessing}
                onClick={() => {
                  if (imageUrl && !extractedText) {
                    simulateOCR(imageUrl)
                  }
                }}
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Extract Text
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="extract">
          <Card>
            <CardHeader>
              <CardTitle>Extract Order Text</CardTitle>
              <CardDescription>Edit the extracted text to correct any errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="extracted-text">Extracted Text</Label>
                <Textarea
                  id="extracted-text"
                  value={extractedText || ""}
                  onChange={handleExtractedTextChange}
                  placeholder="No text extracted yet. Upload an image first."
                  className="min-h-[300px] font-mono"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={!extractedText}
                onClick={() => {
                  // Move to review tab
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                Continue to Review
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Review Order</CardTitle>
              <CardDescription>Review and edit the order details before creating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input
                      id="customer-name"
                      value={orderData.customerName}
                      onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contact-number">Contact Number</Label>
                    <Input
                      id="contact-number"
                      value={orderData.contactNumber}
                      onChange={(e) => setOrderData({ ...orderData, contactNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-pickup"
                    checked={orderData.isPickup}
                    onCheckedChange={(checked) => setOrderData({ ...orderData, isPickup: checked as boolean })}
                  />
                  <Label htmlFor="is-pickup">Pickup order</Label>
                </div>

                {!orderData.isPickup && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="delivery-address">Delivery Address</Label>
                      <Textarea
                        id="delivery-address"
                        value={orderData.deliveryAddress}
                        onChange={(e) => setOrderData({ ...orderData, deliveryAddress: e.target.value })}
                        required={!orderData.isPickup}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="delivery-time">Delivery Time</Label>
                      <Input
                        id="delivery-time"
                        value={orderData.deliveryTime}
                        onChange={(e) => setOrderData({ ...orderData, deliveryTime: e.target.value })}
                        required={!orderData.isPickup}
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label>Order Items</Label>
                  <div className="border rounded-md p-4">
                    {orderData.items.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No items added to the order yet</p>
                    ) : (
                      <div className="space-y-2">
                        {orderData.items.map((item) => {
                          const product = products.find((p) => p.id === item.productId)
                          return (
                            <div key={item.productId} className="flex justify-between items-center">
                              <div>
                                <span className="font-medium">{product?.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  {formatCurrency(product?.price || 0)} each
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleAddItem(item.productId, Number.parseInt(e.target.value) || 1)}
                                  className="w-20"
                                />
                                <Button variant="outline" size="sm" onClick={() => handleRemoveItem(item.productId)}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div className="mt-4">
                      <Label htmlFor="add-product">Add Product</Label>
                      <div className="flex gap-2 mt-1">
                        <Select
                          onValueChange={(value) => {
                            const product = products.find((p) => p.id === value)
                            if (product) {
                              handleAddItem(product.id, 1)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - {formatCurrency(product.price)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Order Summary</h3>
                  <div className="space-y-1 text-sm">
                    {orderData.items.length > 0 ? (
                      <>
                        {orderData.items.map((item) => {
                          const product = products.find((p) => p.id === item.productId)
                          const price = product?.price || 0
                          return (
                            <div key={item.productId} className="flex justify-between">
                              <span>
                                {product?.name} × {item.quantity}
                              </span>
                              <span>{formatCurrency(price * item.quantity)}</span>
                            </div>
                          )
                        })}

                        <div className="flex justify-between pt-2 border-t mt-2">
                          <span>Subtotal ({orderData.items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                          <span>
                            {formatCurrency(
                              orderData.items.reduce((acc, item) => {
                                const product = products.find((p) => p.id === item.productId)
                                return acc + (product?.price || 0) * item.quantity
                              }, 0),
                            )}
                          </span>
                        </div>

                        {calculateDiscount(orderData.items.reduce((acc, item) => acc + item.quantity, 0)) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount (orders ≥ 8 cookies)</span>
                            <span>
                              -
                              {formatCurrency(
                                calculateDiscount(orderData.items.reduce((acc, item) => acc + item.quantity, 0)),
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total</span>
                          <span>
                            {formatCurrency(
                              orderData.items.reduce((acc, item) => {
                                const product = products.find((p) => p.id === item.productId)
                                return acc + (product?.price || 0) * item.quantity
                              }, 0) - calculateDiscount(orderData.items.reduce((acc, item) => acc + item.quantity, 0)),
                            )}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-center py-2">Add items to see order summary</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleCreateOrder}
                disabled={!orderData.customerName || !orderData.contactNumber || orderData.items.length === 0}
              >
                <Upload className="mr-2 h-4 w-4" />
                Create Order
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
