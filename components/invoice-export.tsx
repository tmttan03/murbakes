"use client"

import { Button } from "@/components/ui/button"
import type { Order } from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Download } from "lucide-react"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

interface InvoiceExportProps {
  order: Order
}

export default function InvoiceExport({ order }: InvoiceExportProps) {
  const generatePDF = () => {
    // Create a new PDF document
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("MurBakes Invoice", 105, 20, { align: "center" })

    // Add order ID and date
    doc.setFontSize(12)
    doc.text(`Invoice #: ${order.id}`, 20, 30)
    doc.text(`Date: ${formatDate(order.createdAt)}`, 20, 37)

    // Add customer info
    doc.text("Bill To:", 20, 50)
    doc.text(order.customerName, 20, 57)
    doc.text(order.contactNumber, 20, 64)
    if (!order.isPickup && order.deliveryAddress) {
      doc.text(order.deliveryAddress, 20, 71)
    }

    // Add delivery method
    doc.text("Delivery Method:", 120, 50)
    doc.text(order.isPickup ? "Pickup" : "Delivery", 120, 57)
    if (!order.isPickup && order.deliveryTime) {
      doc.text(`Time: ${order.deliveryTime}`, 120, 64)
    }

    // Add items table
    const tableColumn = ["Item", "Qty", "Price", "Total"]
    const tableRows: any[] = []

    order.items.forEach((item) => {
      const itemData = [
        item.productId
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        item.quantity,
        formatCurrency(item.price),
        formatCurrency(item.total),
      ]
      tableRows.push(itemData)
    })

    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: "striped",
      headStyles: { fillColor: [160, 92, 101] },
    })

    // Add totals
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.text(`Subtotal: ${formatCurrency(order.subtotal)}`, 140, finalY, { align: "right" })

    if (order.discount > 0) {
      doc.text(`Discount: -${formatCurrency(order.discount)}`, 140, finalY + 7, { align: "right" })
      doc.text(`Total: ${formatCurrency(order.total)}`, 140, finalY + 14, { align: "right" })
    } else {
      doc.text(`Total: ${formatCurrency(order.total)}`, 140, finalY + 7, { align: "right" })
    }

    // Add payment info
    const paymentY = order.discount > 0 ? finalY + 24 : finalY + 17
    doc.text(`Payment Status: ${order.isPaid ? "Paid" : "Unpaid"}`, 20, paymentY)

    if (order.isPaid && order.paymentMethod) {
      doc.text(`Payment Method: ${order.paymentMethod}`, 20, paymentY + 7)

      if (order.referenceNumber) {
        doc.text(`Reference Number: ${order.referenceNumber}`, 20, paymentY + 14)
      }
    }

    // Add footer message
    const footerY = paymentY + 30
    doc.setFontSize(10)
    doc.text("Thank you for supporting our small business!", 105, footerY, { align: "center" })
    doc.text("Follow us on instagram @_murbakes and don't forget to tag us!", 105, footerY + 5, { align: "center" })

    // Save the PDF
    doc.save(`MurBakes_Invoice_${order.id}.pdf`)
  }

  return (
    <Button onClick={generatePDF} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export Invoice
    </Button>
  )
}
