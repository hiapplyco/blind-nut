import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, userEvent } from '@/test/utils';
import { JobPostingForm } from './JobPostingForm';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock dependencies
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
  useToast: vi.fn(() => ({ toast: vi.fn() })),
}));

// Import the mocked module to access the mocks
import { supabase } from '@/integrations/supabase/client';

describe('JobPostingForm', () => {
  const mockNavigate = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnError = vi.fn();
  const mockSession = { user: { id: '123e4567-e89b-12d3-a456-426614174000' } };
  const mockSupabaseClient = supabase as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ session: mockSession });
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
  });

  describe('creating a new job', () => {
    it('should render the form with placeholder text', () => {
      render(<JobPostingForm />);

      const textarea = screen.getByPlaceholderText(/Title: Software Engineer/);
      expect(textarea).toBeInTheDocument();
      expect(screen.getByText(/Create Job Posting/)).toBeInTheDocument();
    });

    it('should submit a new job posting', async () => {
      const user = userEvent.setup();
      const mockJobData = {
        id: 1,
        content: 'Test job content',
        created_at: new Date().toISOString(),
        user_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockJobData, error: null }),
      }));
      
      // Mock the analyze function to resolve properly
      mockSupabaseClient.functions.invoke.mockResolvedValue({ data: {}, error: null });

      render(<JobPostingForm onSuccess={mockOnSuccess} />);

      const textarea = screen.getByPlaceholderText(/Title: Software Engineer/);
      await user.clear(textarea);
      await user.type(textarea, 'Test job content');

      const submitButton = screen.getByText(/Create Job Posting/);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('jobs');
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/job-editor/1', { replace: true });
      });
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Failed to create job';

      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: errorMessage } }),
      }));

      render(<JobPostingForm onError={mockOnError} />);

      const textarea = screen.getByPlaceholderText(/Title: Software Engineer/);
      await user.type(textarea, 'Test job content');

      const submitButton = screen.getByText(/Create Job Posting/);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Failed to save job posting');
      });
    });
  });

  describe('editing an existing job', () => {
    it('should load and display existing job content', async () => {
      const existingJobContent = 'Existing job content';
      
      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { content: existingJobContent }, 
          error: null 
        }),
      }));

      render(<JobPostingForm jobId="123" />);

      // First should show loading state
      expect(screen.getByText('Loading job details...')).toBeInTheDocument();

      // Then should show the loaded content
      await waitFor(() => {
        const textarea = screen.getByDisplayValue(existingJobContent);
        expect(textarea).toBeInTheDocument();
      });

      expect(screen.getByText(/Update Job Posting/)).toBeInTheDocument();
    });

    it('should handle job loading errors', async () => {
      const errorMessage = 'Job not found';
      
      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: errorMessage } 
        }),
      }));

      render(<JobPostingForm jobId="999" onError={mockOnError} />);

      await waitFor(() => {
        // The component shows 'Job not found' message
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Job not found');
        expect(mockOnError).toHaveBeenCalledWith('Job not found');
      });
    });
  });

  describe('form interactions', () => {
    it('should not disable submit button based on content', () => {
      render(<JobPostingForm />);

      // Button is not disabled when content is empty (form validation happens on submit)
      const submitButton = screen.getByText(/Create Job Posting/);
      expect(submitButton).not.toBeDisabled();
    });

    it('should allow typing in textarea', async () => {
      const user = userEvent.setup();
      render(<JobPostingForm />);

      const textarea = screen.getByPlaceholderText(/Title: Software Engineer/);
      await user.type(textarea, 'Some content');

      expect(textarea).toHaveValue('Some content');
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<JobPostingForm onCancel={mockOnCancel} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock a delayed response
      mockSupabaseClient.from.mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({ data: { id: 1 }, error: null }), 100))
        ),
      }));

      render(<JobPostingForm />);

      const textarea = screen.getByPlaceholderText(/Title: Software Engineer/);
      await user.type(textarea, 'Test content');

      const submitButton = screen.getByText(/Create Job Posting/);
      await user.click(submitButton);

      // Should show loading state - button will have spinner
      const button = screen.getByRole('button', { name: /Create Job Posting/ });
      expect(button).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });
});