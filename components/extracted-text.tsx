"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useState } from "react"

interface ExtractedTextProps {
  text: string
}

export function ExtractedText({ text }: ExtractedTextProps) {
  const [copied, setCopied] = useState(false)

  if (!text) {
    return null
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Extracted Text</span>
          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 px-2">
            <Copy className="mr-1 h-4 w-4" />
            <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-60 overflow-y-auto rounded-md bg-slate-50 p-3 text-sm">
          {text.split("\n").map((line, i) => (
            <p key={i} className={line.trim() === "" ? "h-4" : ""}>
              {line}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
