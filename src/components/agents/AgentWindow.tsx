
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
    <Card 
      className="w-full p-4 sm:p-6 border-4 border-black bg-[#F1F0FB] 
                shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] 
                hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.8)] 
                transition-all duration-200 transform 
                hover:rotate-0"
      style={{ transformOrigin: 'center center' }}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
          {icon}
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
        <ScrollArea className="h-[200px] pr-4">
          <div className="prose prose-sm max-w-none prose-headings:text-primary prose-p:text-gray-600">
            {children}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};
