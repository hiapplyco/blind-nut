
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { Agent } from "./Agent.ts";
import { compensationPrompt } from "../prompts/compensation.prompt.ts";
import { PromptParams } from "../prompts/types.ts";
import { ToolRegistry } from "../tools/ToolRegistry.ts";

interface CompensationParams extends PromptParams {
  content: string;
}

export class CompensationAgent extends Agent<CompensationParams> {
  constructor(model: GoogleGenerativeAI, toolRegistry: ToolRegistry) {
    super(model, compensationPrompt, toolRegistry);
  }
}
