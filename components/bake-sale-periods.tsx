"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/context"
import { LoadingSpinner } from "./loading-spinner"
import { CalendarIcon, Check, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { BakeSalePeriod } from "@/lib/data"

export default function BakeSalePeriods() {
  const {
    bakeSalePeriods,
    activeBakeSalePeriod,
    loading,
    addBakeSalePeriod,
    updateBakeSalePeriod,
    setActiveBakeSalePeriod,
  } = useStore()
  const [newPeriod, setNewPeriod] = useState<Partial<BakeSalePeriod>>({
    name: "",
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    isActive: false,
  })

  if (loading) {
    return <LoadingSpinner className="h-64" />
  }

  const handleAddPeriod = () => {
    if (!newPeriod.name) {
      return
    }

    const period: BakeSalePeriod = {
      id: `period-${Date.now()}`,
      name: newPeriod.name || "New Bake Sale",
      startDate: newPeriod.startDate || new Date(),
      endDate: newPeriod.endDate || new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: newPeriod.isActive || false,
    }

    addBakeSalePeriod(period)

    // Reset form
    setNewPeriod({
      name: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: false,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Bake Sale Periods</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Period
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bake Sale Period</DialogTitle>
              <DialogDescription>Create a new bake sale period to track revenue and orders</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="period-name">Period Name</Label>
                <Input
                  id="period-name"
                  value={newPeriod.name}
                  onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })}
                  placeholder="e.g., January 2023 Bake Sale"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !newPeriod.startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newPeriod.startDate ? format(newPeriod.startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newPeriod.startDate}
                        onSelect={(date) => setNewPeriod({ ...newPeriod, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !newPeriod.endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newPeriod.endDate ? format(newPeriod.endDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newPeriod.endDate}
                        onSelect={(date) => setNewPeriod({ ...newPeriod, endDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddPeriod} disabled={!newPeriod.name}>
                Add Period
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bakeSalePeriods.map((period) => (
          <Card key={period.id} className={cn(period.isActive && "border-green-500")}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{period.name}</CardTitle>
                {period.isActive && <Badge className="bg-green-500">Active</Badge>}
              </div>
              <CardDescription>
                {format(new Date(period.startDate ?? ""), "PPP")} - {format(new Date(period.endDate ?? ""), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {period.isActive
                  ? "This is the current active bake sale period. All new orders will be associated with this period."
                  : "Set this period as active to associate new orders with it."}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {!period.isActive && (
                <Button variant="outline" onClick={() => setActiveBakeSalePeriod(period.id)}>
                  Set as Active
                </Button>
              )}
              {period.isActive && (
                <Button variant="outline" disabled>
                  <Check className="mr-2 h-4 w-4" />
                  Active Period
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
