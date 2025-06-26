
import { Tool } from "./Tool.ts";

export class ToolRegistry {
  private tools: Map<string, Tool<any, any>> = new Map();

  register(tool: Tool<any, any>): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool<any, any> | undefined {
    return this.tools.get(name);
  }

  getAll(): Tool<any, any>[] {
    return Array.from(this.tools.values());
  }
}

export const toolRegistry = new ToolRegistry();
