
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CardData } from "./types";

const sizeClasses = {
  "1x1": "col-span-1 row-span-1",
  "1x2": "col-span-1 row-span-2",
  "2x1": "col-span-2 row-span-1",
  "2x2": "col-span-2 row-span-2",
};

export function DashboardCard({ data }: { data: CardData }) {
  const { config, content } = data;
  
  return (
    <Card className={cn(
      "transition-all hover:shadow-lg",
      sizeClasses[config.size]
    )}>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* TODO: Add visualization components based on card type */}
        <pre className="text-sm">
          {JSON.stringify(content, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
