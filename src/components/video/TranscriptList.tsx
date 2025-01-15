import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TranscriptionMessage {
  text: string;
  timestamp: string;
  participantId: string;
}

interface TranscriptListProps {
  transcripts: TranscriptionMessage[];
  onSave: () => void;
}

export const TranscriptList = ({ transcripts, onSave }: TranscriptListProps) => {
  if (transcripts.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Live Transcript</h3>
        <Button onClick={onSave}>Save Transcript</Button>
      </div>
      <div className="max-h-40 overflow-y-auto bg-white rounded-lg p-4 border">
        {transcripts.map((t, i) => (
          <div key={i} className="mb-2">
            <span className="text-sm text-gray-500">
              {new Date(t.timestamp).toLocaleTimeString()}
            </span>
            <p>{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};