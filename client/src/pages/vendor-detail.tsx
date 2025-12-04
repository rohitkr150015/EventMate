import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  Star,
  MapPin,
  IndianRupee,
  CheckCircle,
  Calendar,
  Building,
  UtensilsCrossed,
  Palette,
  Camera,
  Music,
  Flower2,
  Cake,
  Car,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import type { Vendor, Event } from "@shared/schema";

const categoryConfig: Record<string, { icon: any; label: string }> = {
  venue: { icon: Building, label: "Venue" },
  catering: { icon: UtensilsCrossed, label: "Catering" },
  decoration: { icon: Palette, label: "Decoration" },
  photography: { icon: Camera, label: "Photography" },
  entertainment: { icon: Music, label: "Entertainment" },
  florist: { icon: Flower2, label: "Florist" },
  cake: { icon: Cake, label: "Cake" },
  transport: { icon: Car, label: "Transport" },
  other: { icon: Building, label: "Other" },
};

export default function VendorDetail() {
  const [, params] = useRoute("/vendors/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showBooking, setShowBooking] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const { data: vendor, isLoading } = useQuery<Vendor>({
    queryKey: ["/api/vendors", params?.id],
    enabled: !!params?.id,
  });

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEvent, "bookings"] });
      setShowBooking(false);
      toast({
        title: "Booking request sent!",
        description: "The vendor will review your request shortly.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send booking request. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Vendor not found</p>
        <Link href="/vendors">
          <Button className="mt-4">Browse Vendors</Button>
        </Link>
      </div>
    );
  }

  const category = categoryConfig[vendor.category] || categoryConfig.other;
  const Icon = category.icon;
  const priceRange = vendor.priceRange as { min?: number; max?: number } | null;
  const services = vendor.services as string[] | null;
  const upcomingEvents = events?.filter(e => e.status !== "cancelled" && e.status !== "completed") || [];

  const handleBook = () => {
    if (!selectedEvent || !serviceName || !amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate({
      eventId: selectedEvent,
      vendorId: vendor.id,
      userId: user?.id,
      serviceName,
      amount: parseFloat(amount),
      notes,
      status: "pending",
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/vendors">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold" data-testid="text-vendor-name">{vendor.businessName}</h1>
            {vendor.isVerified && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="w-4 h-4" />
            <span>{category.label}</span>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
        <Icon className="w-24 h-24 text-primary/30" />
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            <div>
              <p className="text-2xl font-bold">{Number(vendor.rating).toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">{vendor.reviewCount} reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-semibold">{vendor.location || "Not specified"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Price Range</p>
              <p className="font-semibold">
                {priceRange
                  ? `₹${priceRange.min?.toLocaleString('en-IN')} - ₹${priceRange.max?.toLocaleString('en-IN')}`
                  : "Contact for pricing"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {vendor.description || "No description available."}
              </p>
            </CardContent>
          </Card>

          {/* Services */}
          {services && services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {services.map((service, i) => (
                    <Badge key={i} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Card */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Book This Vendor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {priceRange && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  <p className="text-3xl font-bold text-primary">
                    ₹{priceRange.min?.toLocaleString('en-IN')}
                  </p>
                </div>
              )}

              <Dialog open={showBooking} onOpenChange={setShowBooking}>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2" size="lg" data-testid="button-book-vendor">
                    <Calendar className="w-4 h-4" />
                    Request Booking
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book {vendor.businessName}</DialogTitle>
                    <DialogDescription>
                      Send a booking request to this vendor for your event.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Event *</label>
                      <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an event" />
                        </SelectTrigger>
                        <SelectContent>
                          {upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.title}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No events available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Service *</label>
                      <Input
                        placeholder="e.g., Full Day Photography"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Amount (₹) *</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes (Optional)</label>
                      <Textarea
                        placeholder="Any special requirements..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBooking(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBook}
                      disabled={bookingMutation.isPending || !selectedEvent || !serviceName || !amount}
                    >
                      {bookingMutation.isPending ? "Sending..." : "Send Request"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <p className="text-xs text-center text-muted-foreground">
                Free cancellation up to 7 days before the event
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
