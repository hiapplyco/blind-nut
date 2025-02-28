
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { JobFormValues } from '../types';

interface CompensationFieldsProps {
  control: Control<JobFormValues>;
}

export function CompensationFields({ control }: CompensationFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={control}
        name="salaryMin"
        render={({ field: { value, onChange, ...field } }) => (
          <FormItem>
            <FormLabel>Minimum Salary</FormLabel>
            <FormControl>
              <Input 
                type="number"
                placeholder="Minimum salary"
                {...field}
                value={value ?? ""}
                onChange={e => onChange(e.target.valueAsNumber)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="salaryMax"
        render={({ field: { value, onChange, ...field } }) => (
          <FormItem>
            <FormLabel>Maximum Salary</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Maximum salary"
                {...field}
                value={value ?? ""}
                onChange={e => onChange(e.target.valueAsNumber)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
