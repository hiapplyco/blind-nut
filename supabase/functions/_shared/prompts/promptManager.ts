
import { PromptTemplate, PromptParams } from './types.ts';

export class PromptManager {
  render(template: PromptTemplate, params: PromptParams): string {
    let result = template.template;
    
    // Process conditional blocks first ({{#if variable}}...{{/if}})
    result = this.processConditionals(result, params);
    
    // Then process simple variable replacements ({{variable}})
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return result;
  }

  private processConditionals(template: string, params: PromptParams): string {
    // Match {{#if variable}}...{{/if}} blocks
    const conditionalRegex = /{{#if\s+(\w+)}}\s*([\s\S]*?)\s*{{\/if}}/g;
    
    return template.replace(conditionalRegex, (match, variable, content) => {
      // Check if the variable exists and has a truthy value
      const value = params[variable];
      if (value && value.toString().trim()) {
        return content;
      }
      return ''; // Remove the entire conditional block if condition is false
    });
  }
}

export const promptManager = new PromptManager();
