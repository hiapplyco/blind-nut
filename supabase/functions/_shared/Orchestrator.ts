
import { Agent } from "../agents/Agent.ts";
import { ToolRegistry } from "../tools/ToolRegistry.ts";
import { PromptParams } from "../prompts/types.ts";

export class Orchestrator {
  private readonly agents: Map<string, Agent<any>> = new Map();
  private readonly toolRegistry: ToolRegistry;

  constructor(toolRegistry: ToolRegistry) {
    this.toolRegistry = toolRegistry;
  }

  registerAgent(name: string, agent: Agent<any>): void {
    this.agents.set(name, agent);
  }

  async run(agentName: string, params: PromptParams): Promise<string> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    // For now, we'll just run the agent directly.
    // In the future, this will be expanded to handle multi-step workflows and tool use.
    return agent.run(params);
  }
}
