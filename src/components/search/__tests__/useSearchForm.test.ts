
import { renderHook, act } from '@testing-library/react';
import { useSearchForm } from '../hooks/useSearchForm';
import { vi } from 'vitest';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ state: null }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 1 },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { search_string: 'test search' },
            error: null,
          })),
        })),
      })),
    })),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useSearchForm', () => {
  const mockOnJobCreated = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() =>
      useSearchForm('test-user', mockOnJobCreated, null)
    );

    expect(result.current.searchText).toBe('');
    expect(result.current.companyName).toBe('');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.searchType).toBe('candidates');
  });

  it('updates search text correctly', async () => {
    const { result } = renderHook(() =>
      useSearchForm('test-user', mockOnJobCreated, null)
    );

    act(() => {
      result.current.setSearchText('new search text');
    });

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 300));

    expect(result.current.searchText).toBe('new search text');
  });

  it('handles form submission correctly', async () => {
    const { result } = renderHook(() =>
      useSearchForm('test-user', mockOnJobCreated, null)
    );

    act(() => {
      result.current.setSearchText('test content');
    });

    await act(async () => {
      await result.current.handleSubmit(new Event('submit') as any);
    });

    expect(mockOnJobCreated).toHaveBeenCalled();
  });

  it('handles form submission error correctly', async () => {
    vi.mocked(toast.error).mockImplementation(vi.fn());

    const { result } = renderHook(() =>
      useSearchForm('test-user', mockOnJobCreated, null)
    );

    act(() => {
      result.current.handleSubmit(new Event('submit') as any);
    });

    expect(toast.error).toHaveBeenCalled();
  });
});
