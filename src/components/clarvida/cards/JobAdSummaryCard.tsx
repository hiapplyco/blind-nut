
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface JobAdSummaryCardProps {
  data: {
    summary_paragraphs: string[];
    hard_skills: string[];
    soft_skills: string[];
    boolean_string: string;
  };
}

export function JobAdSummaryCard({ data }: JobAdSummaryCardProps) {
  return (
    <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
      <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
        <CardTitle>Job Ad Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Summary</h4>
          {data.summary_paragraphs.map((paragraph, index) => (
            <p key={index} className="text-sm mb-2">{paragraph}</p>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Hard Skills</h4>
            <ul className="list-disc pl-5 text-sm">
              {data.hard_skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Soft Skills</h4>
            <ul className="list-disc pl-5 text-sm">
              {data.soft_skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Boolean Search String</h4>
          <div className="bg-gray-50 p-3 rounded-md text-xs font-mono overflow-x-auto">
            {data.boolean_string}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
