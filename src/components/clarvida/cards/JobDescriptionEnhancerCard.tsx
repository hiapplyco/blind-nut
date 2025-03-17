
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface JobDescriptionEnhancerCardProps {
  data: {
    optimization_tips: string[];
    revised_job_listing: string;
  };
}

export function JobDescriptionEnhancerCard({ data }: JobDescriptionEnhancerCardProps) {
  return (
    <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
      <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
        <CardTitle>Job Description Enhancer</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Optimization Tips</h4>
          <ol className="list-decimal pl-5 text-sm space-y-1">
            {data.optimization_tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ol>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Revised Job Listing</h4>
          <div className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-line">
            {data.revised_job_listing}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
