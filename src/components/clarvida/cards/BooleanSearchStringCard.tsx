
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState } from "react";

interface BooleanSearchStringCardProps {
  data: {
    boolean_string: string;
  };
}

export function BooleanSearchStringCard({ data }: BooleanSearchStringCardProps) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.boolean_string);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
      <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
        <CardTitle>Boolean Search String</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative">
          <code className="block bg-gray-50 p-4 rounded-md text-sm whitespace-pre-wrap overflow-x-auto max-h-60 overflow-y-auto">
            {data.boolean_string}
          </code>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-2 right-2" 
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4 mr-1" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
