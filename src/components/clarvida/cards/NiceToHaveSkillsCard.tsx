
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface NiceToHaveSkillsCardProps {
  data: {
    supplemental_qualifications: {skill: string, reasoning: string}[];
    nice_to_have_skills: {skill: string, reasoning: string}[];
  };
}

export function NiceToHaveSkillsCard({ data }: NiceToHaveSkillsCardProps) {
  return (
    <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
      <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
        <CardTitle>Nice-to-Have Skills</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {data.supplemental_qualifications.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Supplemental Qualifications</h4>
            <div className="space-y-3">
              {data.supplemental_qualifications.map((item, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <h5 className="font-medium text-[#8B5CF6]">{item.skill}</h5>
                  <p className="text-sm text-gray-600 mt-1">{item.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {data.nice_to_have_skills.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Nice-to-Have Skills</h4>
            <div className="space-y-3">
              {data.nice_to_have_skills.map((item, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <h5 className="font-medium text-[#8B5CF6]">{item.skill}</h5>
                  <p className="text-sm text-gray-600 mt-1">{item.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
