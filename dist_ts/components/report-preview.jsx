import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Award } from "lucide-react";
export function ReportPreview() {
    return (<Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Sample Report Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500"/>
              <span className="font-medium">Gluten Status</span>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Not Detected
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500"/>
              <span className="font-medium">Cross-Contamination Risk</span>
            </div>
            <Badge variant="outline" className="bg-amber-50 text-amber-700">
              Low Risk
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500"/>
              <span className="font-medium">Additives Detected</span>
            </div>
            <Badge variant="outline" className="bg-slate-100">
              Xanthan Gum
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500"/>
              <span className="font-medium">Certified GF Label</span>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Yes
            </Badge>
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium">Community Safety Rating</span>
              <span className="text-sm font-bold text-green-600">95%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[95%] rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);
}
