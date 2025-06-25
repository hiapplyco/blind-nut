
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { SearchFormContent } from '../SearchFormContent';

// Mock the required props
const mockProps = {
  formData: {
    searchText: '',
    companyName: '',
    searchType: 'general' as const
  },
  setFormData: vi.fn(),
  handleSubmit: vi.fn(),
  isLoading: false,
  error: null
};

describe('SearchFormContent', () => {
  it('renders form content', () => {
    render(<SearchFormContent {...mockProps} />);
    
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    const setFormData = vi.fn();
    
    render(<SearchFormContent {...mockProps} setFormData={setFormData} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test input' } });
    
    expect(setFormData).toHaveBeenCalled();
  });
});
