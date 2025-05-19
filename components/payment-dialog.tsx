"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Order, PaymentMethod } from "@/lib/data"

interface PaymentDialogProps {
  order: Order
  updateOrderPayment: (orderId: string, isPaid: boolean, paymentMethod?: string, referenceNumber?: string) => void
  onClose: () => void
}

export function PaymentDialog({ order, updateOrderPayment, onClose }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(order.paymentMethod || "Cash")
  const [referenceNumber, setReferenceNumber] = useState<string>(order.referenceNumber || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateOrderPayment(order.id, true, paymentMethod, referenceNumber)
    onClose() // Close the dialog after submitting
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogDescription>
          Record payment details for order #{order.id} for {order.customerName}.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="payment-method">Payment Method</Label>
          <RadioGroup
            id="payment-method"
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="GCash" id="gcash" />
              <Label htmlFor="gcash">GCash</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="BDO" id="bdo" />
              <Label htmlFor="bdo">BDO</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="UnionBank" id="unionbank" />
              <Label htmlFor="unionbank">UnionBank</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Cash" id="cash" />
              <Label htmlFor="cash">Cash</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>
        </div>
        {paymentMethod !== "Cash" && (
          <div className="grid gap-2">
            <Label htmlFor="reference-number">Reference Number</Label>
            <Input
              id="reference-number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Enter reference number"
            />
          </div>
        )}
      </div>
      <DialogFooter>
        <Button type="submit">Mark as Paid</Button>
      </DialogFooter>
    </form>
  )
}
