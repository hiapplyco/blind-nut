import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobFormValues, JobType, ExperienceLevel } from '../types';

interface JobDetailsFieldsProps {
  register: any;
  errors: any;
  setValue: any;
  getValues: any;
}

export const JobDetailsFields: React.FC<JobDetailsFieldsProps> = ({ register, errors, setValue, getValues }) => {
  return (
    <>
      <div>
        <Label htmlFor="jobType">Job Type</Label>
        <Select
          onValueChange={(value: JobType) => setValue('jobType', value)}
          defaultValue={getValues('jobType')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Part-time">Part-time</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Internship">Internship</SelectItem>
            <SelectItem value="Freelance">Freelance</SelectItem>
          </SelectContent>
        </Select>
        {errors.jobType && (
          <p className="text-red-500 text-sm">{errors.jobType.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="experienceLevel">Experience Level</Label>
        <Select
          onValueChange={(value: ExperienceLevel) => setValue('experienceLevel', value)}
          defaultValue={getValues('experienceLevel')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Entry">Entry</SelectItem>
            <SelectItem value="Mid">Mid</SelectItem>
            <SelectItem value="Senior">Senior</SelectItem>
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Executive">Executive</SelectItem>
          </SelectContent>
        </Select>
        {errors.experienceLevel && (
          <p className="text-red-500 text-sm">{errors.experienceLevel.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="skills">Skills Required (comma-separated)</Label>
        <Input
          type="text"
          id="skills"
          {...register("skills")}
          placeholder="e.g., React, TypeScript, Node.js"
        />
        {errors.skills && (
          <p className="text-red-500 text-sm">{errors.skills.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="applicationDeadline">Application Deadline</Label>
        <Input
          type="date"
          id="applicationDeadline"
          {...register("applicationDeadline")}
        />
        {errors.applicationDeadline && (
          <p className="text-red-500 text-sm">{errors.applicationDeadline.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="remoteAllowed">Remote Allowed</Label>
        <select
          id="remoteAllowed"
          {...register("remoteAllowed", { valueAs: 'boolean' })}
          className="w-full border rounded-md py-2 px-3"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        {errors.remoteAllowed && (
          <p className="text-red-500 text-sm">{errors.remoteAllowed.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Detailed job description..."
          className="min-h-[100px]"
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>
    </>
  );
};
