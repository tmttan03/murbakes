"use client"

import { useStore } from "@/lib/context"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "./loading-spinner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { subDays, format, parseISO, isValid, isAfter } from "date-fns"


export default function Dashboard() {
  const { orders, products, loading } = useStore()

  if (loading) {
    return <LoadingSpinner className="h-64" />
  }

  // Filter out cancelled orders for revenue calculations
  const activeOrders = orders.filter((order) => order.status !== "cancelled")

  // Calculate total revenue
  const totalRevenue = activeOrders.reduce((acc, order) => acc + Number(order.total || 0), 0)

  // Calculate paid revenue
  const paidRevenue = activeOrders.filter((order) => order.isPaid).reduce((acc, order) => acc + order.total, 0)

  // Calculate unpaid revenue
  const unpaidRevenue = activeOrders.filter((order) => !order.isPaid).reduce((acc, order) => acc + order.total, 0)

  // Calculate total orders
  const totalOrders = orders.length

  // Calculate pending orders
  const pendingOrders = orders.filter((order) => order.status === "pending").length

  // Calculate completed orders
  const completedOrders = orders.filter((order) => order.status === "completed").length

  // Calculate cancelled orders
  const cancelledOrders = orders.filter((order) => order.status === "cancelled").length

  // Calculate total items sold
  const totalItemsSold = activeOrders.reduce((acc, order) => acc + order.totalItems, 0)

  // Calculate revenue by product
  const revenueByProduct = products.map((product) => {
    const productRevenue = activeOrders.reduce((acc, order) => {
      const productItems = (order.items ?? []).filter((item) => item.productId === product.id)
      return acc + productItems.reduce((itemAcc, item) => itemAcc + Number(item.total || 0), 0)
    }, 0)
  
    return {
      productId: product.id,
      name: product.name,
      revenue: productRevenue,
    }
  })

  // Sort revenue by product in descending order
  revenueByProduct.sort((a, b) => b.revenue - a.revenue)

  // Calculate quantity sold by product
  const quantityByProduct = products.map((product) => {
    const productQuantity = activeOrders.reduce((acc, order) => {
      const productItems = order.items.filter((item) => item.productId === product.id)
      return acc + productItems.reduce((itemAcc, item) => itemAcc + item.quantity, 0)
    }, 0)

    return {
      name: product.name,
      quantity: productQuantity,
    }
  })

  // Sort quantity by product in descending order
  quantityByProduct.sort((a, b) => b.quantity - a.quantity)

  // Calculate revenue by day (last 7 days)
  const revenueByDay = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i)
    const dateString = format(date, "yyyy-MM-dd")
  
    const dayRevenue = activeOrders
      .filter((order) => {
        if (!order.createdAt) return false
        const orderDate = parseISO(order.createdAt)
        return isValid(orderDate) && format(orderDate, "yyyy-MM-dd") === dateString
      })
      .reduce((acc, order) => acc + Number(order.total || 0), 0)
  
    return {
      name: format(date, "EEE"),
      revenue: dayRevenue,
    }
  }).reverse()

  // Calculate order status distribution for pie chart
  const orderStatusData = [
    { name: "Pending", value: pendingOrders },
    { name: "Completed", value: completedOrders },
    { name: "Cancelled", value: cancelledOrders },
  ]

  // Calculate payment status distribution for pie chart
  const paymentStatusData = [
    { name: "Paid", value: activeOrders.filter((order) => order.isPaid).length },
    { name: "Unpaid", value: activeOrders.filter((order) => !order.isPaid).length },
  ]

  // Calculate packing status distribution for pie chart
  const packingStatusData = [
    { name: "Packed", value: activeOrders.filter((order) => order.isPacked).length },
    { name: "Unpacked", value: activeOrders.filter((order) => !order.isPacked).length },
  ]

  // Colors for pie charts
  const COLORS = ["#4f46e5", "#f59e0b", "#ef4444"]
  const PAYMENT_COLORS = ["#10b981", "#f59e0b"]

  // Calculate recent orders (last 24 hours)
  const recentOrders = orders.filter((order) => {
    if (!order?.createdAt) return false
    const orderDate = parseISO(order.createdAt)
    const yesterday = subDays(new Date(), 1)
    return isValid(orderDate) && isAfter(orderDate, yesterday)
  }).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(paidRevenue)} paid, {formatCurrency(unpaidRevenue)} unpaid
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOrders} pending, {completedOrders} completed, {cancelledOrders} cancelled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItemsSold}</div>
            <p className="text-xs text-muted-foreground">Across {products.length} different products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentOrders}</div>
            <p className="text-xs text-muted-foreground">In the last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Daily revenue for the past 7 days</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => {
                      return value === 0 ? "₱0" : `₱${value}`
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [`₱${value}`, "Revenue"]}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Product</CardTitle>
                <CardDescription>Top products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByProduct.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => {
                        return value === 0 ? "₱0" : `₱${value}`
                      }}
                    />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip
                      formatter={(value) => [`₱${value}`, "Revenue"]}
                      labelFormatter={(label) => `Product: ${label}`}
                    />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quantity by Product</CardTitle>
                <CardDescription>Top products by quantity sold</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={quantityByProduct.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip
                      formatter={(value) => [`${value}`, "Quantity"]}
                      labelFormatter={(label) => `Product: ${label}`}
                    />
                    <Bar dataKey="quantity" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Revenue</CardTitle>
                <CardDescription>Products generating the most revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueByProduct.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-[30px] text-center">{index + 1}.</div>
                      <div className="ml-2 flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(product.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products by Quantity</CardTitle>
                <CardDescription>Products with the highest sales volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quantityByProduct.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-[30px] text-center">{index + 1}.</div>
                      <div className="ml-2 flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.quantity} units sold</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>Distribution of order statuses</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orders`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Distribution of payment statuses</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orders`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Packing Status</CardTitle>
                <CardDescription>Distribution of packing statuses</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={packingStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {packingStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orders`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
