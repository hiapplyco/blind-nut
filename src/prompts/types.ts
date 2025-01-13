export interface PromptTemplate {
  name: string;
  version: string;
  description: string;
  template: string;
  parameters: string[];
}

export interface PromptParams {
  [key: string]: string;
}