
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SearchForm } from "@/components/search/SearchForm";
import { useAuth } from "@/context/AuthContext";
import { ClarvidaHeader } from "@/components/clarvida/ClarvidaHeader";

const Clarvida = () => {
  const { user } = useAuth();
  const userId = user?.id || null;
  
  return (
    <div className="min-h-screen bg-[#F1F0FB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <ClarvidaHeader />
        
        <div className="space-y-8 mt-8">
          <SearchForm 
            userId={userId} 
            onJobCreated={() => {}}
            currentJobId={null}
          />
        </div>
      </div>
    </div>
  );
};

export default Clarvida;
