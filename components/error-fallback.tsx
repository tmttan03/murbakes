"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary?: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Something went wrong</CardTitle>
        </div>
        <CardDescription>An error occurred while processing your request</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p>We're sorry, but we encountered an error. Please try again later.</p>
          {process.env.NODE_ENV !== "production" && (
            <pre className="mt-4 p-4 bg-muted rounded-md overflow-auto text-xs">{error.message}</pre>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {resetErrorBoundary && (
          <Button onClick={resetErrorBoundary} className="w-full">
            Try again
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
