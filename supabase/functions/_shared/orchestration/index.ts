
// Re-export all orchestration components
export * from "./WorkflowDefinition.ts";
export * from "./EnhancedOrchestrator.ts";

// Re-export all agents
export * from "../agents/Agent.ts";
export * from "../agents/RecruitmentAgent.ts";
export * from "../agents/ProfileEnrichmentAgent.ts";
export * from "../agents/EnhancedCompensationAgent.ts";

// Re-export all tools
export * from "../tools/LinkedInSearchTool.ts";
export * from "../tools/NymeriaEnrichmentTool.ts";
export * from "../tools/SkillsExtractionTool.ts";
export * from "../tools/ResumeParseTool.ts";

// Create a convenience function to set up a fully configured orchestrator
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { EnhancedOrchestrator } from "./EnhancedOrchestrator.ts";
import { ToolRegistry } from "../tools/ToolRegistry.ts";
import { TaskAgent, ConversationAgent } from "../agents/Agent.ts";
import { RecruitmentAgent, BooleanSearchAgent } from "../agents/RecruitmentAgent.ts";
import { ProfileEnrichmentAgent } from "../agents/ProfileEnrichmentAgent.ts";
import { EnhancedCompensationAgent } from "../agents/EnhancedCompensationAgent.ts";

export interface OrchestratorConfig {
  googleApiKey: string;
  nymeriaApiKey?: string;
  debug?: boolean;
  maxConcurrency?: number;
}

export function createRecruitmentOrchestrator(config: OrchestratorConfig): EnhancedOrchestrator {
  const genAI = new GoogleGenerativeAI(config.googleApiKey);
  const toolRegistry = new ToolRegistry();
  
  const orchestrator = new EnhancedOrchestrator(toolRegistry, {
    debug: config.debug,
    maxConcurrency: config.maxConcurrency
  });

  // Register all agents
  orchestrator.registerAgent('TaskAgent', new TaskAgent(genAI));
  orchestrator.registerAgent('ConversationAgent', new ConversationAgent(genAI));
  orchestrator.registerAgent('RecruitmentAgent', new RecruitmentAgent(genAI));
  orchestrator.registerAgent('BooleanSearchAgent', new BooleanSearchAgent(genAI));
  orchestrator.registerAgent('CompensationAgent', new EnhancedCompensationAgent(genAI));
  
  // Register ProfileEnrichmentAgent if Nymeria API key is provided
  if (config.nymeriaApiKey) {
    orchestrator.registerAgent(
      'ProfileEnrichmentAgent', 
      new ProfileEnrichmentAgent(genAI, config.nymeriaApiKey)
    );
  }

  return orchestrator;
}
