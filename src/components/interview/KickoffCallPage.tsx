import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { InterviewPrep } from './InterviewPrep';
import { InterviewChat } from './InterviewChat';
import { FileText, MessageSquare, BarChart3, Settings } from 'lucide-react';

type InterviewMode = 'setup' | 'live' | 'analysis';

interface InterviewSession {
  id?: string;
  roleTitle: string;
  roleDescription: string;
  interviewType: string;
  contextData: any;
  conversationHistory: any[];
  analyticsData?: any;
}

export function KickoffCallPage() {
  const [mode, setMode] = useState<InterviewMode>('setup');
  const [session, setSession] = useState<InterviewSession | null>(null);

  const handleInterviewStart = (sessionData: Partial<InterviewSession>) => {
    setSession({
      ...sessionData,
      conversationHistory: [],
    } as InterviewSession);
    setMode('live');
  };

  const handleAnalysisMode = () => {
    setMode('analysis');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Kickoff Call Center</h1>
        <p className="text-gray-600">
          Prepare, conduct, and analyze interviews with AI-powered guidance
        </p>
      </div>

      <Tabs value={mode} onValueChange={(value) => setMode(value as InterviewMode)}>
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Setup
          </TabsTrigger>
          <TabsTrigger 
            value="live" 
            disabled={!session}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Live Interview
          </TabsTrigger>
          <TabsTrigger 
            value="analysis" 
            disabled={!session}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="mt-6">
          <Card>
            <InterviewPrep onInterviewStart={handleInterviewStart} />
          </Card>
        </TabsContent>

        <TabsContent value="live" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Live Interview Session</h2>
              {session && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold">{session.roleTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Interview Type: {session.interviewType}
                    </p>
                  </div>
                  <InterviewChat 
                    roleTitle={session.roleTitle}
                    roleDescription={session.roleDescription}
                    interviewType={session.interviewType}
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Interview Analysis & Dashboard</h2>
              {session && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Interview Progress</h3>
                      <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                        Progress Tracker Coming Soon
                      </div>
                    </Card>
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Response Metrics</h3>
                      <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                        Metrics Visualization Coming Soon
                      </div>
                    </Card>
                  </div>
                  <div className="space-y-4">
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Skill Assessment</h3>
                      <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                        Skill Matrix Coming Soon
                      </div>
                    </Card>
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Generated Content</h3>
                      <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                        Interview Summary Coming Soon
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}