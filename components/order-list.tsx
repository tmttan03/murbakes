"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, XCircle, DollarSign, Clock } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useStore } from "@/lib/context"
import { LoadingSpinner } from "./loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentDialog } from "./payment-dialog"

export default function OrderList() {
  const { orders, products, loading, updateOrderStatus, updateOrderPayment } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [openPaymentDialog, setOpenPaymentDialog] = useState<string | null>(null)

  if (loading) {
    return <LoadingSpinner className="h-64" />
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Status filter
    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    // Payment filter
    const matchesPayment =
      paymentFilter === "all" ||
      (paymentFilter === "paid" && order.isPaid) ||
      (paymentFilter === "unpaid" && !order.isPaid)

    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.contactNumber && order.contactNumber.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesStatus && matchesPayment && matchesSearch
  })

  // Group orders by status
  const pendingOrders = filteredOrders.filter((order) => order.status === "pending")
  const completedOrders = filteredOrders.filter((order) => order.status === "completed")
  const cancelledOrders = filteredOrders.filter((order) => order.status === "cancelled")

  const handleMarkAsPaid = (orderId: string) => {
    setOpenPaymentDialog(orderId)
  }

  const handleMarkAsUnpaid = (orderId: string) => {
    updateOrderPayment(orderId, false)
  }

  const handleMarkAsCompleted = (orderId: string) => {
    updateOrderStatus(orderId, "completed")
  }

  const handleMarkAsCancelled = (orderId: string) => {
    updateOrderStatus(orderId, "cancelled")
  }

  const handleReactivateOrder = (orderId: string) => {
    updateOrderStatus(orderId, "pending")
  }

  const renderOrderCard = (order: any) => {
    const orderProducts = order.items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId)
      return {
        ...item,
        name: product ? product.name : `Product ${item.productId}`,
      }
    })

    return (
      <Card key={order.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Order #{order.id}</CardTitle>
              <CardDescription>
                {formatDate(new Date(order.createdAt))} • {order.customerName} • {order.contactNumber}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge isPaid={order.isPaid} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Order Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Delivery Method:</span>{" "}
                  <span className="font-medium">{order.isPickup ? "Pickup" : "Delivery"}</span>
                </div>
                {!order.isPickup && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Delivery Time:</span>{" "}
                      <span className="font-medium">{order.deliveryTime}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Delivery Address:</span>{" "}
                      <span className="font-medium">{order.deliveryAddress}</span>
                    </div>
                  </>
                )}
                {order.isPaid && order.paymentMethod && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Payment Method:</span>{" "}
                    <span className="font-medium">{order.paymentMethod}</span>
                    {order.referenceNumber && (
                      <>
                        {" "}
                        • <span className="text-muted-foreground">Reference:</span>{" "}
                        <span className="font-medium">{order.referenceNumber}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Items</h3>
              <div className="space-y-2">
                {orderProducts.map((item: any) => (
                  <div key={item.productId} className="flex justify-between items-center py-1 border-b last:border-0">
                    <div>
                      {item.quantity}x {item.name}
                    </div>
                    <div className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-sm pt-2 border-t">
              <div className="flex justify-between">
                <span>Subtotal ({order.totalItems} items)</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-1 border-t">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex gap-2">
            {order.status === "pending" && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleMarkAsCompleted(order.id)}>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Mark Completed
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleMarkAsCancelled(order.id)}>
                  <XCircle className="mr-1 h-4 w-4" />
                  Cancel Order
                </Button>
              </>
            )}
            {order.status === "cancelled" && (
              <Button variant="outline" size="sm" onClick={() => handleReactivateOrder(order.id)}>
                <Clock className="mr-1 h-4 w-4" />
                Reactivate Order
              </Button>
            )}
          </div>
          <div>
            {!order.isPaid && order.status !== "cancelled" ? (
              <Dialog
                open={openPaymentDialog === order.id}
                onOpenChange={(open) => !open && setOpenPaymentDialog(null)}
              >
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => handleMarkAsPaid(order.id)}>
                    <DollarSign className="mr-1 h-4 w-4" />
                    Mark as Paid
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <PaymentDialog
                    order={order}
                    updateOrderPayment={updateOrderPayment}
                    onClose={() => setOpenPaymentDialog(null)}
                  />
                </DialogContent>
              </Dialog>
            ) : (
              order.isPaid && (
                <Button variant="outline" size="sm" onClick={() => handleMarkAsUnpaid(order.id)}>
                  Mark as Unpaid
                </Button>
              )
            )}
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or customer name..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No pending orders found</div>
          ) : (
            pendingOrders.map(renderOrderCard)
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          {completedOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No completed orders found</div>
          ) : (
            completedOrders.map(renderOrderCard)
          )}
        </TabsContent>
        <TabsContent value="cancelled" className="mt-4">
          {cancelledOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No cancelled orders found</div>
          ) : (
            cancelledOrders.map(renderOrderCard)
          )}
        </TabsContent>
      </Tabs>
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

function PaymentStatusBadge({ isPaid }: { isPaid: boolean }) {
  if (isPaid) {
    return (
      <Badge variant="outline" className="border-green-500 text-green-500">
        Paid
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="border-amber-500 text-amber-500">
      Unpaid
    </Badge>
  )
}
