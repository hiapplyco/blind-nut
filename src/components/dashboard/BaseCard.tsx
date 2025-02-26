
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pin, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { BaseCardProps } from "./types";

const sizeClasses = {
  "1x1": "col-span-1 row-span-1",
  "1x2": "col-span-1 row-span-2",
  "2x1": "col-span-2 row-span-1",
  "2x2": "col-span-2 row-span-2",
};

export function BaseCard({ title, children, size, onExpand, onPin, className }: BaseCardProps) {
  return (
    <Card className={cn(
      "transition-all hover:shadow-lg",
      sizeClasses[size],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {onPin && (
            <Button variant="ghost" size="icon" onClick={onPin}>
              <Pin className="h-4 w-4" />
            </Button>
          )}
          {onExpand && (
            <Button variant="ghost" size="icon" onClick={onExpand}>
              <Expand className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
