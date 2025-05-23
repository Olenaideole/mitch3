"use client"

import { BetaModal } from "@/components/beta-modal"
import { Sparkles } from "lucide-react"

export function BetaFooter() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Be the first to try Orb Super Ai App</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
          Your personalized general AI assistant. Join our beta today!
        </p>
        <BetaModal />
      </div>
    </section>
  )
}
