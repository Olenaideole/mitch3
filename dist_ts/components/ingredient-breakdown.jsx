"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
export function IngredientBreakdown({ ingredients }) {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!ingredients || ingredients.length === 0) {
        return (<Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Ingredient Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No ingredient information available.</p>
        </CardContent>
      </Card>);
    }
    const getSafetyIcon = (safetyLevel) => {
        switch (safetyLevel) {
            case "safe":
                return <CheckCircle className="h-5 w-5 text-green-500"/>;
            case "caution":
                return <AlertTriangle className="h-5 w-5 text-amber-500"/>;
            case "unsafe":
                return <XCircle className="h-5 w-5 text-red-500"/>;
            default:
                return <Info className="h-5 w-5 text-slate-500"/>;
        }
    };
    const getSafetyBadge = (safetyLevel) => {
        switch (safetyLevel) {
            case "safe":
                return (<Badge variant="outline" className="bg-green-50 text-green-700">
            Safe
          </Badge>);
            case "caution":
                return (<Badge variant="outline" className="bg-amber-50 text-amber-700">
            Caution
          </Badge>);
            case "unsafe":
                return (<Badge variant="outline" className="bg-red-50 text-red-700">
            Unsafe
          </Badge>);
            default:
                return (<Badge variant="outline" className="bg-slate-100">
            Unknown
          </Badge>);
        }
    };
    const getGlutenBadge = (containsGluten) => {
        switch (containsGluten) {
            case "no":
                return (<Badge variant="outline" className="bg-green-50 text-green-700">
            Gluten-Free
          </Badge>);
            case "yes":
                return (<Badge variant="outline" className="bg-red-50 text-red-700">
            Contains Gluten
          </Badge>);
            case "maybe":
                return (<Badge variant="outline" className="bg-amber-50 text-amber-700">
            May Contain Gluten
          </Badge>);
            default:
                return (<Badge variant="outline" className="bg-slate-100">
            Unknown
          </Badge>);
        }
    };
    return (<Card className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Ingredient Breakdown</span>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 px-2">
            {isExpanded ? (<>
                <ChevronUp className="mr-1 h-4 w-4"/>
                <span className="text-xs">Collapse All</span>
              </>) : (<>
                <ChevronDown className="mr-1 h-4 w-4"/>
                <span className="text-xs">Expand All</span>
              </>)}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={isExpanded ? ingredients.map((_, i) => `item-${i}`) : []}>
          {ingredients.map((ingredient, index) => (<AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex w-full items-center justify-between pr-4">
                  <div className="flex items-center gap-2">
                    {getSafetyIcon(ingredient.safety_level)}
                    <span className="font-medium">{ingredient.name}</span>
                  </div>
                  <div className="flex gap-2">
                    {getSafetyBadge(ingredient.safety_level)}
                    {getGlutenBadge(ingredient.contains_gluten)}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 px-2 py-1">
                  <div>
                    <p className="text-sm text-muted-foreground">Description:</p>
                    <p className="text-sm">{ingredient.description}</p>
                  </div>
                  {ingredient.concerns && ingredient.concerns !== "None" && (<div>
                      <p className="text-sm font-medium text-red-600">Concerns:</p>
                      <p className="text-sm">{ingredient.concerns}</p>
                    </div>)}
                </div>
              </AccordionContent>
            </AccordionItem>))}
        </Accordion>
      </CardContent>
    </Card>);
}
