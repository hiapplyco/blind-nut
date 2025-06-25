
import { render } from '@testing-library/react';
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

  it('renders without crashing', () => {
    const { container } = render(<SearchForm {...mockProps} />);
    
    expect(container).toBeTruthy();
  });
});
