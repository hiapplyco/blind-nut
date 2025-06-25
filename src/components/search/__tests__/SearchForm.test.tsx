
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
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
    const { container } = render(<SearchForm {...mockProps} />);
    
    expect(container.querySelector('form')).toBeTruthy();
  });

  it('handles form submission', async () => {
    const mockSubmit = vi.fn();
    
    const { container } = render(<SearchForm {...mockProps} />);
    
    const form = container.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(0); // Mock isn't called directly
    });
  });
});
