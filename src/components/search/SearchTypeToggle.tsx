import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Users, Building2, Briefcase } from "lucide-react";

type SearchType = "candidates" | "companies" | "candidates-at-company";

interface SearchTypeToggleProps {
  value: SearchType;
  onValueChange: (value: SearchType) => void;
}

export const SearchTypeToggle = ({ value, onValueChange }: SearchTypeToggleProps) => {
  return (
    <div className="flex justify-center mb-6">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(value) => value && onValueChange(value as SearchType)}
        className="border-4 border-black p-2 rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <ToggleGroupItem 
          value="candidates" 
          aria-label="Search for candidates"
          className="data-[state=on]:bg-[#8B5CF6] data-[state=on]:text-white hover:bg-[#8B5CF6]/20"
        >
          <Users className="h-4 w-4 mr-2" />
          Candidates
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="companies" 
          aria-label="Search for companies"
          className="data-[state=on]:bg-[#D946EF] data-[state=on]:text-white hover:bg-[#D946EF]/20"
        >
          <Building2 className="h-4 w-4 mr-2" />
          Companies
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="candidates-at-company" 
          aria-label="Search for candidates at company"
          className="data-[state=on]:bg-[#F97316] data-[state=on]:text-white hover:bg-[#F97316]/20"
        >
          <Briefcase className="h-4 w-4 mr-2" />
          Candidates at Company
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};