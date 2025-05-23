import { Camera, Search, FileText } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: <Camera className="h-10 w-10 text-blue-600" />,
      title: "Take or upload a photo",
      description: "Take or upload a photo of the food label.",
    },
    {
      icon: <Search className="h-10 w-10 text-blue-600" />,
      title: "AI Analysis",
      description: "Mitch scans ingredients & detects hidden threats using AI.",
    },
    {
      icon: <FileText className="h-10 w-10 text-blue-600" />,
      title: "Get Your Report",
      description: "Get a clear, expert-grade report in seconds.",
    },
  ]

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">{step.icon}</div>
          <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
          <p className="text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </div>
  )
}
