
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TalentLocationsCardProps {
  data: {
    trending_talent_locations: string[];
    skill_based_locations: string[];
    recommended_communities: string[];
  };
}

export function TalentLocationsCard({ data }: TalentLocationsCardProps) {
  return (
    <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
      <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
        <CardTitle>Talent Locations</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Trending Talent Locations</h4>
          <ul className="list-disc pl-5 text-sm">
            {data.trending_talent_locations.map((location, index) => (
              <li key={index}>{location}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Skill-Based Locations</h4>
          <ul className="list-disc pl-5 text-sm">
            {data.skill_based_locations.map((location, index) => (
              <li key={index}>{location}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Recommended Communities</h4>
          <ul className="list-disc pl-5 text-sm">
            {data.recommended_communities.map((community, index) => (
              <li key={index}>{community}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
