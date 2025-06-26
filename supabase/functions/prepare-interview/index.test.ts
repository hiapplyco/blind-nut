
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Mock the GoogleGenerativeAI class
class MockGenerativeAI {
  getGenerativeModel() {
    return {
      generateContent: (prompt: string) => {
        return Promise.resolve({
          response: {
            text: () => {
              return JSON.stringify({
                interviewType: 'STAR',
                tooltip:
                  'Situation, Task, Action, Result. Used to assess past behavior and predict future performance by asking candidates to describe specific examples of their experiences.',
                questions: [
                  {
                    question: 'Tell me about a time you faced a major challenge at work.',
                    assesses: 'Problem-solving skills and resilience.',
                  },
                ],
              });
            },
          },
        });
      },
    };
  }
}

// Replace the real implementation with the mock
const GoogleGenerativeAI = MockGenerativeAI;

Deno.test('prepare-interview function', async () => {
  const handler = (await import('./index.ts')).default;

  const req = new Request('http://localhost/prepare-interview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      context: 'Job description for a senior software engineer.',
      interviewType: 'STAR',
    }),
  });

  const res = await handler(req);
  const json = await res.json();

  assertEquals(res.status, 200);
  assertEquals(json.interviewType, 'STAR');
  assertEquals(json.questions.length, 1);
  assertEquals(json.questions[0].question, 'Tell me about a time you faced a major challenge at work.');
});
