import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
export const metadata = {
    title: "Celiac & Gluten-Free Guide — Blog by Orb Super Ai",
    description: "Learn about celiac disease, gluten intolerance, and how to maintain a safe gluten-free diet with our expert guides.",
};
const blogPosts = [
    {
        id: 1,
        title: "What Is Celiac Disease?",
        date: "May 15, 2023",
        content: [
            "Celiac disease is a serious autoimmune disorder where eating gluten triggers an immune response that damages the small intestine. People with celiac must follow a strict gluten-free diet, avoiding all foods containing wheat, barley, and rye. Even small traces of gluten can cause health issues. Learn how to check your food labels carefully and use tools like AI-powered food label scanners to stay safe.",
        ],
    },
    {
        id: 2,
        title: "Symptoms of Celiac Disease You Shouldn't Ignore",
        date: "June 3, 2023",
        content: [
            "The most common celiac symptoms include bloating, diarrhea, fatigue, skin rashes, and iron-deficiency anemia. Some people may not experience clear symptoms, which makes gluten intolerance harder to detect. If you suspect celiac or gluten sensitivity, consult a healthcare professional and consider trying a strict gluten-free diet. Always read food labels for hidden gluten ingredients.",
        ],
    },
    {
        id: 3,
        title: "What Foods Are Naturally Gluten-Free?",
        date: "July 12, 2023",
        content: [
            "Many delicious foods are naturally gluten-free, including fruits, vegetables, meat, fish, rice, quinoa, eggs, and dairy. However, it's essential to check packaged foods for hidden gluten, as even products labeled gluten-free can sometimes contain gluten through cross-contamination. Use a gluten-free food label assistant to double-check ingredients before eating.",
        ],
    },
    {
        id: 4,
        title: 'Can I Trust "Gluten-Free" Labels?',
        date: "August 24, 2023",
        content: [
            "Most certified gluten-free products meet strict safety standards, but it's still possible for products to be processed in facilities that handle gluten. Always read the full ingredient list carefully. Look out for hidden gluten ingredients like malt, modified food starch, or hydrolyzed wheat protein. Use apps or AI label scanners to help detect unsafe ingredients quickly.",
        ],
    },
    {
        id: 5,
        title: "Tips for Eating Out with Celiac Disease",
        date: "September 10, 2023",
        content: [
            "Dining out with celiac disease can be tricky. Always inform your server about your gluten intolerance and ask about gluten-free options and kitchen practices to avoid cross-contamination. Stick to simple, naturally gluten-free dishes like grilled meat, vegetables, and salads without croutons. Avoid fried or breaded foods unless certified gluten-free. Some restaurants now offer AI-powered gluten-free menus — check if your favorite spot does.",
        ],
    },
];
export default function BlogPage() {
    return (<div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-slate-50 pb-16 pt-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold md:text-4xl">Celiac & Gluten-Free Guide</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Expert advice on living with celiac disease and maintaining a gluten-free lifestyle
            </p>
          </div>

          <div className="space-y-12">
            {blogPosts.map((post) => (<article key={post.id} className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-blue-700">{post.title}</h2>
                {post.date && <p className="mb-4 mt-1 text-sm text-muted-foreground">{post.date}</p>}
                <div className="prose max-w-none">
                  {post.content.map((paragraph, index) => (<p key={index} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>))}
                </div>
                {/* Removed the "Read More" button div */}
              </article>))}
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Mitch — Your Personal Food Assistant for Celiac Disease</p>
        </div>
      </footer>
    </div>);
}
