import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Celiac & Gluten-Free Guide — Blog by Orb Super Ai",
  description:
    "Learn about celiac disease, gluten intolerance, and how to maintain a safe gluten-free diet with our expert guides.",
  keywords: "gluten-free, celiac, gluten intolerance, gluten-free diet, safe ingredients, symptoms, gluten-free foods",
}

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
