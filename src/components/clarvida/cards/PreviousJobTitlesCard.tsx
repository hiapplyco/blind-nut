
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PreviousJobTitlesCardProps {
  data: {
    previous_job_titles: string[];
  };
}

export function PreviousJobTitlesCard({ data }: PreviousJobTitlesCardProps) {
  return (
    <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
      <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
        <CardTitle>Previous Job Titles</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ul className="list-disc pl-5 space-y-1">
          {data.previous_job_titles.map((title, index) => (
            <li key={index} className="text-sm">{title}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
