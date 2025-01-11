import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import Draggable from "react-draggable";

interface AgentWindowProps {
  title: string;
  icon: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
}

export const AgentWindow = ({ 
  title, 
  icon, 
  isVisible, 
  onClose, 
  children,
  initialPosition = { x: 0, y: 0 }
}: AgentWindowProps) => {
  if (!isVisible) return null;

  return (
    <Draggable handle=".drag-handle" defaultPosition={initialPosition}>
      <div className="fixed z-50">
        <Card className="w-80 p-6 border-4 border-black bg-[#FFFBF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-4">
            <div className="drag-handle cursor-move flex items-center gap-2 text-2xl font-bold select-none flex-grow">
              {icon}
              {title}
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <ScrollArea className="h-[400px] pr-4">
            {children}
          </ScrollArea>
        </Card>
      </div>
    </Draggable>
  );
};