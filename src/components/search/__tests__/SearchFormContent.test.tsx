
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchFormContent } from '../SearchFormContent';
import { vi } from 'vitest';

const mockProps = {
  searchText: '',
  companyName: '',
  isProcessing: false,
  isScrapingProfiles: false,
  searchType: 'candidates',
  searchString: '',
  onSearchTypeChange: vi.fn(),
  onSearchTextChange: vi.fn(),
  onCompanyNameChange: vi.fn(),
  onFileUpload: vi.fn(),
  onSubmit: vi.fn(),
};

describe('SearchFormContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form elements correctly', () => {
    render(<SearchFormContent {...mockProps} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate search/i })).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    render(<SearchFormContent {...mockProps} />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(mockProps.onSubmit).toHaveBeenCalled();
  });

  it('shows loading state when processing', () => {
    render(<SearchFormContent {...mockProps} isProcessing={true} />);
    
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });

  it('shows loading state when scraping profiles', () => {
    render(<SearchFormContent {...mockProps} isScrapingProfiles={true} />);
    
    expect(screen.getByText(/scraping profiles/i)).toBeInTheDocument();
  });

  it('shows company name input only for candidates-at-company search type', () => {
    const { rerender } = render(<SearchFormContent {...mockProps} />);
    
    expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();

    rerender(<SearchFormContent {...mockProps} searchType="candidates-at-company" />);
    
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
  });
});
