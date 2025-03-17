
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
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
      <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
        <CardTitle>Compensation Analysis</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="mb-4">
          <p className="text-sm">{data.report}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <h4 className="font-semibold mb-2">Salary Range</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Minimum</p>
              <p className="text-lg font-bold text-[#8B5CF6]">{formatCurrency(data.salary_range.min)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average</p>
              <p className="text-lg font-bold text-[#8B5CF6]">{formatCurrency(data.salary_range.average)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Maximum</p>
              <p className="text-lg font-bold text-[#8B5CF6]">{formatCurrency(data.salary_range.max)}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Benefits</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {data.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Bonuses</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {data.bonuses.map((bonus, index) => (
                <li key={index}>{bonus}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Fringe Benefits</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {data.fringe_benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Sources</h4>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {data.sources.map((source, index) => (
              <li key={index}>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {source.source_name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
