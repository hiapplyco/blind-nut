
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { JobFormValues } from "../schema";

interface LocationFieldsProps {
  control: Control<JobFormValues>;
}

export function LocationFields({ control }: LocationFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="Location" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
    </div>
  );
}
