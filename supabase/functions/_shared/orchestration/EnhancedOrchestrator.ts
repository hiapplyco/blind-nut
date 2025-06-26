import { Agent } from "../agents/Agent.ts";
import { ToolRegistry } from "../tools/ToolRegistry.ts";
import { PromptParams } from "../prompts/types.ts";
import { WorkflowDefinition, WorkflowStep, WorkflowResult } from "./WorkflowDefinition.ts";

export interface OrchestratorOptions {
  maxConcurrency?: number;
  timeout?: number;
  retryAttempts?: number;
  debug?: boolean;
}

export class EnhancedOrchestrator {
  private readonly agents: Map<string, Agent<any>> = new Map();
  private readonly options: OrchestratorOptions;
  private runningWorkflows: Map<string, AbortController> = new Map();

  constructor(_toolRegistry: ToolRegistry, options: OrchestratorOptions = {}) {
    // toolRegistry is kept for backwards compatibility but not used
    this.options = {
      maxConcurrency: options.maxConcurrency || 3,
      timeout: options.timeout || 600000, // 10 minutes default
      retryAttempts: options.retryAttempts || 2,
      debug: options.debug || false
    };
  }

  registerAgent(name: string, agent: Agent<any>): void {
    this.agents.set(name, agent);
    if (this.options.debug) {
      console.log(`[Orchestrator] Registered agent: ${name}`);
    }
  }

  async runSingleAgent(agentName: string, params: PromptParams): Promise<string> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    return agent.run(params);
  }

  async runWorkflow(workflow: WorkflowDefinition, initialParams: Record<string, any> = {}): Promise<WorkflowResult> {
    const workflowId = `${workflow.id}-${Date.now()}`;
    const abortController = new AbortController();
    this.runningWorkflows.set(workflowId, abortController);

    const startTime = new Date();
    const results: Record<string, any> = {};
    const errors: Record<string, string> = {};
    let stepsCompleted = 0;

    try {
      // Set up timeout
      const timeoutMs = workflow.maxDuration || this.options.timeout;
      const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

      // Create execution plan
      const executionPlan = this.createExecutionPlan(workflow.steps);
      
      // Execute steps according to plan
      for (const batch of executionPlan) {
        if (abortController.signal.aborted) {
          throw new Error('Workflow aborted due to timeout');
        }

        // Execute batch of steps
        const batchPromises = batch.map(async (step) => {
          try {
            // Check conditions
            if (step.condition && !step.condition(results)) {
              if (this.options.debug) {
                console.log(`[Workflow] Skipping step ${step.id} due to condition`);
              }
              results[step.id] = { skipped: true, reason: 'Condition not met' };
              return;
            }

            // Resolve parameters with previous results
            const resolvedParams = this.resolveParameters(step.params, results, initialParams);
            
            // Execute agent
            const agent = this.agents.get(step.agentName);
            if (!agent) {
              throw new Error(`Agent not found: ${step.agentName}`);
            }

            if (this.options.debug) {
              console.log(`[Workflow] Executing step ${step.id} with params:`, resolvedParams);
            }

            let result = await this.executeWithRetry(
              () => agent.run(resolvedParams),
              this.options.retryAttempts || 2
            );

            // Transform output if needed
            if (step.transformOutput) {
              result = step.transformOutput(result);
            }

            results[step.id] = { success: true, output: result };
            stepsCompleted++;

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors[step.id] = errorMessage;
            results[step.id] = { success: false, error: errorMessage };

            if (workflow.onError === 'stop') {
              throw new Error(`Workflow stopped due to error in step ${step.id}: ${errorMessage}`);
            }
          }
        });

        // Wait for batch to complete
        if (workflow.parallel) {
          await Promise.all(batchPromises);
        } else {
          for (const promise of batchPromises) {
            await promise;
          }
        }
      }

      clearTimeout(timeoutId);

    } catch (error) {
      if (this.options.debug) {
        console.error('[Workflow] Error:', error);
      }
    } finally {
      this.runningWorkflows.delete(workflowId);
    }

    const endTime = new Date();

    return {
      workflowId,
      success: Object.keys(errors).length === 0,
      duration: endTime.getTime() - startTime.getTime(),
      results,
      errors,
      metadata: {
        startTime,
        endTime,
        stepsCompleted,
        totalSteps: workflow.steps.length
      }
    };
  }

  async abortWorkflow(workflowId: string): Promise<boolean> {
    const controller = this.runningWorkflows.get(workflowId);
    if (controller) {
      controller.abort();
      this.runningWorkflows.delete(workflowId);
      return true;
    }
    return false;
  }

  private createExecutionPlan(steps: WorkflowStep[]): WorkflowStep[][] {
    const plan: WorkflowStep[][] = [];
    const completed = new Set<string>();
    const remaining = new Set(steps);

    while (remaining.size > 0) {
      const batch: WorkflowStep[] = [];

      for (const step of remaining) {
        // Check if all dependencies are completed
        const dependenciesMet = !step.dependsOn || 
          step.dependsOn.every(dep => completed.has(dep));

        if (dependenciesMet) {
          batch.push(step);
        }
      }

      if (batch.length === 0) {
        throw new Error('Circular dependency detected in workflow');
      }

      // Add batch to plan and mark as completed
      plan.push(batch);
      batch.forEach(step => {
        completed.add(step.id);
        remaining.delete(step);
      });
    }

    return plan;
  }

  private resolveParameters(
    params: Record<string, any>, 
    results: Record<string, any>,
    initialParams: Record<string, any>
  ): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value.includes('{{')) {
        // Handle template variables
        resolved[key] = this.resolveTemplate(value, results, initialParams);
      } else if (typeof value === 'object' && value !== null) {
        // Recursively resolve nested objects
        resolved[key] = this.resolveParameters(value, results, initialParams);
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  private resolveTemplate(
    template: string, 
    results: Record<string, any>,
    initialParams: Record<string, any>
  ): any {
    let resolved = template;

    // Replace step output references {{stepId.output}}
    const stepOutputRegex = /\{\{([^.]+)\.output\}\}/g;
    resolved = resolved.replace(stepOutputRegex, (match, stepId) => {
      const stepResult = results[stepId];
      if (stepResult?.success && stepResult.output) {
        return typeof stepResult.output === 'string' 
          ? stepResult.output 
          : JSON.stringify(stepResult.output);
      }
      return match;
    });

    // Replace initial parameter references {{paramName}}
    const paramRegex = /\{\{([^}]+)\}\}/g;
    resolved = resolved.replace(paramRegex, (match, paramName) => {
      if (paramName in initialParams) {
        const value = initialParams[paramName];
        return typeof value === 'string' ? value : JSON.stringify(value);
      }
      return match;
    });

    // If the entire string was a template and resolves to JSON, parse it
    if (template.startsWith('{{') && template.endsWith('}}') && !resolved.includes('{{')) {
      try {
        return JSON.parse(resolved);
      } catch {
        // Not valid JSON, return as string
      }
    }

    return resolved;
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>, 
    attempts: number
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (this.options.debug) {
          console.log(`[Orchestrator] Retry attempt ${i + 1}/${attempts} failed:`, lastError.message);
        }
        
        // Exponential backoff
        if (i < attempts - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  // Utility methods for common patterns
  async runParallelAgents(
    agentTasks: Array<{ agentName: string; params: PromptParams }>
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    const promises = agentTasks.map(async ({ agentName, params }, index) => {
      try {
        const result = await this.runSingleAgent(agentName, params);
        results[`${agentName}_${index}`] = { success: true, output: result };
      } catch (error) {
        results[`${agentName}_${index}`] = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    await Promise.all(promises);
    return results;
  }

  async runSequentialAgents(
    agentTasks: Array<{ 
      agentName: string; 
      params: PromptParams | ((previousResult: any) => PromptParams) 
    }>
  ): Promise<any[]> {
    const results: any[] = [];
    
    for (const { agentName, params } of agentTasks) {
      const previousResult = results[results.length - 1];
      const resolvedParams = typeof params === 'function' 
        ? params(previousResult) 
        : params;
      
      const result = await this.runSingleAgent(agentName, resolvedParams);
      results.push(result);
    }

    return results;
  }

  // Get list of registered agents
  getRegisteredAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  // Get running workflows
  getRunningWorkflows(): string[] {
    return Array.from(this.runningWorkflows.keys());
  }
}