
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TimelineExpectationsCardProps {
  data: {
    "30_days": string;
    "60_days": string;
    "90_days": string;
    "1_year": string;
  };
}

export function TimelineExpectationsCard({ data }: TimelineExpectationsCardProps) {
  return (
    <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
      <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
        <CardTitle>Timeline Expectations</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">30 Days</h4>
            <p className="text-sm">{data["30_days"]}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">60 Days</h4>
            <p className="text-sm">{data["60_days"]}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">90 Days</h4>
            <p className="text-sm">{data["90_days"]}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">1 Year</h4>
            <p className="text-sm">{data["1_year"]}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
