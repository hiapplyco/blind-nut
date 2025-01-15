import { Card } from "@/components/ui/card";

interface TranscriptionMessage {
  text: string;
  timestamp: string;
  participantId: string;
}

interface TranscriptListProps {
  transcripts: TranscriptionMessage[];
}

export const TranscriptList = ({ transcripts }: TranscriptListProps) => {
  if (transcripts.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Live Transcript</h3>
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