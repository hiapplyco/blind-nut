
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CompensationAnalysisCardProps {
  data: {
    report: string;
    salary_range: {
      min: number;
      max: number;
      average: number;
    };
    benefits: string[];
    bonuses: string[];
    fringe_benefits: string[];
    sources: { source_name: string; url: string }[];
  };
}

export function CompensationAnalysisCard({ data }: CompensationAnalysisCardProps) {
  return (
    <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
      <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
        <CardTitle>Compensation Analysis</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <p className="text-sm">{data.report}</p>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-semibold mb-2">Salary Range</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded shadow-sm">
              <p className="text-xs text-gray-500">Min</p>
              <p className="font-medium">${data.salary_range.min.toLocaleString()}</p>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <p className="text-xs text-gray-500">Average</p>
              <p className="font-medium">${data.salary_range.average.toLocaleString()}</p>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <p className="text-xs text-gray-500">Max</p>
              <p className="font-medium">${data.salary_range.max.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {data.benefits.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Benefits</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {data.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}
        
        {data.bonuses.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Bonuses</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {data.bonuses.map((bonus, index) => (
                <li key={index}>{bonus}</li>
              ))}
            </ul>
          </div>
        )}
        
        {data.fringe_benefits.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Fringe Benefits</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {data.fringe_benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}
        
        {data.sources.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Sources</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {data.sources.map((source, index) => (
                <li key={index}>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#8B5CF6] hover:underline"
                  >
                    {source.source_name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
