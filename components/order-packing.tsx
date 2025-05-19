"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/context"
import { formatCurrency, formatDate } from "@/lib/utils"
import { LoadingSpinner } from "./loading-spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, CheckCircle, XCircle, Search, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function OrderPacking() {
  const { orders, products, loading, updateOrderPackingStatus, updateOrderPackingNotes, updateOrderItemPackingStatus } =
    useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "packed" | "unpacked">("all")
  const [viewMode, setViewMode] = useState<"consolidated" | "detailed">("consolidated")
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  if (loading) {
    return <LoadingSpinner className="h-64" />
  }

  // Filter orders based on search term and packing status
  const filteredOrders = orders
    .filter((order) => {
      // Skip cancelled orders
      if (order.status === "cancelled") return false

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          order.id.toLowerCase().includes(searchLower) ||
          order.customerName.toLowerCase().includes(searchLower) ||
          order.contactNumber.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
    .filter((order) => {
      // Filter by packing status
      if (filterStatus === "packed") return order.isPacked
      if (filterStatus === "unpacked") return !order.isPacked
      return true
    })
    // Sort by creation date (newest first)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Get all unique product IDs from all orders
  const allProductIds = useMemo(() => {
    const productIds = new Set<string>()
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        productIds.add(item.productId)
      })
    })
    return Array.from(productIds)
  }, [filteredOrders])

  const handleToggleItemPacked = (orderId: string, productId: string, isPacked: boolean) => {
    updateOrderItemPackingStatus(orderId, productId, isPacked)
  }

  const handleToggleAllItems = (orderId: string, isPacked: boolean) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    // Mark all items as packed/unpacked
    order.items.forEach((item) => {
      updateOrderItemPackingStatus(orderId, item.productId, isPacked)
    })

    // Also update the order packing status
    updateOrderPackingStatus(orderId, isPacked, order.packingNotes)
  }

  const handlePackingNotesChange = (orderId: string, notes: string) => {
    updateOrderPackingNotes(orderId, notes)
  }

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : productId
  }

  // Function to get item quantity for a specific order and product
  const getItemQuantity = (order: any, productId: string) => {
    const item = order.items.find((item: any) => item.productId === productId)
    return item ? item.quantity : 0
  }

  // Function to check if an item is packed
  const isItemPacked = (order: any, productId: string) => {
    const item = order.items.find((item: any) => item.productId === productId)
    return item ? item.packed : false
  }

  // Function to check if an order has a specific product
  const hasProduct = (order: any, productId: string) => {
    return order.items.some((item: any) => item.productId === productId)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Order Packing</h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "consolidated" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("consolidated")}
          >
            <Package className="mr-1 h-4 w-4" />
            Consolidated View
          </Button>
          <Button
            variant={viewMode === "detailed" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("detailed")}
          >
            <Eye className="mr-1 h-4 w-4" />
            Detailed View
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Tabs
            defaultValue="all"
            className="w-full"
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as "all" | "packed" | "unpacked")}
          >
            <TabsList className="grid w-[300px] grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="packed">Packed</TabsTrigger>
              <TabsTrigger value="unpacked">Unpacked</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {viewMode === "consolidated" ? (
        <Card>
          <CardHeader>
            <CardTitle>Consolidated Packing View</CardTitle>
            <CardDescription>Check off items as you pack them across all orders</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No orders found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Order ID</TableHead>
                      <TableHead className="w-[120px]">Customer</TableHead>
                      {allProductIds.map((productId) => (
                        <TableHead key={productId} className="text-center min-w-[100px]">
                          {getProductName(productId)}
                        </TableHead>
                      ))}
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[100px]">Packing</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        {allProductIds.map((productId) => (
                          <TableCell key={productId} className="text-center">
                            {hasProduct(order, productId) ? (
                              <div className="flex flex-col items-center">
                                <div className="text-sm mb-1">{getItemQuantity(order, productId)}x</div>
                                <Checkbox
                                  checked={isItemPacked(order, productId)}
                                  onCheckedChange={(checked) =>
                                    handleToggleItemPacked(order.id, productId, checked as boolean)
                                  }
                                />
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>
                          <PackingStatusBadge isPacked={order.isPacked} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Order #{order.id} Packing Details</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h3 className="font-medium mb-2">Customer Information</h3>
                                      <div className="text-sm">
                                        <p>
                                          <span className="text-muted-foreground">Name:</span> {order.customerName}
                                        </p>
                                        <p>
                                          <span className="text-muted-foreground">Contact:</span> {order.contactNumber}
                                        </p>
                                        <p>
                                          <span className="text-muted-foreground">Delivery:</span>{" "}
                                          {order.isPickup ? "Pickup" : "Delivery"}
                                        </p>
                                        {!order.isPickup && (
                                          <>
                                            <p>
                                              <span className="text-muted-foreground">Delivery Time:</span>{" "}
                                              {order.deliveryTime}
                                            </p>
                                            <p>
                                              <span className="text-muted-foreground">Address:</span>{" "}
                                              {order.deliveryAddress}
                                            </p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="font-medium mb-2">Order Summary</h3>
                                      <div className="text-sm">
                                        <p>
                                          <span className="text-muted-foreground">Date:</span>{" "}
                                          {formatDate(new Date(order.createdAt))}
                                        </p>
                                        <p>
                                          <span className="text-muted-foreground">Status:</span> {order.status}
                                        </p>
                                        <p>
                                          <span className="text-muted-foreground">Payment:</span>{" "}
                                          {order.isPaid ? "Paid" : "Unpaid"}
                                        </p>
                                        <p>
                                          <span className="text-muted-foreground">Total:</span>{" "}
                                          {formatCurrency(order.total)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex justify-between items-center mb-2">
                                      <h3 className="font-medium">Items to Pack</h3>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleToggleAllItems(order.id, true)}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Mark All Packed
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleToggleAllItems(order.id, false)}
                                        >
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Mark All Unpacked
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="border rounded-md overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="w-[50px]">Packed</TableHead>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {order.items.map((item) => (
                                            <TableRow key={item.productId}>
                                              <TableCell>
                                                <Checkbox
                                                  checked={item.packed || false}
                                                  onCheckedChange={(checked) =>
                                                    handleToggleItemPacked(order.id, item.productId, checked as boolean)
                                                  }
                                                />
                                              </TableCell>
                                              <TableCell
                                                className={item.packed ? "line-through text-muted-foreground" : ""}
                                              >
                                                {getProductName(item.productId)}
                                              </TableCell>
                                              <TableCell>{item.quantity}</TableCell>
                                              <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor={`packing-notes-${order.id}`} className="font-medium">
                                      Packing Notes
                                    </Label>
                                    <Textarea
                                      id={`packing-notes-${order.id}`}
                                      placeholder="Add notes about this order's packing..."
                                      className="mt-1"
                                      value={order.packingNotes || ""}
                                      onChange={(e) => handlePackingNotesChange(order.id, e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                  <div className="text-sm text-muted-foreground">
                                    {order.isPacked
                                      ? "All items have been packed"
                                      : `${order.items.filter((i) => i.packed).length} of ${
                                          order.items.length
                                        } items packed`}
                                  </div>
                                  <Button onClick={() => handleToggleAllItems(order.id, !order.isPacked)}>
                                    {order.isPacked ? "Mark as Unpacked" : "Mark as Packed"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant={order.isPacked ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleToggleAllItems(order.id, !order.isPacked)}
                            >
                              {order.isPacked ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Unpack
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Pack
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Packing View</CardTitle>
            <CardDescription>Manage packing status for all orders</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No orders found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Packing</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{formatDate(new Date(order.createdAt))}</TableCell>
                      <TableCell>{order.totalItems} items</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <PackingStatusBadge isPacked={order.isPacked} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Order #{order.id} Packing Details</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-medium mb-2">Customer Information</h3>
                                    <div className="text-sm">
                                      <p>
                                        <span className="text-muted-foreground">Name:</span> {order.customerName}
                                      </p>
                                      <p>
                                        <span className="text-muted-foreground">Contact:</span> {order.contactNumber}
                                      </p>
                                      <p>
                                        <span className="text-muted-foreground">Delivery:</span>{" "}
                                        {order.isPickup ? "Pickup" : "Delivery"}
                                      </p>
                                      {!order.isPickup && (
                                        <>
                                          <p>
                                            <span className="text-muted-foreground">Delivery Time:</span>{" "}
                                            {order.deliveryTime}
                                          </p>
                                          <p>
                                            <span className="text-muted-foreground">Address:</span>{" "}
                                            {order.deliveryAddress}
                                          </p>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-medium mb-2">Order Summary</h3>
                                    <div className="text-sm">
                                      <p>
                                        <span className="text-muted-foreground">Date:</span>{" "}
                                        {formatDate(new Date(order.createdAt))}
                                      </p>
                                      <p>
                                        <span className="text-muted-foreground">Status:</span> {order.status}
                                      </p>
                                      <p>
                                        <span className="text-muted-foreground">Payment:</span>{" "}
                                        {order.isPaid ? "Paid" : "Unpaid"}
                                      </p>
                                      <p>
                                        <span className="text-muted-foreground">Total:</span>{" "}
                                        {formatCurrency(order.total)}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-medium">Items to Pack</h3>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleAllItems(order.id, true)}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Mark All Packed
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleAllItems(order.id, false)}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Mark All Unpacked
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="border rounded-md overflow-hidden">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="w-[50px]">Packed</TableHead>
                                          <TableHead>Item</TableHead>
                                          <TableHead>Quantity</TableHead>
                                          <TableHead className="text-right">Price</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {order.items.map((item) => (
                                          <TableRow key={item.productId}>
                                            <TableCell>
                                              <Checkbox
                                                checked={item.packed || false}
                                                onCheckedChange={(checked) =>
                                                  handleToggleItemPacked(order.id, item.productId, checked as boolean)
                                                }
                                              />
                                            </TableCell>
                                            <TableCell
                                              className={item.packed ? "line-through text-muted-foreground" : ""}
                                            >
                                              {getProductName(item.productId)}
                                            </TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor={`packing-notes-${order.id}`} className="font-medium">
                                    Packing Notes
                                  </Label>
                                  <Textarea
                                    id={`packing-notes-${order.id}`}
                                    placeholder="Add notes about this order's packing..."
                                    className="mt-1"
                                    value={order.packingNotes || ""}
                                    onChange={(e) => handlePackingNotesChange(order.id, e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-muted-foreground">
                                  {order.isPacked
                                    ? "All items have been packed"
                                    : `${order.items.filter((i) => i.packed).length} of ${
                                        order.items.length
                                      } items packed`}
                                </div>
                                <Button onClick={() => handleToggleAllItems(order.id, !order.isPacked)}>
                                  {order.isPacked ? "Mark as Unpacked" : "Mark as Packed"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant={order.isPacked ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggleAllItems(order.id, !order.isPacked)}
                          >
                            {order.isPacked ? (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Unpack
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Pack
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function OrderStatusBadge({ status }: { status: "pending" | "completed" | "cancelled" }) {
  if (status === "pending") {
    return (
      <Badge variant="outline" className="border-amber-500 text-amber-500">
        Pending
      </Badge>
    )
  }

  if (status === "completed") {
    return (
      <Badge variant="outline" className="border-green-500 text-green-500">
        Completed
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="border-red-500 text-red-500">
      Cancelled
    </Badge>
  )
}

function PackingStatusBadge({ isPacked }: { isPacked?: boolean }) {
  if (isPacked) {
    return (
      <Badge variant="outline" className="border-green-500 text-green-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        Packed
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="border-amber-500 text-amber-500">
      <XCircle className="h-3 w-3 mr-1" />
      Not Packed
    </Badge>
  )
}
