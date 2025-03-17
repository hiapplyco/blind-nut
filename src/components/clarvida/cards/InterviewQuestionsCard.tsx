
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface InterviewQuestionsCardProps {
  data: {
    interview_questions: {
      number: number;
      question: string;
      competency_assessed: string;
    }[];
  };
}

export function InterviewQuestionsCard({ data }: InterviewQuestionsCardProps) {
  return (
    <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
      <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
        <CardTitle>Interview Questions</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ol className="space-y-4">
          {data.interview_questions.map((item, index) => (
            <li key={index} className="bg-gray-50 p-4 rounded-md">
              <div className="mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-[#8B5CF6] text-white rounded-full text-sm mr-2">
                  {item.number || index + 1}
                </span>
                <span className="font-medium">{item.question}</span>
              </div>
              <p className="text-sm text-gray-600 ml-8">
                <span className="font-medium">Competency Assessed:</span> {item.competency_assessed}
              </p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
