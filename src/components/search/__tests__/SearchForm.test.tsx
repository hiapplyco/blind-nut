
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SearchForm } from '../SearchForm';
import { vi } from 'vitest';

const mockOnJobCreated = vi.fn();
const defaultProps = {
  userId: 'test-user-id',
  onJobCreated: mockOnJobCreated,
  currentJobId: null,
};

describe('SearchForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <SearchForm {...defaultProps} />
      </MemoryRouter>
    );
    
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('handles search type toggle correctly', () => {
    render(
      <MemoryRouter>
        <SearchForm {...defaultProps} />
      </MemoryRouter>
    );

    const candidatesButton = screen.getByRole('button', { name: /candidates/i });
    const companiesButton = screen.getByRole('button', { name: /companies/i });
    
    fireEvent.click(companiesButton);
    expect(companiesButton).toHaveAttribute('aria-pressed', 'true');
    
    fireEvent.click(candidatesButton);
    expect(candidatesButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows company name input only for candidates-at-company search type', () => {
    render(
      <MemoryRouter>
        <SearchForm {...defaultProps} />
      </MemoryRouter>
    );

    // Company name input should not be visible initially
    expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();

    // Click candidates-at-company button
    const candidatesAtCompanyButton = screen.getByRole('button', { name: /candidates at company/i });
    fireEvent.click(candidatesAtCompanyButton);

    // Company name input should now be visible
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
  });

  it('disables submit button when required fields are empty', () => {
    render(
      <MemoryRouter>
        <SearchForm {...defaultProps} />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /generate search/i });
    expect(submitButton).toBeDisabled();
  });
});
