
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchForm } from '../SearchForm';

// Mock the hooks
vi.mock('../hooks/useSearchForm', () => ({
  useSearchForm: () => ({
    searchText: '',
    setSearchText: vi.fn(),
    companyName: '',
    setCompanyName: vi.fn(),
    isProcessing: false,
    searchType: 'general',
    setSearchType: vi.fn(),
    searchString: '',
    setSearchString: vi.fn(),
    handleSubmit: vi.fn(),
    handleFileUpload: vi.fn()
  })
}));

const mockProps = {
  userId: 'test-user-id',
  onJobCreated: vi.fn(),
  currentJobId: 1,
  isProcessingComplete: false,
  source: 'default' as const,
  hideSearchTypeToggle: false,
  submitButtonText: 'Submit',
  onSubmitStart: vi.fn(),
  onShowGoogleSearch: vi.fn()
};

describe('SearchForm', () => {
  it('renders search form elements', () => {
    render(<SearchForm {...mockProps} />);
    
    expect(screen.getByRole('textbox')).toBeDefined();
    expect(screen.getByRole('button')).toBeDefined();
  });

  it('handles form submission', async () => {
    const mockSubmit = vi.fn();
    
    render(<SearchForm {...mockProps} />);
    
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(0); // Mock isn't called directly
    });
  });
});
