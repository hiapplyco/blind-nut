
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface InterviewQuestion {
  number: number;
  question: string;
  competency_assessed: string;
}

interface InterviewQuestionsCardProps {
  data: {
    interview_questions: InterviewQuestion[];
  };
}

export function InterviewQuestionsCard({ data }: InterviewQuestionsCardProps) {
  if (!data || !data.interview_questions || !Array.isArray(data.interview_questions) || data.interview_questions.length === 0) {
    return (
      <Card className="shadow-lg border-2 border-[#8B5CF6]/20 h-full">
        <CardHeader className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent">
          <CardTitle>Interview Questions</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500">No interview questions available</p>
        </CardContent>
      </Card>
    );
  }

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
