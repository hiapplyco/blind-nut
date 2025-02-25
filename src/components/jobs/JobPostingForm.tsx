
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { JobFormValues, jobFormSchema } from './schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface JobPostingFormProps {
  jobId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Client {
  id: string;
  name: string;
}

export const JobPostingForm = ({ jobId = null, onSuccess, onCancel }: JobPostingFormProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      description: '',
      client_id: '',
      location: '',
      salary_min: '',
      salary_max: '',
      job_type: 'full-time',
      experience_level: 'entry',
      skills_required: '',
      application_deadline: null,
      remote_allowed: false,
      is_active: true
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name')
          .order('name');
        
        if (clientsError) throw clientsError;
        setClients(clientsData || []);
        
        if (jobId) {
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();
          
          if (jobError) throw jobError;
          
          if (jobData) {
            const formattedJobData = {
              ...jobData,
              salary_min: jobData.salary_min?.toString() || '',
              salary_max: jobData.salary_max?.toString() || '',
              application_deadline: jobData.application_deadline ? 
                new Date(jobData.application_deadline) : null
            };
            form.reset(formattedJobData);
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setFormError(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [jobId, form]);

  const onSubmit = async (data: JobFormValues) => {
    setLoading(true);
    setFormError(null);
    
    try {
      const jobData = {
        ...data,
        updated_at: new Date().toISOString(),
        skills_required: data.skills_required ? data.skills_required.split(',').map(s => s.trim()) : []
      };
      
      if (jobId) {
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', jobId);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('jobs')
          .insert([{ ...jobData, created_at: new Date().toISOString() }]);
          
        if (error) throw error;
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving job:', error);
      setFormError(`Failed to save job: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{jobId ? 'Edit Job Posting' : 'Create New Job Posting'}</CardTitle>
      </CardHeader>
      <CardContent>
        {formError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer, Marketing Manager, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Client Selection */}
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="New York, NY or Remote" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Job Type */}
              <FormField
                control={form.control}
                name="job_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Experience Level */}
              <FormField
                control={form.control}
                name="experience_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                        <SelectItem value="executive">Executive Level</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Minimum Salary */}
              <FormField
                control={form.control}
                name="salary_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="40000"
                        min="0"
                        step="1000"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Maximum Salary */}
              <FormField
                control={form.control}
                name="salary_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Salary</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="80000"
                        min="0"
                        step="1000"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Application Deadline */}
              <FormField
                control={form.control}
                name="application_deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Application Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Remote Allowed */}
              <FormField
                control={form.control}
                name="remote_allowed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Remote work allowed</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              {/* Is Active */}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Job posting is active</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              {/* Skills Required */}
              <FormField
                control={form.control}
                name="skills_required"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Skills Required</FormLabel>
                    <FormControl>
                      <Input placeholder="React, JavaScript, Node.js, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      Separate multiple skills with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Job Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Job Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed job description including responsibilities, requirements, benefits, etc."
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-between">
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {jobId ? 'Update Job Posting' : 'Create Job Posting'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
