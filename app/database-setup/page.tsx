"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Database, ExternalLink, FileCode } from "lucide-react"
import { useStore } from "@/lib/context"
import { useState, useEffect } from "react"
import { initializeDatabase } from "@/lib/actions"

export default function DatabaseSetupPage() {
  const { isUsingFallbackData } = useStore()
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function checkDatabase() {
      try {
        setDbStatus("checking")
        setMessage("Checking database connection...")

        const result = await initializeDatabase()

        if (result) {
          setDbStatus("connected")
          setMessage("Database initialized successfully!")
        } else {
          console.log("Failed to initialize database.");
          setDbStatus("error")
          setMessage("Failed to initialize database.")
        }
      } catch (error) {
        console.error("Database check error:", error)
        setDbStatus("error")
        setMessage("Error connecting to database: " + (error as Error).message)
      }
    }

    checkDatabase()
  }, [])

  return (
    <main className="min-h-screen bg-[#f9f3ee] p-4 md:p-8">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-script text-[#a05c65] mb-2">MurBakes</h1>
          <p className="text-sm text-muted-foreground">Database Setup & Diagnostics</p>
        </div>

        {isUsingFallbackData && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Using Local Data Mode</AlertTitle>
            <AlertDescription>
              The application is currently using local data storage because it couldn't connect to the SQLite database.
              Use the tools below to diagnose and fix the connection issues.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="diagnostics" className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="diagnostics">Connection Diagnostics</TabsTrigger>
            <TabsTrigger value="setup">Database Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostics">
            <Card>
              <CardHeader>
                <CardTitle>SQLite Database Status</CardTitle>
                <CardDescription>Check the connection status of your SQLite database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        dbStatus === "checking"
                          ? "bg-yellow-500"
                          : dbStatus === "connected"
                            ? "bg-green-500"
                            : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium">
                        {dbStatus === "checking"
                          ? "Checking connection..."
                          : dbStatus === "connected"
                            ? "Connected"
                            : "Connection Error"}
                      </p>
                      <p className="text-sm text-muted-foreground">{message}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => window.location.reload()} disabled={dbStatus === "checking"}>
                  Refresh Status
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="setup">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="h-5 w-5" />
                    Database Schema
                  </CardTitle>
                  <CardDescription>SQLite database structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    The application uses SQLite for data storage with the following tables:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>products</li>
                    <li>orders</li>
                    <li>order_items</li>
                    <li>bake_sale_periods</li>
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    The database is automatically initialized when the application starts.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={async () => {
                      try {
                        setDbStatus("checking")
                        setMessage("Initializing database...")

                        const result = await initializeDatabase()

                        if (result) {
                          setDbStatus("connected")
                          setMessage("Database initialized successfully!")
                        } else {
                          setDbStatus("error")
                          setMessage("Failed to initialize database.")
                        }
                      } catch (error) {
                        console.error("Database initialization error:", error)
                        setDbStatus("error")
                        setMessage("Error initializing database: " + (error as Error).message)
                      }
                    }}
                    disabled={dbStatus === "checking"}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Initialize Database
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    About SQLite
                  </CardTitle>
                  <CardDescription>Compact, serverless database</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      SQLite is a C library that provides a lightweight disk-based database that doesn't require a
                      separate server process. It's self-contained, serverless, zero-configuration, and transactional.
                    </p>

                    <div className="p-3 border rounded-md">
                      <h3 className="font-medium mb-1">Benefits of SQLite</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        <li>Zero configuration - no setup or administration needed</li>
                        <li>Serverless - no separate server process</li>
                        <li>Single file - entire database in a single cross-platform file</li>
                        <li>Stable, portable, and compact</li>
                        <li>Excellent for development, testing, and small to medium applications</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => window.open("https://www.sqlite.org/", "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learn More About SQLite
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
