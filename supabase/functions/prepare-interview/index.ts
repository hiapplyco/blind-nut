

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const interviewFrameworks = {
  STAR: {
    name: 'STAR',
    tooltip:
      'Situation, Task, Action, Result. Used to assess past behavior and predict future performance by asking candidates to describe specific examples of their experiences.',
  },
  Behavioral: {
    name: 'Behavioral',
    tooltip:
      'Focuses on past behaviors to predict future performance. Questions often start with "Tell me about a time when..."',
  },
  Technical: {
    name: 'Technical',
    tooltip:
      'Evaluates a candidate\'s technical skills and knowledge. Can include coding challenges, system design questions, or theoretical concepts.',
  },
};

const handler = async (req: Request): Promise<Response> => {
  const { context, interviewType } = await req.json();

  if (!context || !interviewType) {
    return new Response(
      JSON.stringify({ error: 'Missing context or interviewType' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const framework = interviewFrameworks[interviewType];

  if (!framework) {
    return new Response(
      JSON.stringify({ error: 'Invalid interviewType' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const prompt = `
    Based on the following context:
    ---
    ${context}
    ---
    Generate a set of 5-7 interview questions for a ${framework.name} interview.
    For each question, provide a brief explanation of what it assesses.
    Return the response as a JSON object with the following structure:
    {
      "interviewType": "${framework.name}",
      "tooltip": "${framework.tooltip}",
      "questions": [
        {
          "question": "The generated question",
          "assesses": "What the question is designed to assess"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Clean the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json|```/g, '').trim();

    // Validate that the cleaned text is a parsable JSON
    JSON.parse(cleanedText);

    return new Response(cleanedText, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating interview questions:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate interview questions' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);

