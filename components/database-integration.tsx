"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Check, AlertTriangle, ExternalLink } from "lucide-react"
import DatabaseStatus from "./database-status"
import { useStore } from "@/lib/context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DatabaseIntegration() {
  const { isUsingFallbackData } = useStore()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Database Integration</h2>
      </div>

      {isUsingFallbackData && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Using Local Data Mode</AlertTitle>
          <AlertDescription className="text-amber-700">
            The application is currently using local data storage because it couldn't connect to the Supabase database.
            All changes will be stored in memory and will be lost when you refresh the page.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <DatabaseStatus />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase Integration
            </CardTitle>
            <CardDescription>
              {isUsingFallbackData
                ? "Connection to Supabase database failed. Using local data instead."
                : "Your application is connected to Supabase PostgreSQL database"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-medium">Features Available</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check
                    className={`h-5 w-5 ${isUsingFallbackData ? "text-amber-500" : "text-green-500"} shrink-0 mt-0.5`}
                  />
                  <span>
                    {isUsingFallbackData
                      ? "Local data storage (changes will be lost on refresh)"
                      : "Persistent data storage across sessions and devices"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check
                    className={`h-5 w-5 ${isUsingFallbackData ? "text-amber-500" : "text-green-500"} shrink-0 mt-0.5`}
                  />
                  <span>
                    {isUsingFallbackData
                      ? "Basic data operations (add, update, delete)"
                      : "Secure database access with Row Level Security"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check
                    className={`h-5 w-5 ${isUsingFallbackData ? "text-amber-500" : "text-green-500"} shrink-0 mt-0.5`}
                  />
                  <span>
                    {isUsingFallbackData ? "In-memory data management" : "Real-time data synchronization capabilities"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check
                    className={`h-5 w-5 ${isUsingFallbackData ? "text-amber-500" : "text-green-500"} shrink-0 mt-0.5`}
                  />
                  <span>
                    {isUsingFallbackData
                      ? "Local image references (no upload capability)"
                      : "Storage for order images and files"}
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>
              Open Supabase Dashboard
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Setup</CardTitle>
          <CardDescription>
            {isUsingFallbackData
              ? "Configure these environment variables to connect to your Supabase database"
              : "Your environment variables are properly configured"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Make sure the following environment variables are set in your Vercel project settings:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-mono text-sm mb-1">NEXT_PUBLIC_SUPABASE_URL</p>
                <p className="text-xs text-muted-foreground">Your Supabase project URL</p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-mono text-sm mb-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
                <p className="text-xs text-muted-foreground">Your Supabase anonymous key</p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-mono text-sm mb-1">SUPABASE_SERVICE_ROLE_KEY</p>
                <p className="text-xs text-muted-foreground">Your Supabase service role key (for server operations)</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open("https://vercel.com/docs/projects/environment-variables", "_blank")}
          >
            Learn About Environment Variables
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
