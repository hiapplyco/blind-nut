import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  question: string;
  assesses: string;
}

interface InterviewPrepResponse {
  interviewType: string;
  tooltip: string;
  questions: Question[];
}

const interviewTypes = [
  {
    id: 'STAR',
    name: 'STAR',
    tooltip:
      'Situation, Task, Action, Result. Used to assess past behavior and predict future performance by asking candidates to describe specific examples of their experiences.',
  },
  {
    id: 'Behavioral',
    name: 'Behavioral',
    tooltip:
      'Focuses on past behaviors to predict future performance. Questions often start with "Tell me about a time when..."',
  },
  {
    id: 'Technical',
    name: 'Technical',
    tooltip:
      'Evaluates a candidate\'s technical skills and knowledge. Can include coding challenges, system design questions, or theoretical concepts.',
  },
];

export function InterviewPrep() {
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<InterviewPrepResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (interviewType: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    const { data, error } = await supabase.functions.invoke('prepare-interview', {
      body: { context, interviewType },
    });

    if (error) {
      setError(error.message);
    } else {
      setResponse(data);
    }

    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Interview Prep</h2>
      <Textarea
        placeholder="Paste job description, resume, or any other relevant context here..."
        value={context}
        onChange={(e) => setContext(e.target.value)}
        className="mb-4"
        rows={10}
      />
      <div className="flex space-x-2 mb-4">
        <TooltipProvider>
          {interviewTypes.map(({ id, name, tooltip }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <Button onClick={() => handleSubmit(id)} disabled={loading || !context}>
                  {name}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {response && (
        <div>
          <h3 className="text-xl font-bold mb-2">{response.interviewType} Interview Questions</h3>
          <p className="text-sm text-gray-500 mb-4">{response.tooltip}</p>
          <ul className="space-y-4">
            {response.questions.map((q, index) => (
              <li key={index}>
                <p className="font-semibold">{q.question}</p>
                <p className="text-sm text-gray-600">Assesses: {q.assesses}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}