"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Calendar, ArrowLeft, Loader2, AlertCircle, Upload, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/header"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"

// Check if we're in a preview environment
const isPreview = typeof window !== "undefined" && window.location.hostname.includes("v0.dev")

// Mock scan data for preview
const mockScans = [
  {
    id: "1",
    created_at: new Date().toISOString(),
    image_url: "/placeholder.svg?height=300&width=400",
    result: {
      gluten_detected: "no",
      extracted_text: "INGREDIENTS: Water, Rice Flour, Tapioca Starch, Potato Starch, Vegetable Oil...",
    },
    user_id: "mock-user-id",
  },
  {
    id: "2",
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    image_url: "/placeholder.svg?height=300&width=400",
    result: {
      gluten_detected: "yes",
      extracted_text: "INGREDIENTS: Wheat Flour, Water, Salt, Yeast...",
    },
    user_id: "mock-user-id",
  },
]

interface ScanRecord {
  id: string
  created_at: string
  image_url: string
  result: any
  user_id: string
}

export default function Dashboard() {
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  // Only run on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Redirect to sign in if not authenticated
    if (!user) {
      router.push("/signin")
    }
  }, [user, mounted, router])

  useEffect(() => {
    if (!mounted || !user) return

    async function fetchScans() {
      try {
        setLoading(true)
        setError(null)

        // In preview mode, use mock data
        if (isPreview) {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000))
          setScans(mockScans)
          setLoading(false)
          return
        }

        // Dynamically import to prevent any SSR issues
        const { getSupabaseBrowser } = await import("@/lib/supabase-browser")
        const supabase = getSupabaseBrowser()

        if (!supabase) {
          throw new Error("Could not initialize Supabase client")
        }

        const { data, error } = await supabase
          .from("scans")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setScans(data || [])
      } catch (err) {
        console.error("Error fetching scans:", err)
        setError("Failed to load your scan history. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchScans()
  }, [mounted, user])

  const handleDeleteScan = async () => {
    if (!deleteId || !mounted || !user) return

    try {
      setIsDeleting(true)

      // In preview mode, just update local state
      if (isPreview) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setScans(scans.filter((scan) => scan.id !== deleteId))
        setIsDeleteDialogOpen(false)
        setIsDeleting(false)
        setDeleteId(null)
        return
      }

      // Dynamically import to prevent any SSR issues
      const { getSupabaseBrowser } = await import("@/lib/supabase-browser")
      const supabase = getSupabaseBrowser()

      if (!supabase) {
        throw new Error("Could not initialize Supabase client")
      }

      const { error } = await supabase.from("scans").delete().eq("id", deleteId)

      if (error) {
        throw error
      }

      // Update local state
      setScans(scans.filter((scan) => scan.id !== deleteId))
      setIsDeleteDialogOpen(false)
    } catch (err) {
      console.error("Error deleting scan:", err)
      setError("Failed to delete scan. Please try again.")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getGlutenStatusBadge = (status: string) => {
    switch (status) {
      case "no":
        return <Badge className="bg-green-100 text-green-800">Safe</Badge>
      case "yes":
        return <Badge className="bg-red-100 text-red-800">Contains Gluten</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800">Unclear</Badge>
    }
  }

  if (!mounted) {
    return null // Don't render anything on the server
  }

  if (!user) {
    return null // Don't render if not authenticated
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-slate-50">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 flex items-center">
            <Button variant="ghost" onClick={() => router.push("/")} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold md:text-3xl">Your Scan History</h1>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>Loading your scan history...</span>
            </div>
          ) : scans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Camera className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-medium">No scan history yet</h3>
                <p className="mb-6 max-w-md text-muted-foreground">
                  Start building your personal food safety database by scanning your first food label. Each scan is
                  saved here for easy reference.
                </p>
                <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700" size="lg">
                  <Upload className="mr-2 h-4 w-4" />
                  Scan Your First Label
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {scans.map((scan) => (
                <Card key={scan.id} className="overflow-hidden">
                  <div className="relative h-48 bg-slate-200">
                    {scan.image_url ? (
                      <img
                        src={scan.image_url || "/placeholder.svg"}
                        alt="Food label"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-sm text-muted-foreground">No image available</span>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {getGlutenStatusBadge(scan.result?.gluten_detected || "unknown")}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground"
                        onClick={() => {
                          setDeleteId(scan.id)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDate(scan.created_at)}
                      </div>
                      <p className="line-clamp-2 text-sm">
                        {scan.result?.extracted_text?.substring(0, 100) || "No text extracted"}
                        {scan.result?.extracted_text?.length > 100 ? "..." : ""}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => {
                          // Store the result in localStorage and navigate to results page
                          localStorage.setItem("analysisResult", JSON.stringify(scan.result))
                          router.push("/results")
                        }}
                      >
                        View Full Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scan Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scan record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteScan} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
