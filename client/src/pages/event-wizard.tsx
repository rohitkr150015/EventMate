import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee,
  Sparkles,
  Check,
  Loader2,
  Building,
  UtensilsCrossed,
  Palette,
  Camera,
  Music,
  Flower2,
  Cake,
  Car
} from "lucide-react";
import { format } from "date-fns";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.string().min(1, "Please select an event type"),
  description: z.string().optional(),
  date: z.string().min(1, "Please select a date"),
  endDate: z.string().optional(),
  location: z.string().min(1, "Please enter a location"),
  guestCount: z.number().min(1, "Guest count must be at least 1"),
  budget: z.number().min(10000, "Budget must be at least ₹10,000"),
  theme: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

const eventTypes = [
  { value: "wedding", label: "Wedding", icon: "💒" },
  { value: "birthday", label: "Birthday Party", icon: "🎂" },
  { value: "corporate", label: "Corporate Event", icon: "🏢" },
  { value: "conference", label: "Conference", icon: "🎤" },
  { value: "reunion", label: "Family Reunion", icon: "👨‍👩‍👧‍👦" },
  { value: "graduation", label: "Graduation", icon: "🎓" },
  { value: "anniversary", label: "Anniversary", icon: "💑" },
  { value: "baby_shower", label: "Baby Shower", icon: "👶" },
  { value: "engagement", label: "Engagement Party", icon: "💍" },
  { value: "other", label: "Other", icon: "🎉" },
];

const vendorCategoryIcons: Record<string, any> = {
  venue: Building,
  catering: UtensilsCrossed,
  decoration: Palette,
  photography: Camera,
  entertainment: Music,
  florist: Flower2,
  cake: Cake,
  transport: Car,
};

const steps = [
  { id: 1, title: "Event Basics", description: "Name and type of event" },
  { id: 2, title: "Details", description: "Date, location, and guests" },
  { id: 3, title: "Budget", description: "Set your budget" },
  { id: 4, title: "AI Recommendations", description: "Get personalized suggestions" },
  { id: 5, title: "Review", description: "Confirm and create" },
];

export default function EventWizard() {
  const [step, setStep] = useState(1);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      type: "",
      description: "",
      date: "",
      endDate: "",
      location: "",
      guestCount: 50,
      budget: 200000,
      theme: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      return apiRequest("POST", "/api/events", {
        ...data,
        aiRecommendations,
        status: "planning",
      });
    },
    onSuccess: async (response) => {
      const event = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event created!",
        description: "Your event has been created successfully.",
      });
      navigate(`/events/${event.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const fetchAIRecommendations = async () => {
    const values = form.getValues();
    setIsLoadingAI(true);
    try {
      const response = await apiRequest("POST", "/api/ai/recommendations", {
        eventType: values.type,
        budget: values.budget,
        guestCount: values.guestCount,
        location: values.location,
        date: values.date,
        theme: values.theme,
      });
      const data = await response.json();
      setAiRecommendations(data);
    } catch (error) {
      toast({
        title: "AI Recommendations",
        description: "Could not fetch AI recommendations. Using default suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof EventFormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ["title", "type"];
        break;
      case 2:
        fieldsToValidate = ["date", "location", "guestCount"];
        break;
      case 3:
        fieldsToValidate = ["budget"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (!isValid) return;

    if (step === 3) {
      await fetchAIRecommendations();
    }
    
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const progress = (step / steps.length) * 100;
  const values = form.watch();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Create New Event</h1>
          <span className="text-sm text-muted-foreground">
            Step {step} of {steps.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-4">
          {steps.map((s) => (
            <div 
              key={s.id}
              className={`flex flex-col items-center ${
                s.id === step ? "text-primary" : s.id < step ? "text-muted-foreground" : "text-muted"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-1 ${
                s.id < step ? "bg-primary border-primary text-primary-foreground" :
                s.id === step ? "border-primary text-primary" : "border-muted"
              }`}>
                {s.id < step ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span className="text-xs hidden md:block">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Step 1: Event Basics */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Event Basics</CardTitle>
                <CardDescription>
                  Let's start with the basics of your event.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Sarah & John's Wedding" 
                          {...field}
                          data-testid="input-event-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {eventTypes.map((type) => (
                          <div
                            key={type.value}
                            onClick={() => field.onChange(type.value)}
                            className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                              field.value === type.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            data-testid={`select-event-type-${type.value}`}
                          >
                            <div className="text-2xl mb-1">{type.icon}</div>
                            <div className="text-sm font-medium">{type.label}</div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us more about your event..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="input-event-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>
                  When and where is your event happening?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field}
                            data-testid="input-event-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field}
                            data-testid="input-event-end-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            placeholder="e.g., New York, NY"
                            className="pl-10"
                            {...field}
                            data-testid="input-event-location"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guestCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Guests</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            min={1}
                            className="pl-10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-event-guests"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Approximate number of guests expected
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Rustic Garden, Modern Minimalist"
                          {...field}
                          data-testid="input-event-theme"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Set Your Budget</CardTitle>
                <CardDescription>
                  Our AI will help you allocate your budget optimally.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Budget</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            min={10000}
                            step={5000}
                            className="pl-10 text-2xl font-bold h-14"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-event-budget"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        This is your estimated total budget for the event
                      </FormDescription>
                      <FormMessage />

                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mt-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-semibold mb-1">AI Budget Optimization</h4>
                            <p className="text-sm text-muted-foreground">
                              In the next step, our AI will analyze your event details and provide 
                              personalized budget allocation recommendations to help you get the most 
                              value from your budget.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {[
                          { label: "Budget-Friendly", value: 100000 },
                          { label: "Standard", value: 200000 },
                          { label: "Premium", value: 500000 },
                          { label: "Luxury", value: 1000000 },
                          { label: "Grand", value: 2500000 },
                          { label: "Custom", value: null },
                        ].map((preset) => (
                          <Button
                            key={preset.label}
                            type="button"
                            variant={field.value === preset.value ? "default" : "outline"}
                            className="h-auto py-3 flex-col"
                            onClick={() => preset.value && form.setValue("budget", preset.value)}
                            data-testid={`button-budget-${preset.label.toLowerCase().replace(' ', '-')}`}
                          >
                            <span className="text-lg font-bold">
                              {preset.value ? `₹${preset.value.toLocaleString('en-IN')}` : "Custom"}
                            </span>
                            <span className="text-xs opacity-70">{preset.label}</span>
                          </Button>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 4: AI Recommendations */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized suggestions based on your event details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingAI ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                    <p className="text-center text-muted-foreground">
                      Our AI is analyzing your event details...
                    </p>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  </div>
                ) : aiRecommendations ? (
                  <>
                    {/* Vendor Recommendations */}
                    <div>
                      <h3 className="font-semibold mb-3">Recommended Vendors</h3>
                      <div className="grid gap-3">
                        {aiRecommendations.vendorRecommendations?.map((rec: any, i: number) => {
                          const Icon = vendorCategoryIcons[rec.category] || Building;
                          return (
                            <div key={i} className="p-4 rounded-lg border bg-card">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{rec.name}</span>
                                    <Badge variant={rec.priority === "essential" ? "default" : "secondary"}>
                                      {rec.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-primary">
                                      ₹{rec.estimatedCost?.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{rec.reason}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Budget Breakdown */}
                    <div>
                      <h3 className="font-semibold mb-3">Suggested Budget Allocation</h3>
                      <div className="space-y-2">
                        {aiRecommendations.budgetBreakdown?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-24 text-sm">{item.category}</div>
                            <div className="flex-1">
                              <Progress value={item.percentage} className="h-2" />
                            </div>
                            <div className="w-16 text-right text-sm font-medium">
                              {item.percentage}%
                            </div>
                            <div className="w-24 text-right text-sm text-muted-foreground">
                              ₹{item.estimatedAmount?.toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    {aiRecommendations.tips?.length > 0 && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          Planning Tips
                        </h4>
                        <ul className="space-y-2">
                          {aiRecommendations.tips.map((tip: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recommendations available. Please try again.</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={fetchAIRecommendations}
                      className="mt-4"
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Event</CardTitle>
                <CardDescription>
                  Confirm the details before creating your event.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Event Name</label>
                      <p className="font-semibold text-lg">{values.title}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Event Type</label>
                      <p className="font-medium capitalize">{values.type?.replace("_", " ")}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Date</label>
                      <p className="font-medium">
                        {values.date && format(new Date(values.date), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Location</label>
                      <p className="font-medium">{values.location}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Expected Guests</label>
                      <p className="font-semibold text-lg">{values.guestCount}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Budget</label>
                      <p className="font-semibold text-lg text-primary">
                        ₹{values.budget?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    {values.theme && (
                      <div>
                        <label className="text-sm text-muted-foreground">Theme</label>
                        <p className="font-medium">{values.theme}</p>
                      </div>
                    )}
                    {values.description && (
                      <div>
                        <label className="text-sm text-muted-foreground">Description</label>
                        <p className="text-sm">{values.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Ready to create your event!</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                    Once created, you can browse vendors, book services, and track your planning progress.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? () => navigate("/") : prevStep}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            
            {step < 5 ? (
              <Button 
                type="button" 
                onClick={nextStep}
                className="gap-2"
                disabled={isLoadingAI}
                data-testid="button-next-step"
              >
                {isLoadingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                type="submit"
                className="gap-2"
                disabled={createEventMutation.isPending}
                data-testid="button-create-event"
              >
                {createEventMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create Event
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
