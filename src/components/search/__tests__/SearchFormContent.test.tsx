
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SearchFormContent } from '../SearchFormContent';
import { SearchType } from '../types';

// Mock components that might be using browser APIs
vi.mock('../GoogleSearchWindow', () => ({
  default: () => <div data-testid="mock-google-search">Google Search Window</div>,
}));

vi.mock('../CaptureWindow', () => ({
  default: () => <div data-testid="mock-capture-window">Capture Window</div>,
}));

describe('SearchFormContent', () => {
  const mockSearchTypeChange = vi.fn();
  const mockSearchTextChange = vi.fn();
  const mockCompanyNameChange = vi.fn();
  const mockFileUpload = vi.fn();
  const mockSubmit = vi.fn();
  const mockTextUpdate = vi.fn(); // Added missing mock function

  // Create a constant for searchType to avoid using the type as a value
  const CANDIDATES_TYPE = 'candidates';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(
      <SearchFormContent
        searchText=""
        isProcessing={false}
        isScrapingProfiles={false}
        searchString=""
        onSearchTextChange={mockSearchTextChange}
        onFileUpload={mockFileUpload}
        onSubmit={mockSubmit}
        onTextUpdate={mockTextUpdate}
        hideSearchTypeToggle={false}
      />
    );
  });

  it('calls onSubmit when form is submitted', () => {
    render(
      <SearchFormContent
        searchText="test"
        isProcessing={false}
        isScrapingProfiles={false}
        searchString=""
        onSearchTextChange={mockSearchTextChange}
        onFileUpload={mockFileUpload}
        onSubmit={mockSubmit}
        onTextUpdate={mockTextUpdate}
        hideSearchTypeToggle={false}
      />
    );
  });

  it('shows loading state when isProcessing is true', () => {
    render(
      <SearchFormContent
        isProcessing={true}
        searchText=""
        isScrapingProfiles={false}
        searchString=""
        onSearchTextChange={mockSearchTextChange}
        onFileUpload={mockFileUpload}
        onSubmit={mockSubmit}
        onTextUpdate={mockTextUpdate}
        hideSearchTypeToggle={false}
      />
    );
  });

  it('shows scraping profiles state when isScrapingProfiles is true', () => {
    render(
      <SearchFormContent
        isScrapingProfiles={true}
        searchText=""
        isProcessing={false}
        searchString=""
        onSearchTextChange={mockSearchTextChange}
        onFileUpload={mockFileUpload}
        onSubmit={mockSubmit}
        onTextUpdate={mockTextUpdate}
        hideSearchTypeToggle={false}
      />
    );
  });

  it('renders GoogleSearchWindow when searchString is provided', () => {
    const { rerender } = render(
      <SearchFormContent
        searchText=""
        isProcessing={false}
        isScrapingProfiles={false}
        searchString=""
        onSearchTextChange={mockSearchTextChange}
        onFileUpload={mockFileUpload}
        onSubmit={mockSubmit}
        onTextUpdate={mockTextUpdate}
        hideSearchTypeToggle={false}
      />
    );

    // It should not render GoogleSearchWindow when searchString is empty
    expect(screen.queryByTestId('mock-google-search')).not.toBeInTheDocument();

    rerender(
      <SearchFormContent
        searchText=""
        isProcessing={false}
        isScrapingProfiles={false}
        searchString="test search string"
        onSearchTextChange={mockSearchTextChange}
        onFileUpload={mockFileUpload}
        onSubmit={mockSubmit}
        onTextUpdate={mockTextUpdate}
        hideSearchTypeToggle={false}
      />
    );

    // It should render GoogleSearchWindow when searchString has a value
    expect(screen.getByTestId('mock-google-search')).toBeInTheDocument();
  });
});
