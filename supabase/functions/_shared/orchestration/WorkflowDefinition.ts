export interface WorkflowStep {
  id: string;
  agentName: string;
  params: Record<string, any>;
  dependsOn?: string[]; // IDs of steps that must complete before this one
  condition?: (previousResults: Record<string, any>) => boolean;
  transformOutput?: (output: any) => any;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  parallel?: boolean; // Whether to run independent steps in parallel
  maxDuration?: number; // Maximum workflow duration in ms
  onError?: 'continue' | 'stop'; // Error handling strategy
}

export interface WorkflowResult {
  workflowId: string;
  success: boolean;
  duration: number;
  results: Record<string, any>; // Step ID -> result mapping
  errors: Record<string, string>; // Step ID -> error mapping
  metadata: {
    startTime: Date;
    endTime: Date;
    stepsCompleted: number;
    totalSteps: number;
  };
}

// Predefined workflow templates
export const WorkflowTemplates = {
  candidateSourcing: {
    id: 'candidate-sourcing',
    name: 'Candidate Sourcing Workflow',
    description: 'Search for candidates, enrich profiles, and extract skills',
    steps: [
      {
        id: 'generate-boolean',
        agentName: 'BooleanSearchAgent',
        params: {
          requirements: '{{requirements}}',
          complexity: 'medium'
        }
      },
      {
        id: 'search-profiles',
        agentName: 'RecruitmentAgent',
        params: {
          task: 'search',
          booleanSearch: '{{generate-boolean.output}}'
        },
        dependsOn: ['generate-boolean']
      },
      {
        id: 'enrich-profiles',
        agentName: 'ProfileEnrichmentAgent',
        params: {
          profiles: '{{search-profiles.profiles}}'
        },
        dependsOn: ['search-profiles']
      },
      {
        id: 'extract-skills',
        agentName: 'RecruitmentAgent',
        params: {
          task: 'analyze-skills',
          profiles: '{{enrich-profiles.enrichedProfiles}}'
        },
        dependsOn: ['enrich-profiles']
      }
    ],
    onError: 'continue'
  } as WorkflowDefinition,

  compensationAnalysis: {
    id: 'compensation-analysis',
    name: 'Compensation Analysis Workflow',
    description: 'Analyze market compensation data and provide recommendations',
    steps: [
      {
        id: 'gather-market-data',
        agentName: 'CompensationAgent',
        params: {
          task: 'market-research',
          role: '{{role}}',
          location: '{{location}}'
        }
      },
      {
        id: 'analyze-competitors',
        agentName: 'TaskAgent',
        params: {
          task: 'Research competitor compensation for {{role}} in {{location}}'
        }
      },
      {
        id: 'generate-report',
        agentName: 'CompensationAgent',
        params: {
          task: 'generate-report',
          marketData: '{{gather-market-data.output}}',
          competitorData: '{{analyze-competitors.output}}'
        },
        dependsOn: ['gather-market-data', 'analyze-competitors']
      }
    ],
    parallel: true,
    onError: 'stop'
  } as WorkflowDefinition,

  interviewScheduling: {
    id: 'interview-scheduling',
    name: 'Interview Scheduling Workflow',
    description: 'Coordinate interview scheduling between candidates and interviewers',
    steps: [
      {
        id: 'check-availability',
        agentName: 'TaskAgent',
        params: {
          task: 'Check calendar availability for interviewers: {{interviewers}}'
        }
      },
      {
        id: 'propose-times',
        agentName: 'ConversationAgent',
        params: {
          message: 'Generate 3 interview time proposals based on availability: {{check-availability.output}}'
        },
        dependsOn: ['check-availability']
      },
      {
        id: 'send-invites',
        agentName: 'TaskAgent',
        params: {
          task: 'Create calendar invites for: {{propose-times.output}}'
        },
        dependsOn: ['propose-times'],
        condition: (results) => results['propose-times']?.success === true
      }
    ],
    maxDuration: 300000, // 5 minutes
    onError: 'stop'
  } as WorkflowDefinition
};