import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { JobFormValues } from '../types';
import { useWatch } from "react-hook-form";

interface LocationFieldsProps {
  control: Control<JobFormValues>;
}

export function LocationFields({ control }: LocationFieldsProps) {
  const remoteAllowed = useWatch({
    control,
    name: "remote_allowed",
  });

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="remote_allowed"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel>Remote Allowed</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{remoteAllowed ? 'Location (Optional)' : 'Location'}</FormLabel>
            <FormControl>
              <Input 
                placeholder={remoteAllowed ? "Remote or specific location" : "Location"} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
