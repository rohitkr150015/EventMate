import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocation, useRoute, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee,
  Save,
  Loader2
} from "lucide-react";
import type { Event } from "@shared/schema";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.string().min(1, "Please select an event type"),
  description: z.string().optional(),
  date: z.string().min(1, "Please select a date"),
  endDate: z.string().optional(),
  location: z.string().min(1, "Please enter a location"),
  guestCount: z.number().min(1, "Guest count must be at least 1"),
  budget: z.number().min(10000, "Budget must be at least 10,000"),
  theme: z.string().optional(),
  status: z.string(),
});

type EventFormData = z.infer<typeof eventSchema>;

const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday Party" },
  { value: "corporate", label: "Corporate Event" },
  { value: "conference", label: "Conference" },
  { value: "reunion", label: "Family Reunion" },
  { value: "graduation", label: "Graduation" },
  { value: "anniversary", label: "Anniversary" },
  { value: "baby_shower", label: "Baby Shower" },
  { value: "engagement", label: "Engagement Party" },
  { value: "other", label: "Other" },
];

const eventStatuses = [
  { value: "draft", label: "Draft" },
  { value: "planning", label: "Planning" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function EventEdit() {
  const [, params] = useRoute("/events/:id/edit");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["/api/events", params?.id],
    enabled: !!params?.id,
  });

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
      status: "planning",
    },
  });

  useEffect(() => {
    if (event) {
      const formatDateForInput = (dateStr: string | Date | null) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toISOString().slice(0, 16);
      };

      form.reset({
        title: event.title || "",
        type: event.type || "",
        description: event.description || "",
        date: formatDateForInput(event.date),
        endDate: formatDateForInput(event.endDate),
        location: event.location || "",
        guestCount: event.guestCount || 50,
        budget: Number(event.budget) || 200000,
        theme: event.theme || "",
        status: event.status || "planning",
      });
    }
  }, [event, form]);

  const updateEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      return apiRequest("PATCH", `/api/events/${params?.id}`, data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", params?.id] });
      toast({
        title: "Event updated!",
        description: "Your event has been updated successfully.",
      });
      navigate(`/events/${params?.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    updateEventMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Event not found</p>
        <Link href="/events">
          <Button className="mt-4">Back to Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/events/${params?.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground">Update your event details</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Basic information about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        data-testid="input-edit-event-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-event-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-event-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        data-testid="input-edit-event-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date & Location</CardTitle>
              <CardDescription>When and where is your event?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date & Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            type="datetime-local" 
                            className="pl-10"
                            {...field}
                            data-testid="input-edit-event-date"
                          />
                        </div>
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
                      <FormLabel>End Date & Time (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            type="datetime-local" 
                            className="pl-10"
                            {...field}
                            data-testid="input-edit-event-end-date"
                          />
                        </div>
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
                          placeholder="e.g., Mumbai, Maharashtra"
                          className="pl-10"
                          {...field}
                          data-testid="input-edit-event-location"
                        />
                      </div>
                    </FormControl>
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
                        data-testid="input-edit-event-theme"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guests & Budget</CardTitle>
              <CardDescription>Plan your resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
                            data-testid="input-edit-event-guests"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Budget (INR)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            min={10000}
                            step={5000}
                            className="pl-10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-edit-event-budget"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Link href={`/events/${params?.id}`}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={updateEventMutation.isPending}
              className="gap-2"
              data-testid="button-save-event"
            >
              {updateEventMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
