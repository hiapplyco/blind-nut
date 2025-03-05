
import { create } from 'zustand';
import { AgentOutput } from '@/types/agent';
import { SearchResult } from '@/components/search/types';

interface ClientAgentOutputsState {
  outputs: Record<number, AgentOutput | null>;
  searchResults: Record<number, SearchResult[]>;
  searchQueries: Record<number, string>;
  totalResults: Record<number, number>;
  setOutput: (jobId: number, output: AgentOutput | null) => void;
  getOutput: (jobId: number) => AgentOutput | null;
  setSearchResults: (jobId: number, results: SearchResult[], searchQuery: string, totalResults: number) => void;
  getSearchResults: (jobId: number) => { results: SearchResult[], searchQuery: string, totalResults: number } | null;
  addToSearchResults: (jobId: number, results: SearchResult[]) => void;
}

export const useClientAgentOutputs = create<ClientAgentOutputsState>((set, get) => ({
  outputs: {},
  searchResults: {},
  searchQueries: {},
  totalResults: {},
  
  setOutput: (jobId, output) => 
    set((state) => ({
      outputs: { ...state.outputs, [jobId]: output }
    })),
    
  getOutput: (jobId) => get().outputs[jobId] || null,
  
  setSearchResults: (jobId, results, searchQuery, totalResults) => 
    set((state) => ({
      searchResults: { ...state.searchResults, [jobId]: results },
      searchQueries: { ...state.searchQueries, [jobId]: searchQuery },
      totalResults: { ...state.totalResults, [jobId]: totalResults }
    })),
    
  getSearchResults: (jobId) => {
    const results = get().searchResults[jobId];
    const searchQuery = get().searchQueries[jobId];
    const totalResults = get().totalResults[jobId];
    
    if (!results) return null;
    
    return { 
      results,
      searchQuery,
      totalResults
    };
  },
  
  addToSearchResults: (jobId, newResults) =>
    set((state) => {
      const currentResults = state.searchResults[jobId] || [];
      return {
        searchResults: { 
          ...state.searchResults, 
          [jobId]: [...currentResults, ...newResults] 
        }
      };
    }),
}));
