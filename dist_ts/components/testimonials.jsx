import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
export function Testimonials() {
    const testimonials = [
        {
            name: "Sarah M.",
            text: "Lifesaver for my celiac diagnosis! I can finally shop with confidence.",
            rating: 5,
        },
        {
            name: "Michael T.",
            text: "This app has saved me from so many hidden gluten sources. Worth every penny!",
            rating: 5,
        },
        {
            name: "Jessica L.",
            text: "I love how it detects cross-contamination risks. My symptoms have decreased dramatically.",
            rating: 5,
        },
    ];
    return (<div className="grid gap-6 md:grid-cols-3">
      {testimonials.map((testimonial, index) => (<Card key={index}>
          <CardContent className="p-6">
            <div className="mb-2 flex">
              {Array.from({ length: testimonial.rating }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400"/>))}
            </div>
            <p className="mb-4 text-sm">{testimonial.text}</p>
            <p className="text-sm font-medium">— {testimonial.name}</p>
          </CardContent>
        </Card>))}
    </div>);
}
