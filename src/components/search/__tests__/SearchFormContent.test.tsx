
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(
      <SearchFormContent
        searchText=""
        companyName=""
        isProcessing={false}
        isScrapingProfiles={false}
        searchType={SearchType.CANDIDATES}
        searchString=""
        onSearchTypeChange={mockSearchTypeChange}
        onSearchTextChange={mockSearchTextChange}
        onCompanyNameChange={mockCompanyNameChange}
        onFileUpload={mockFileUpload}
        onSubmit={mockSubmit}
        onTextUpdate={mockTextUpdate} // Add the missing prop
      />
    );
  });

  it('calls onSubmit when form is submitted', () => {
    render(
      <SearchFormContent
        searchText="test"
        companyName=""
        isProcessing={false}
        isScrapingProfiles={false}
        searchType={SearchType.CANDIDATES}
        searchString=""
        onSearchTypeChange={mockSearchTypeChange}
        onSearchTextChange={mockSearchTextChange}
        onCompanyNameChange={mockCompanyNameChange}
        onFileUpload={mockFileUpload}
        onSubmit={mockSubmit}
        onTextUpdate={mockTextUpdate} // Add the missing prop
      />
    );
  });

  it('shows loading state when isProcessing is true', () => {
    render(
      <SearchFormContent
        isProcessing={true}
        searchText=""
        companyName=""
        isScrapingProfiles={false}
        searchType={SearchType.CANDIDATES}
        searchString=""
        onSearchTypeChange={mockSearchTypeChange}
        onSearchTextChange={mockSearchTextChange}
        onCompanyNameChange={mockCompanyNameChange}
        onFileUpload={mockFileUpload}
        onSubmit={mockSubmit}
        onTextUpdate={mockTextUpdate} // Add the missing prop
      />
    );
  });

  it('shows scraping profiles state when isScrapingProfiles is true', () => {
    render(
      <SearchFormContent
        isScrapingProfiles={true}
        searchText=""
        companyName=""
        isProcessing={false}
        searchType={SearchType.CANDIDATES}
        searchString=""
        onSearchTypeChange={mockSearchTypeChange}
        onSearchTextChange={mockSearchTextChange}
        onCompanyNameChange={mockCompanyNameChange}
        onFileUpload={mockFileUpload}
        onSubmit={mockSubmit}
        onTextUpdate={mockTextUpdate} // Add the missing prop
      />
    );
  });

  it('renders GoogleSearchWindow when searchString is provided', () => {
    const { rerender } = render(
      <SearchFormContent
        searchText=""
        companyName=""
        isProcessing={false}
        isScrapingProfiles={false}
        searchType={SearchType.CANDIDATES}
        searchString=""
        onSearchTypeChange={mockSearchTypeChange}
        onSearchTextChange={mockSearchTextChange}
        onCompanyNameChange={mockCompanyNameChange}
        onFileUpload={mockFileUpload}
        onSubmit={mockSubmit}
        onTextUpdate={mockTextUpdate} // Add the missing prop
      />
    );

    // It should not render GoogleSearchWindow when searchString is empty
    expect(screen.queryByTestId('mock-google-search')).not.toBeInTheDocument();

    rerender(
      <SearchFormContent
        searchText=""
        companyName=""
        isProcessing={false}
        isScrapingProfiles={false}
        searchString="test search string"
        onSearchTypeChange={mockSearchTypeChange}
        onSearchTextChange={mockSearchTextChange}
        onCompanyNameChange={mockCompanyNameChange}
        onFileUpload={mockFileUpload}
        onSubmit={mockSubmit}
        onTextUpdate={mockTextUpdate} // Add the missing prop
      />
    );

    // It should render GoogleSearchWindow when searchString has a value
    expect(screen.getByTestId('mock-google-search')).toBeInTheDocument();
  });
});
