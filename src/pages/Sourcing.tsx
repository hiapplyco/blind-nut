
import NewSearchForm from "@/components/NewSearchForm";
import { useAuth } from "@/context/AuthContext";
import { memo } from "react";

const SourcingComponent = () => {
  const { session } = useAuth();

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="flex flex-col items-start">
        <h1 className="text-4xl font-bold mb-4">Sourcing</h1>
        <p className="text-gray-600 text-lg mb-8">
          Search for candidates, companies, or candidates at specific companies
        </p>
      </div>
      <NewSearchForm userId={session?.user?.id ?? null} />
    </div>
  );
};

const Sourcing = memo(SourcingComponent);
export default Sourcing;
