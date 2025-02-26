
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { JobPostingForm } from './JobPostingForm';
import { Button } from '@/components/ui/button';

export const JobPostingPage = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    // Remove this since navigation is handled in useJobPostingForm
    console.log('Job posted successfully');
  };
  
  const handleCancel = () => {
    navigate(-1);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          {id ? 'Edit Job Posting' : 'Create New Job Posting'}
        </h1>
      </div>
      
      <JobPostingForm 
        jobId={id} 
        onSuccess={handleSuccess} 
        onCancel={handleCancel} 
      />
    </div>
  );
}

