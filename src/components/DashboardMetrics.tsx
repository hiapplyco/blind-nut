import { Card } from "@/components/ui/card";
import { UsersIcon, BuildingIcon, ChartBarIcon } from "lucide-react";

const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <UsersIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Candidates</p>
            <h3 className="text-2xl font-bold">124</h3>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full">
            <BuildingIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Companies</p>
            <h3 className="text-2xl font-bold">45</h3>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <ChartBarIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Searches</p>
            <h3 className="text-2xl font-bold">3</h3>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardMetrics;