
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useClarvidaAuth } from "@/context/ClarvidaAuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClarvidaHeader } from "@/components/clarvida/ClarvidaHeader";

const ClarvidaLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useClarvidaAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/clarvida";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      
      if (isSignUp) {
        result = await signUp(email, password);
        if (!result.error) {
          toast.success("Account created! Please check your email for verification.");
        }
      } else {
        result = await signIn(email, password);
        if (!result.error) {
          toast.success("Successfully signed in!");
          navigate(from, { replace: true });
        }
      }

      if (result.error) {
        toast.error(result.error.message);
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error("An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F0FB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <ClarvidaHeader />
        
        <div className="mt-8 bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {isSignUp ? "Create a Clarvida Account" : "Sign in to Clarvida"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1 block w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1 block w-full"
              />
            </div>
            
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
          </form>
          
          <div className="mt-6 text-center">
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
        </div>
      </div>
    </div>
  );
};

export default ClarvidaLogin;
