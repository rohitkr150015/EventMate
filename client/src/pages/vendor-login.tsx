import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";

export default function VendorLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch("/api/auth/vendor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      setLocation("/vendor");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Login failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-background to-background" />
      
      <div className="relative w-full max-w-md">
        <Button
          variant="ghost"
          className="absolute -top-16 left-0 gap-2"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Button>

        <Card className="border-2 border-purple-500/20 bg-card/80 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Vendor Login</CardTitle>
            <CardDescription>
              Sign in to manage your business on EventMate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                  data-testid="input-vendor-login-email"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                  data-testid="input-vendor-login-password"
                  autoComplete="current-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700"
                disabled={loginMutation.isPending}
                data-testid="button-submit-vendor-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have a vendor account? </span>
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-purple-600"
                onClick={() => setLocation("/vendor/register")}
                data-testid="link-vendor-register"
              >
                Register as vendor
              </Button>
            </div>
            <div className="mt-2 text-center text-sm">
              <span className="text-muted-foreground">Looking to plan an event? </span>
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-primary"
                onClick={() => setLocation("/login")}
                data-testid="link-user-login"
              >
                Sign in as a user
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
