
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CompanyDescriptionCardProps {
  data: {
    company_description: string;
  };
}

export function CompanyDescriptionCard({ data }: CompanyDescriptionCardProps) {
  return (
    <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
      <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
        <CardTitle>Company Description</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm">{data.company_description}</p>
      </CardContent>
    </Card>
  );
}
