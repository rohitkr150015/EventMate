import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";

const vendorCategories = [
  { value: 'venue', label: 'Venue' },
  { value: 'catering', label: 'Catering' },
  { value: 'decoration', label: 'Decoration' },
  { value: 'photography', label: 'Photography' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'florist', label: 'Florist' },
  { value: 'cake', label: 'Cake' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
];

export default function VendorRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    category: "",
    description: "",
    location: "",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/auth/vendor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName || undefined,
          lastName: data.lastName || undefined,
          phone: data.phone || undefined,
          businessName: data.businessName,
          category: data.category,
          description: data.description || undefined,
          location: data.location || undefined,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ 
        title: "Welcome to EventMate!", 
        description: "Your vendor account has been created. You can now manage your business." 
      });
      setLocation("/vendor");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Registration failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({ 
        title: "Passwords don't match", 
        description: "Please make sure your passwords match.",
        variant: "destructive" 
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({ 
        title: "Password too short", 
        description: "Password must be at least 8 characters long.",
        variant: "destructive" 
      });
      return;
    }

    if (!formData.category) {
      toast({ 
        title: "Category required", 
        description: "Please select a business category.",
        variant: "destructive" 
      });
      return;
    }

    registerMutation.mutate(formData);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-background to-background" />
      
      <div className="relative w-full max-w-lg">
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
            <CardTitle className="text-2xl font-bold">Become a Vendor</CardTitle>
            <CardDescription>
              Join EventMate and grow your event business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className="h-11"
                    data-testid="input-vendor-firstname"
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className="h-11"
                    data-testid="input-vendor-lastname"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Your Business Name"
                  value={formData.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  required
                  className="h-11"
                  data-testid="input-vendor-business-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => updateField("category", value)}>
                    <SelectTrigger className="h-11" data-testid="select-vendor-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    className="h-11"
                    data-testid="input-vendor-location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your business..."
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="min-h-[80px]"
                  data-testid="input-vendor-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                    className="h-11"
                    data-testid="input-vendor-email"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="h-11"
                    data-testid="input-vendor-phone"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                    className="h-11"
                    data-testid="input-vendor-password"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    required
                    className="h-11"
                    data-testid="input-vendor-confirm-password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700"
                disabled={registerMutation.isPending}
                data-testid="button-submit-vendor-register"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Vendor Account"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have a vendor account? </span>
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-purple-600"
                onClick={() => setLocation("/vendor/login")}
                data-testid="link-vendor-login"
              >
                Sign in
              </Button>
            </div>
            <div className="mt-2 text-center text-sm">
              <span className="text-muted-foreground">Looking to plan an event? </span>
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-primary"
                onClick={() => setLocation("/register")}
                data-testid="link-user-register"
              >
                Sign up as a user
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
