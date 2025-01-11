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
    <Card className="w-full p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 mb-4 text-2xl font-bold">
        {icon}
        {title}
      </div>
      <ScrollArea className="h-[200px] pr-4">
        {children}
      </ScrollArea>
    </Card>
  );
};