
import { render } from '@testing-library/react';
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
    const { container } = render(<SearchFormContent {...mockProps} />);
    
    expect(container.querySelector('form')).toBeTruthy();
  });

  it('renders without crashing', () => {
    const { container } = render(<SearchFormContent {...mockProps} />);
    
    expect(container).toBeTruthy();
  });
});
