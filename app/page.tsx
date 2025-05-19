"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Dashboard from "@/components/dashboard"
import OrderList from "@/components/order-list"
import CreateOrder from "@/components/create-order"
import ProductList from "@/components/product-list"
import BakeSalePeriods from "@/components/bake-sale-periods"
import InvoiceGenerator from "@/components/invoice-generator"
import ImageOrderUpload from "@/components/image-order-upload"
import OrderPacking from "@/components/order-packing"
import { StoreProvider } from "@/lib/context"
import { ErrorBoundary } from "react-error-boundary"
import { ErrorFallback } from "@/components/error-fallback"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <StoreProvider>
      <main className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col">
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">MurBakes Management</h1>
            </div>

            <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 mb-4">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="create-order">Create Order</TabsTrigger>
                <TabsTrigger value="upload-order">Upload Order</TabsTrigger>
                <TabsTrigger value="packing">Packing</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="bake-sales">Bake Sales</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
              </TabsList>

              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <TabsContent value="dashboard">
                  <Dashboard />
                </TabsContent>
                <TabsContent value="orders">
                  <OrderList />
                </TabsContent>
                <TabsContent value="create-order">
                  <CreateOrder />
                </TabsContent>
                <TabsContent value="upload-order">
                  <ImageOrderUpload />
                </TabsContent>
                <TabsContent value="packing">
                  <OrderPacking />
                </TabsContent>
                <TabsContent value="products">
                  <ProductList />
                </TabsContent>
                <TabsContent value="bake-sales">
                  <BakeSalePeriods />
                </TabsContent>
                <TabsContent value="invoices">
                  <InvoiceGenerator />
                </TabsContent>
              </ErrorBoundary>
            </Tabs>
          </div>
        </div>
      </main>
    </StoreProvider>
  )
}
