import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | undefined | null): string {
  const numeric = typeof amount === "number" ? amount : parseFloat(amount as string)

  if (isNaN(numeric)) return "₱0.00"
  return `₱${numeric.toFixed(2)}`
}

export function calculateDiscount(totalItems: number): number {
  return totalItems >= 8 ? 10 : 0
}

export function generateOrderId(): string {
  const prefix = "ORD-"
  const randomNum = Math.floor(100 + Math.random() * 900)
  return `${prefix}${randomNum}`
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Invalid date"

  const parsed =
    typeof date === "string"
      ? new Date(date.includes("T") ? date : `${date}T00:00:00`)
      : date

  if (isNaN(parsed.getTime())) return "Invalid date"

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed)
}
