import { create } from 'zustand';
import { AgentOutput } from '@/types/agent';

interface ClientAgentOutputsState {
  outputs: Record<number, AgentOutput>;
  setOutput: (jobId: number, output: AgentOutput) => void;
  getOutput: (jobId: number) => AgentOutput | null;
}

export const useClientAgentOutputs = create<ClientAgentOutputsState>((set, get) => ({
  outputs: {},
  setOutput: (jobId, output) => 
    set((state) => ({
      outputs: { ...state.outputs, [jobId]: output }
    })),
  getOutput: (jobId) => get().outputs[jobId] || null,
}));