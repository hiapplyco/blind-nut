
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, User, Target } from "lucide-react";

interface InterviewPlan {
  overview: string;
  estimatedDuration: string;
  keyAreas: string[];
  questions: Array<{
    category: string;
    question: string;
    followUp?: string[];
  }>;
  evaluationCriteria: string[];
}

interface InterviewPlanDisplayProps {
  plan: InterviewPlan;
  roleTitle: string;
  framework: string;
}

export const InterviewPlanDisplay = ({ plan, roleTitle, framework }: InterviewPlanDisplayProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Interview Plan: {roleTitle}</span>
          </CardTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Framework: {framework}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Duration: {plan.estimatedDuration}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Overview</h4>
              <p className="text-gray-700">{plan.overview}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Key Areas to Assess</h4>
              <div className="flex flex-wrap gap-2">
                {plan.keyAreas.map((area, index) => (
                  <Badge key={index} variant="secondary">{area}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interview Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {plan.questions.map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="font-medium text-blue-700 mb-1">{item.category}</div>
                <div className="text-gray-800 mb-2">{item.question}</div>
                {item.followUp && item.followUp.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <div className="font-medium mb-1">Follow-up questions:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {item.followUp.map((follow, followIndex) => (
                        <li key={followIndex}>{follow}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Evaluation Criteria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {plan.evaluationCriteria.map((criteria, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{criteria}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
