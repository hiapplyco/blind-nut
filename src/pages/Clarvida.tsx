
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SearchForm } from "@/components/search/SearchForm";
import { useAuth } from "@/context/AuthContext";
import { ClarvidaHeader } from "@/components/clarvida/ClarvidaHeader";

const Clarvida = () => {
  const { session } = useAuth();
  const userId = session?.user?.id || null;
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#F1F0FB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <ClarvidaHeader />
        
        <div className="space-y-8 mt-8">
          <SearchForm 
            userId={userId} 
            onJobCreated={() => {
              // Handle job creation if needed
              setIsProcessingComplete(true);
            }}
            currentJobId={null}
            isProcessingComplete={isProcessingComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default Clarvida;
