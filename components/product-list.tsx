"use client"

import type React from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"
import { Plus, Edit, Package, Grid, List, Search, RefreshCw } from "lucide-react"
import Image from "next/image"
import { useStore } from "@/lib/context"
import { useState } from "react"
import { LoadingSpinner } from "./loading-spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"


export default function ProductList() {
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    updateProductStock,
    resetProductStock,
    bakeSalePeriods,
    activeBakeSalePeriod,
  } = useStore()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")

  if (loading) {
    return <LoadingSpinner className="h-64" />
  }

  const handleUpdateStock = (id: string, newStock: number) => {
    updateProductStock(id, newStock)
  }

  const handleResetStock = (id: string) => {
    resetProductStock(id)
  }

  const handleAddProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: product.name.toLowerCase().replace(/\s+/g, "-"),
    }
    addProduct(newProduct)
  }

  const handleEditProduct = (product: Product) => {
    updateProduct(product.id, product)
    setEditingProduct(null)
  }

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch = searchQuery === "" || product.name.toLowerCase().includes(searchQuery.toLowerCase())

    // Category filter
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

    // Stock filter
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in-stock" && product.stock > 0) ||
      (stockFilter === "low-stock" && product.stock > 0 && product.stock <= 5) ||
      (stockFilter === "out-of-stock" && product.stock === 0)

    return matchesSearch && matchesCategory && matchesStock
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-muted" : ""}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("table")}
            className={viewMode === "table" ? "bg-muted" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <ProductForm
                onSubmit={handleAddProduct}
                title="Add New Product"
                description="Add a new cookie to your product catalog."
                buttonText="Add Product"
                bakeSalePeriods={bakeSalePeriods}
                activeBakeSalePeriod={activeBakeSalePeriod}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="nut">Nut Series</SelectItem>
            <SelectItem value="oat">Oat Series</SelectItem>
            <SelectItem value="new">New Products</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock Levels</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock (≤ 5)</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or add a new product.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square relative bg-muted">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                {product.isLimited && <Badge className="absolute top-2 right-2 bg-amber-500">Limited Edition</Badge>}
                <Badge className="absolute top-2 left-2" variant="outline">
                  {product.category === "nut" ? "Nut Series" : product.category === "oat" ? "Oat Series" : "New!"}
                </Badge>
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge className="bg-red-500 text-lg py-1 px-3">Out of Stock</Badge>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{formatCurrency(product.price)} per cookie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={`text-sm ${product.stock <= 5 && product.stock > 0 ? "text-amber-500 font-medium" : product.stock === 0 ? "text-red-500 font-medium" : ""}`}
                  >
                    {product.stock} in stock
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setEditingProduct(product)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogHeader>
                    <VisuallyHidden>
                      <DialogTitle>Edit Product</DialogTitle>
                    </VisuallyHidden>
                  </DialogHeader>
                  <DialogContent key={editingProduct?.id}>
                    {editingProduct && (
                      <ProductForm
                        product={editingProduct}
                        onSubmit={handleEditProduct}
                        title="Edit Product"
                        description="Update your product details."
                        buttonText="Save Changes"
                        bakeSalePeriods={bakeSalePeriods}
                        activeBakeSalePeriod={activeBakeSalePeriod}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Update Stock</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Stock for {product.name}</DialogTitle>
                      <DialogDescription>Adjust the current stock level for this product.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current-stock">Current Stock</Label>
                        <Input id="current-stock" value={product.stock} disabled />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-stock">New Stock</Label>
                        <Input id="new-stock" type="number" min="0" defaultValue={product.stock} />
                      </div>
                    </div>
                    <DialogFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => handleResetStock(product.id)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset to Initial
                      </Button>
                      <Button
                        onClick={() => {
                          const newStock = Number.parseInt(
                            (document.getElementById("new-stock") as HTMLInputElement).value,
                          )
                          handleUpdateStock(product.id, newStock)
                        }}
                      >
                        Update Stock
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 relative rounded overflow-hidden">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.isLimited && <Badge className="bg-amber-500 mt-1">Limited Edition</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.category === "nut" ? "Nut Series" : product.category === "oat" ? "Oat Series" : "New!"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <span
                      className={`${product.stock <= 5 && product.stock > 0 ? "text-amber-500 font-medium" : product.stock === 0 ? "text-red-500 font-medium" : ""}`}
                    >
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          {editingProduct && (
                            <ProductForm
                              product={editingProduct}
                              onSubmit={handleEditProduct}
                              title="Edit Product"
                              description="Update your product details."
                              buttonText="Save Changes"
                              bakeSalePeriods={bakeSalePeriods}
                              activeBakeSalePeriod={activeBakeSalePeriod}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">Stock</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Stock for {product.name}</DialogTitle>
                            <DialogDescription>Adjust the current stock level for this product.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor={`current-stock-${product.id}`}>Current Stock</Label>
                              <Input id={`current-stock-${product.id}`} value={product.stock} disabled />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor={`new-stock-${product.id}`}>New Stock</Label>
                              <Input
                                id={`new-stock-${product.id}`}
                                type="number"
                                min="0"
                                defaultValue={product.stock}
                              />
                            </div>
                          </div>
                          <DialogFooter className="flex justify-between">
                            <Button variant="outline" onClick={() => handleResetStock(product.id)}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Reset to Initial
                            </Button>
                            <Button
                              onClick={() => {
                                const newStock = Number.parseInt(
                                  (document.getElementById(`new-stock-${product.id}`) as HTMLInputElement).value,
                                )
                                handleUpdateStock(product.id, newStock)
                              }}
                            >
                              Update Stock
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

interface ProductFormProps {
  product?: Product
  onSubmit: (product: any) => void
  title: string
  description: string
  buttonText: string
  bakeSalePeriods: any[]
  activeBakeSalePeriod: any
}

function ProductForm({
  product,
  onSubmit,
  title,
  description,
  buttonText,
  bakeSalePeriods,
  activeBakeSalePeriod,
}: ProductFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const stock = Number.parseInt(formData.get("stock") as string)

    const newProduct = {
      name: formData.get("name") as string,
      category: formData.get("category") as "nut" | "oat" | "new",
      price: Number.parseInt(formData.get("price") as string),
      stock: stock,
      initialStock: stock,
      image: "/placeholder.svg?height=100&width=100",
      isLimited: formData.get("isLimited") === "on",
      ...(product && { id: product.id }),
    }

    onSubmit(newProduct)
    form.reset()
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" defaultValue={product?.category || "nut"}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nut">Nut Series</SelectItem>
              <SelectItem value="oat">Oat Series</SelectItem>
              <SelectItem value="new">New</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="price">Price (₱)</Label>
          <Input id="price" name="price" type="number" min="0" defaultValue={product?.price} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stock">Initial Stock</Label>
          <Input id="stock" name="stock" type="number" min="0" defaultValue={product?.stock} required />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isLimited"
            name="isLimited"
            className="h-4 w-4 rounded border-gray-300"
            defaultChecked={product?.isLimited}
          />
          <Label htmlFor="isLimited">Limited Edition</Label>
        </div>

        <div className="mt-2">
          <Label>Current Bake Sale Period</Label>
          <div className="mt-1 p-3 bg-muted rounded-md">
            {activeBakeSalePeriod ? (
              <div>
                <p className="font-medium">{activeBakeSalePeriod.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(activeBakeSalePeriod.startDate).toLocaleDateString()} -
                  {new Date(activeBakeSalePeriod.endDate).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active bake sale period</p>
            )}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">{buttonText}</Button>
      </DialogFooter>
    </form>
  )
}
