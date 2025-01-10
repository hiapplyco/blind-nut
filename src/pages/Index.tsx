import { Button } from "@/components/ui/button";
import DashboardMetrics from "@/components/DashboardMetrics";
import NewSearchForm from "@/components/NewSearchForm";
import CandidateTable from "@/components/CandidateTable";
import CompanyTable from "@/components/CompanyTable";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [showNewSearch, setShowNewSearch] = useState(false);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recruiting Dashboard</h1>
        <Button onClick={() => setShowNewSearch(!showNewSearch)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Search
        </Button>
      </div>

      {showNewSearch ? (
        <NewSearchForm />
      ) : (
        <>
          <DashboardMetrics />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CandidateTable />
            <CompanyTable />
          </div>
        </>
      )}
    </div>
  );
};

export default Index;