"use client"

import { AlertCircle, CheckCircle2, Database, RefreshCw, ExternalLink } from "lucide-react"
import { useStore } from "@/lib/context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function DatabaseStatus() {
  const { isUsingFallbackData, refreshData } = useStore()
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [productCount, setProductCount] = useState<number | null>(null)
  const [orderCount, setOrderCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [missingEnvVars, setMissingEnvVars] = useState<string[]>([])

  const checkConnection = async () => {
    try {
      setStatus("checking")
      setError(null)
      setMissingEnvVars([])

      // Check if environment variables are set
      const missing: string[] = []
      if (!process.env.POSTGRES_URL) missing.push("POSTGRES_URL")

      if (missing.length > 0) {
        setMissingEnvVars(missing)
        setStatus("error")
        setError(`Missing environment variables: ${missing.join(", ")}`)
        return
      }

      // Check connection via API
      const connectionResponse = await fetch("/api/check-postgres-connection")
      const connectionData = await connectionResponse.json()

      if (!connectionData.success) {
        setStatus("error")
        setError(connectionData.error || "Failed to connect to PostgreSQL database")
        return
      }

      // Check tables and get counts
      const countsResponse = await fetch("/api/database-counts")
      const countsData = await countsResponse.json()

      if (!countsData.success) {
        setStatus("error")
        setError(countsData.error || "Failed to get database counts")
        return
      }

      setProductCount(countsData.productCount)
      setOrderCount(countsData.orderCount)
      setStatus("connected")
    } catch (err) {
      console.error("Database connection error:", err)
      setStatus("error")
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const handleRetryConnection = () => {
    checkConnection()
    refreshData()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
        </CardTitle>
        <CardDescription>Current connection status to the PostgreSQL database</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-medium">Status:</span>
          {status === "checking" ? (
            <Badge variant="outline" className="bg-muted">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Checking...
            </Badge>
          ) : status === "connected" ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Error
            </Badge>
          )}
        </div>

        {isUsingFallbackData && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Offline Mode</AlertTitle>
            <AlertDescription>
              Currently using local data. Changes will not be saved to the database and will be lost when you refresh
              the page.
            </AlertDescription>
          </Alert>
        )}

        {status === "connected" && !isUsingFallbackData && (
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 mb-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Connected</AlertTitle>
            <AlertDescription>
              Successfully connected to the PostgreSQL database. All changes will be saved.
            </AlertDescription>
          </Alert>
        )}

        {missingEnvVars.length > 0 && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            <p className="font-medium">Missing environment variables:</p>
            <ul className="list-disc list-inside mt-1">
              {missingEnvVars.map((variable) => (
                <li key={variable}>{variable}</li>
              ))}
            </ul>
            <p className="mt-2">Please add these variables to your .env.local file.</p>
          </div>
        )}

        {status === "connected" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Products:</span>
              <span className="font-medium">{productCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Orders:</span>
              <span className="font-medium">{orderCount}</span>
            </div>
          </div>
        )}

        {status === "error" && !missingEnvVars.length && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error || "Failed to connect to database. Please check your configuration."}
          </div>
        )}

        {isUsingFallbackData && (
          <div className="mt-4 text-sm">
            <p className="font-medium mb-2">Possible reasons for connection failure:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Missing or invalid PostgreSQL URL</li>
              <li>PostgreSQL server is not running</li>
              <li>Network connectivity issues</li>
              <li>Authentication failed</li>
              <li>Database tables might not exist yet</li>
            </ul>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
              <p className="font-medium">Need more help?</p>
              <p className="mt-1">Visit our database setup page for detailed diagnostics and setup instructions.</p>
              <Link href="/database-setup" className="mt-2 inline-flex items-center text-blue-600 hover:underline">
                Go to Database Setup
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={handleRetryConnection} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
        <Link href="/database-setup" passHref>
          <Button variant="outline" className="flex-1">
            <Database className="h-4 w-4 mr-2" />
            Database Setup
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
