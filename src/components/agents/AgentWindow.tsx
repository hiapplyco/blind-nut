import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AgentWindowProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const AgentWindow = ({ 
  title, 
  icon, 
  children
}: AgentWindowProps) => {
  return (
    <Card className="w-full p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {icon}
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
        <ScrollArea className="h-[200px] pr-4">
          <div className="prose prose-sm max-w-none prose-headings:text-primary prose-p:text-gray-600">
            {children}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};