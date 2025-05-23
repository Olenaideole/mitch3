"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sparkles, CheckCircle, Shield } from "lucide-react"

export function BetaModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Submit the form data to Formspree
      const response = await fetch("https://formspree.io/f/manozdqa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSuccess(true)
        setFormData({ name: "", email: "" })
      } else {
        console.error("Form submission failed")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIsSuccess(false)
    setFormData({ name: "", email: "" })
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset the form when the modal is closed
      setTimeout(resetForm, 300)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-lg font-medium hover:from-blue-700 hover:to-purple-700"
          onClick={() => setIsOpen(true)}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Join Beta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Join Orb Super Ai Beta</DialogTitle>
          <DialogDescription className="text-center">
            Be the first to try our personalized general AI assistant.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-medium">Thanks for joining the waitlist!</h3>
            <p className="text-muted-foreground">We'll notify you as soon as Orb Super Ai App beta is available.</p>
            <Button className="mt-6" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" required />
              <Label
                htmlFor="terms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <Popover open={termsOpen} onOpenChange={setTermsOpen}>
                  <PopoverTrigger asChild>
                    <span className="cursor-pointer text-blue-600 hover:underline">Privacy & Terms</span>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <div className="space-y-4 p-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium">Privacy Policy & Terms</h4>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto rounded-md bg-slate-50 p-3 text-sm">
                        <p className="leading-relaxed">
                          We respect your privacy. Any personal data you provide will be treated as strictly
                          confidential and used only to deliver and improve our services. We will never sell, share, or
                          disclose your personal data to third parties without your explicit permission. By continuing
                          to use this site, you agree to our terms of service and privacy policy. You may contact us
                          anytime to review or delete your personal data.
                        </p>
                      </div>
                      <Button size="sm" className="w-full" onClick={() => setTermsOpen(false)}>
                        Close
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </Label>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? "Submitting..." : "Join Waitlist"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
