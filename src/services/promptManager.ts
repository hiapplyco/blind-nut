import { PromptTemplate, PromptParams } from '@/prompts/types';

export class PromptManager {
  render(template: PromptTemplate, params: PromptParams): string {
    let result = template.template;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }
}

export const promptManager = new PromptManager();