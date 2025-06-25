
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchFormContent } from '../SearchFormContent';

// Mock the required props
const mockProps = {
  searchText: '',
  isProcessing: false,
  isScrapingProfiles: false,
  searchString: '',
  onSearchTextChange: vi.fn(),
  onFileUpload: vi.fn(),
  onSubmit: vi.fn(),
  hideSearchTypeToggle: false,
  submitButtonText: 'Submit',
  onTextUpdate: vi.fn()
};

describe('SearchFormContent', () => {
  it('renders form content', () => {
    render(<SearchFormContent {...mockProps} />);
    
    expect(screen.getByDisplayValue('')).toBeDefined();
  });

  it('handles input changes', () => {
    const onSearchTextChange = vi.fn();
    
    render(<SearchFormContent {...mockProps} onSearchTextChange={onSearchTextChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test input' } });
    
    expect(onSearchTextChange).toHaveBeenCalled();
  });
});
