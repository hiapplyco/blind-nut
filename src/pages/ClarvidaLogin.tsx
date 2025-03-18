
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useClarvidaAuth } from "@/context/ClarvidaAuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { ClarvidaHeader } from "@/components/clarvida/ClarvidaHeader";

// Define form schema for validation
const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

const ClarvidaLogin = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, isAuthenticated } = useClarvidaAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/clarvida";

  // Initialize form with validation
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Check if user is already authenticated
  useEffect(() => {
    console.log("ClarvidaLogin - Auth state:", { isAuthenticated, redirectTo: from });
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (values: AuthFormValues) => {
    console.log("Clarvida form submission:", { isSignUp, email: values.email });
    setIsLoading(true);

    try {
      let result;
      
      if (isSignUp) {
        result = await signUp(values.email, values.password);
        if (!result.error) {
          toast.success("Account created! Please check your email for verification.");
        }
      } else {
        result = await signIn(values.email, values.password);
        if (!result.error) {
          toast.success("Successfully signed in to Clarvida!");
          navigate(from, { replace: true });
        }
      }

      if (result.error) {
        console.error("Clarvida auth error:", result.error);
        toast.error(result.error.message || "Authentication failed");
      }
    } catch (err) {
      console.error("Clarvida auth unexpected error:", err);
      toast.error("An unexpected error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  // Added for debugging
  useEffect(() => {
    console.log("ClarvidaLogin component mounted at path:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F1F0FB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <ClarvidaHeader />
        
        <Card className="mt-8 shadow-lg rounded-lg p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? "Create a Clarvida Account" : "Sign in to Clarvida"}
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {isSignUp 
                ? "Fill in your details to create an account" 
                : "Enter your credentials to access your account"}
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full bg-[#8B5CF6] hover:bg-[#7c4ef3]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    </span>
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </>
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-[#8B5CF6] hover:text-[#7c4ef3] font-medium"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ClarvidaLogin;
