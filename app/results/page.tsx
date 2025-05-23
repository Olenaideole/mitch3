"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertTriangle, XCircle, Award, Download, ArrowLeft, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IngredientBreakdown } from "@/components/ingredient-breakdown"
import { ExtractedText } from "@/components/extracted-text"

interface Ingredient {
  name: string
  contains_gluten: "yes" | "no" | "maybe"
  safety_level: "safe" | "caution" | "unsafe"
  description: string
  concerns: string
}

interface AnalysisResult {
  extracted_text: string
  gluten_detected: "yes" | "no" | "unknown"
  cross_contamination_risk: "low" | "medium" | "high" | "unknown"
  additives_detected: string[]
  diet_compatibility: {
    fodmap: "yes" | "no" | "unknown"
    lactose_free: "yes" | "no" | "unknown"
    keto: "yes" | "no" | "unknown"
  }
  certification: "yes" | "no" | "unknown"
  community_safe_rating: string
  ingredients_analysis: Ingredient[]
}

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get result from localStorage
    const storedResult = localStorage.getItem("analysisResult")

    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult)
        setResult(parsedResult)
      } catch (error) {
        console.error("Error parsing result:", error)
        router.push("/")
      }
    } else {
      // If no result, redirect to home
      router.push("/")
    }
  }, [router])

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p>Loading analysis results...</p>
        </div>
      </div>
    )
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-50 text-green-700"
      case "medium":
        return "bg-amber-50 text-amber-700"
      case "high":
        return "bg-red-50 text-red-700"
      case "unknown":
        return "bg-slate-100 text-slate-700"
      default:
        return "bg-slate-100"
    }
  }

  const getGlutenStatusIcon = (status: string) => {
    switch (status) {
      case "no":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "yes":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "unknown":
      default:
        return <HelpCircle className="h-5 w-5 text-slate-500" />
    }
  }

  const getGlutenStatusBadge = (status: string) => {
    switch (status) {
      case "no":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Not Detected
          </Badge>
        )
      case "yes":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Detected
          </Badge>
        )
      case "unknown":
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700">
            Unknown
          </Badge>
        )
    }
  }

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    alert("Coming soon")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex items-center justify-center py-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600">Mitch</span>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 flex items-center">
            <Button variant="ghost" onClick={() => router.push("/")} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Main
            </Button>
            <h1 className="text-2xl font-bold md:text-3xl">Your Food Analysis Report</h1>
          </div>

          <div className="mx-auto max-w-3xl">
            {/* Add the Extracted Text component */}
            {result.extracted_text && <ExtractedText text={result.extracted_text} />}

            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <span>Analysis Results</span>
                  {result.gluten_detected === "no" ? (
                    <Badge className="bg-green-100 text-green-800">Safe</Badge>
                  ) : result.gluten_detected === "yes" ? (
                    <Badge className="bg-red-100 text-red-800">Contains Gluten</Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-800">Unclear</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getGlutenStatusIcon(result.gluten_detected)}
                      <span className="font-medium">Gluten Status</span>
                    </div>
                    {getGlutenStatusBadge(result.gluten_detected)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <span className="font-medium">Cross-Contamination Risk</span>
                    </div>
                    <Badge variant="outline" className={getRiskColor(result.cross_contamination_risk)}>
                      {result.cross_contamination_risk === "unknown"
                        ? "Unknown"
                        : `${
                            result.cross_contamination_risk.charAt(0).toUpperCase() +
                            result.cross_contamination_risk.slice(1)
                          } Risk`}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Additives Detected</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.additives_detected && result.additives_detected.length > 0 ? (
                        result.additives_detected.map((additive, index) => (
                          <Badge key={index} variant="outline" className="bg-slate-100">
                            {additive}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          None Detected
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Certified GF Label</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        result.certification === "yes"
                          ? "bg-blue-50 text-blue-700"
                          : result.certification === "unknown"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-slate-100"
                      }
                    >
                      {result.certification === "yes" ? "Yes" : result.certification === "unknown" ? "Unknown" : "No"}
                    </Badge>
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-50 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">Community Safety Rating</span>
                      <span className="text-sm font-bold text-green-600">{result.community_safe_rating}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: result.community_safe_rating }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-3 text-center">
                      <p className="mb-1 text-xs text-muted-foreground">FODMAP Friendly</p>
                      <p className="font-medium">
                        {result.diet_compatibility.fodmap === "yes"
                          ? "Yes"
                          : result.diet_compatibility.fodmap === "unknown"
                            ? "Unknown"
                            : "No"}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="mb-1 text-xs text-muted-foreground">Lactose Free</p>
                      <p className="font-medium">
                        {result.diet_compatibility.lactose_free === "yes"
                          ? "Yes"
                          : result.diet_compatibility.lactose_free === "unknown"
                            ? "Unknown"
                            : "No"}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="mb-1 text-xs text-muted-foreground">Keto Friendly</p>
                      <p className="font-medium">
                        {result.diet_compatibility.keto === "yes"
                          ? "Yes"
                          : result.diet_compatibility.keto === "unknown"
                            ? "Unknown"
                            : "No"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add the Ingredient Breakdown component */}
            <IngredientBreakdown ingredients={result.ingredients_analysis || []} />

            <div className="mt-6 flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Main
              </Button>
              <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4" />
                Save Report (PDF)
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Mitch — Your Personal Food Assistant for Celiac Disease</p>
        </div>
      </footer>
    </div>
  )
}
