"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Order } from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Download, Printer } from "lucide-react"
import { useRef } from "react"

interface InvoiceGeneratorProps {
  order: Order
}

export default function InvoiceGenerator({ order }: InvoiceGeneratorProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)

  const printInvoice = () => {
    const printContent = invoiceRef.current?.innerHTML
    const originalContent = document.body.innerHTML

    if (printContent) {
      document.body.innerHTML = `
        <html>
          <head>
            <title>MurBakes Invoice - ${order.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .invoice-header { text-align: center; margin-bottom: 20px; }
              .invoice-details { margin-bottom: 20px; }
              .invoice-table { width: 100%; border-collapse: collapse; }
              .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .invoice-total { margin-top: 20px; text-align: right; }
              .invoice-message { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `

      window.print()
      document.body.innerHTML = originalContent
    }
  }

  if (!order) {
    return <div className="text-center text-muted-foreground">No order selected</div>
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Invoice - {order.id}</CardTitle>
        <CardDescription>Generated on {formatDate(new Date())}</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={invoiceRef}>
          <div className="invoice-header">
            <h1 className="text-2xl font-bold">MurBakes</h1>
            <p className="text-muted-foreground">Cookie Business</p>
          </div>

          <div className="invoice-details grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-medium">Bill To:</h3>
              <p>{order.customerName}</p>
              <p>{order.contactNumber}</p>
              {!order.isPickup && <p>{order.deliveryAddress}</p>}
            </div>
            <div className="text-right">
              <h3 className="font-medium">Invoice Details:</h3>
              <p>Invoice #: {order.id}</p>
              <p>Date: {formatDate(order.createdAt)}</p>
              <p>Delivery Method: {order.isPickup ? "Pickup" : "Delivery"}</p>
            </div>
          </div>

          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">
                    {item.productId
                      .split("-")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">{formatCurrency(item.price)}</td>
                  <td className="text-right py-2">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-1/2">
              <div className="flex justify-between py-1">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between py-1 text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 font-bold border-t mt-2 pt-2">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t text-sm">
            <p className="font-medium mb-2">Hello! I am sending you your invoice for MurBakes 🙂</p>
            <p className="mb-2">Payment options: GCash, Unionbank, BdO | Cash on Delivery</p>
            <p className="mb-2">Pick-up/Delivery: Pick-up at back of Fnf, in front of Flash express</p>
            <p className="mb-2">Book your own rider</p>
            <p className="mt-4">Thank you for supporting our small business!</p>
            <p>Follow us on instagram @_murbakes and don't forget to tag us!</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={printInvoice}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </CardFooter>
    </Card>
  )
}
