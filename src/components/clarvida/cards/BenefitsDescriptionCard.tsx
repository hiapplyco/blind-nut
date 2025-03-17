
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface BenefitsDescriptionCardProps {
  data: {
    benefits_paragraph: string;
  };
}

export function BenefitsDescriptionCard({ data }: BenefitsDescriptionCardProps) {
  return (
    <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
      <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
        <CardTitle>Benefits Description</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm">{data.benefits_paragraph}</p>
      </CardContent>
    </Card>
  );
}
