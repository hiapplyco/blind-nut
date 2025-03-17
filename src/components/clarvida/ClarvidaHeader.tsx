
import { Card } from "@/components/ui/card";

export const ClarvidaHeader = () => {
  return (
    <Card className="p-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-[#8B5CF6] via-[#9B87F5] to-[#A18472] bg-clip-text text-transparent">
          Clarvida
        </h1>
        <p className="text-center text-gray-600 max-w-3xl">
          Specialized talent platform for Clarvida. Upload job requirements or candidate data for analysis.
        </p>
      </div>
    </Card>
  );
};
