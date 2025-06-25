
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { SearchForm } from '../SearchForm';

// Mock the hooks
vi.mock('../hooks/useSearchForm', () => ({
  useSearchForm: () => ({
    formData: {
      searchText: '',
      companyName: '',
      searchType: 'general'
    },
    setFormData: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
    error: null
  })
}));

describe('SearchForm', () => {
  it('renders search form elements', () => {
    render(<SearchForm />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const mockSubmit = vi.fn();
    
    render(<SearchForm />);
    
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });
});
