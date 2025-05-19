"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertCircle, CheckCircle2, Database, RefreshCw, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PostgresDiagnostics() {
  const { toast } = useToast()
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [detailedStatus, setDetailedStatus] = useState<{
    url: "valid" | "invalid" | "missing" | "checking"
    connection: "success" | "failed" | "checking"
    tables: Record<string, boolean>
  }>({
    url: "checking",
    connection: "checking",
    tables: {
      products: false,
      orders: false,
      order_items: false,
      bake_sale_periods: false,
    },
  })
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState({
    url: process.env.POSTGRES_URL || "",
    user: process.env.POSTGRES_USER || "",
    password: process.env.POSTGRES_PASSWORD ? "Set (hidden)" : "Not set",
    host: process.env.POSTGRES_HOST || "",
    port: process.env.POSTGRES_PORT || "5432",
    database: process.env.POSTGRES_DATABASE || "",
  })

  const checkConnection = async () => {
    try {
      setStatus("checking")
      setErrorDetails(null)
      setDetailedStatus({
        url: "checking",
        connection: "checking",
        tables: {
          products: false,
          orders: false,
          order_items: false,
          bake_sale_periods: false,
        },
      })

      // Check URL
      const url = process.env.POSTGRES_URL
      if (!url) {
        setDetailedStatus((prev) => ({ ...prev, url: "missing" }))
        throw new Error("PostgreSQL URL is missing")
      }

      try {
        // Simple validation for PostgreSQL URL
        if (!url.startsWith("postgresql://")) {
          setDetailedStatus((prev) => ({ ...prev, url: "invalid" }))
          throw new Error(`Invalid PostgreSQL URL format: ${url}`)
        }
        setDetailedStatus((prev) => ({ ...prev, url: "valid" }))
      } catch (err) {
        setDetailedStatus((prev) => ({ ...prev, url: "invalid" }))
        throw new Error(`Invalid PostgreSQL URL format: ${url}`)
      }

      // Test connection
      const connectionResponse = await fetch("/api/check-postgres-connection")
      const connectionData = await connectionResponse.json()

      if (!connectionData.success) {
        setDetailedStatus((prev) => ({ ...prev, connection: "failed" }))
        throw new Error(connectionData.error || "Failed to connect to PostgreSQL")
      }

      setDetailedStatus((prev) => ({ ...prev, connection: "success" }))

      // Check tables
      const tablesResponse = await fetch("/api/check-postgres-tables")
      const tablesData = await tablesResponse.json()

      if (tablesData.success) {
        setDetailedStatus((prev) => ({ ...prev, tables: tablesData.tables }))
      } else {
        throw new Error(tablesData.error || "Failed to check PostgreSQL tables")
      }

      // All checks passed
      setStatus("connected")
    } catch (err) {
      console.error("Diagnostic error:", err)
      setStatus("error")
      setErrorDetails(err instanceof Error ? err.message : "Unknown error")
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description,
        })
      },
      (err) => {
        toast({
          title: "Failed to copy",
          description: "Please copy manually",
          variant: "destructive",
        })
      },
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          PostgreSQL Connection Diagnostics
        </CardTitle>
        <CardDescription>Detailed diagnostics for your PostgreSQL connection</CardDescription>
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

        {status === "error" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{errorDetails || "Failed to connect to PostgreSQL. See details below."}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="environment" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
          </TabsList>

          <TabsContent value="environment">
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">POSTGRES_URL</h3>
                    <p className="text-sm text-muted-foreground">
                      {detailedStatus.url === "valid"
                        ? "✅ Valid URL format"
                        : detailedStatus.url === "invalid"
                          ? "❌ Invalid URL format"
                          : detailedStatus.url === "missing"
                            ? "❌ Missing"
                            : "Checking..."}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(envVars.url, "URL copied to clipboard")}
                    disabled={!envVars.url}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-2 bg-muted rounded text-sm font-mono break-all">{envVars.url || "Not set"}</div>
                {detailedStatus.url === "invalid" && (
                  <p className="text-sm text-red-600 mt-2">
                    The URL must be a valid PostgreSQL URL (postgresql://username:password@host:port/database)
                  </p>
                )}
              </div>

              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Individual Connection Parameters</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These are used as an alternative to the connection string:
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">POSTGRES_USER:</span>
                    <span className="text-sm font-mono">{envVars.user || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">POSTGRES_PASSWORD:</span>
                    <span className="text-sm font-mono">{envVars.password}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">POSTGRES_HOST:</span>
                    <span className="text-sm font-mono">{envVars.host || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">POSTGRES_PORT:</span>
                    <span className="text-sm font-mono">{envVars.port || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">POSTGRES_DATABASE:</span>
                    <span className="text-sm font-mono">{envVars.database || "Not set"}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="connection">
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Connection Status</h3>
                {detailedStatus.connection === "checking" ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Testing connection...
                  </div>
                ) : detailedStatus.connection === "success" ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Successfully connected to PostgreSQL
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    Failed to connect to PostgreSQL
                  </div>
                )}
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="troubleshooting">
                  <AccordionTrigger>Troubleshooting Steps</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-medium">1. Check Environment Variables</h4>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>
                            Ensure POSTGRES_URL is in the format: postgresql://username:password@host:port/database
                          </li>
                          <li>Or set individual connection parameters (POSTGRES_USER, POSTGRES_PASSWORD, etc.)</li>
                          <li>Check for any whitespace or special characters</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">2. Verify PostgreSQL Server</h4>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Confirm your PostgreSQL server is running</li>
                          <li>Check if you can connect using psql or another client</li>
                          <li>Verify the database exists</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">3. Network Issues</h4>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Check if PostgreSQL is listening on the specified port</li>
                          <li>Verify there are no firewall restrictions</li>
                          <li>For local development, try using 'localhost' instead of IP address</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">4. Authentication</h4>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Verify username and password are correct</li>
                          <li>Check PostgreSQL's pg_hba.conf file for authentication settings</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="tables">
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Database Tables</h3>
                <div className="space-y-2">
                  {Object.entries(detailedStatus.tables).map(([table, exists]) => (
                    <div key={table} className="flex items-center gap-2">
                      {exists ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-mono">{table}</span>
                      <span className="text-sm text-muted-foreground">
                        {exists ? "Table exists" : "Table not found"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Create Missing Tables</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  If tables are missing, you can create them using the SQL setup script:
                </p>
                <Button variant="outline" className="w-full" onClick={() => window.open("/sql/schema.sql", "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View SQL Schema
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={checkConnection} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Run Diagnostics Again
        </Button>
      </CardFooter>
    </Card>
  )
}
