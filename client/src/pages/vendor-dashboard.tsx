import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  IndianRupee, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  Package,
  Users,
  AlertCircle,
  Building
} from "lucide-react";
import { format } from "date-fns";
import type { Vendor, Booking } from "@shared/schema";

export default function VendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    businessName: "",
    category: "",
    description: "",
    location: "",
    priceMin: "",
    priceMax: "",
  });

  const { data: vendor, isLoading: vendorLoading } = useQuery<Vendor>({
    queryKey: ["/api/vendor/profile"],
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/vendor/bookings"],
    enabled: !!vendor,
  });

  const setupVendorMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/vendor/setup", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setShowSetupDialog(false);
      toast({ title: "Vendor profile created!" });
    },
    onError: () => {
      toast({ title: "Failed to create profile", variant: "destructive" });
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      return apiRequest("PATCH", `/api/bookings/${bookingId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/bookings"] });
      toast({ title: "Booking updated" });
    },
  });

  const handleSetup = () => {
    if (!vendorForm.businessName || !vendorForm.category) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setupVendorMutation.mutate({
      userId: user?.id,
      businessName: vendorForm.businessName,
      category: vendorForm.category,
      description: vendorForm.description,
      location: vendorForm.location,
      priceRange: {
        min: parseInt(vendorForm.priceMin) || 0,
        max: parseInt(vendorForm.priceMax) || 0,
      },
    });
  };

  const pendingBookings = bookings?.filter(b => b.status === "pending") || [];
  const acceptedBookings = bookings?.filter(b => b.status === "accepted") || [];
  const completedBookings = bookings?.filter(b => b.status === "completed") || [];
  const totalEarnings = bookings
    ?.filter(b => b.status === "completed")
    .reduce((sum, b) => sum + Number(b.amount), 0) || 0;

  if (vendorLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Show setup dialog if no vendor profile
  if (!vendor) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Become a Vendor</CardTitle>
            <CardDescription>
              Set up your vendor profile to start receiving booking requests from event planners.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Business Name *</label>
              <Input
                placeholder="Your business name"
                value={vendorForm.businessName}
                onChange={(e) => setVendorForm({ ...vendorForm, businessName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={vendorForm.category}
                onValueChange={(value) => setVendorForm({ ...vendorForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your service category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venue">Venue</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="decoration">Decoration</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="florist">Florist</SelectItem>
                  <SelectItem value="cake">Cake</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Tell clients about your services..."
                value={vendorForm.description}
                onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="City, State"
                value={vendorForm.location}
                onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Min Price (₹)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={vendorForm.priceMin}
                  onChange={(e) => setVendorForm({ ...vendorForm, priceMin: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Price (₹)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={vendorForm.priceMax}
                  onChange={(e) => setVendorForm({ ...vendorForm, priceMax: e.target.value })}
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleSetup}
              disabled={setupVendorMutation.isPending}
            >
              {setupVendorMutation.isPending ? "Creating..." : "Create Vendor Profile"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">{vendor.businessName}</p>
        </div>
        <div className="flex items-center gap-2">
          {vendor.isVerified ? (
            <Badge className="gap-1 bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3" />
              Verified
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              Pending Verification
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingBookings.length}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{acceptedBookings.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString('en-IN')}</p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Number(vendor.rating).toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">{vendor.reviewCount} Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingBookings.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Pending Bookings */}
        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length > 0 ? (
            pendingBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold">{booking.serviceName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Requested {booking.createdAt && format(new Date(booking.createdAt), "MMM d, yyyy")}
                      </p>
                      {booking.notes && (
                        <p className="text-sm mt-2 bg-muted p-2 rounded">{booking.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xl font-bold">₹{Number(booking.amount).toLocaleString('en-IN')}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => updateBookingMutation.mutate({
                            bookingId: booking.id,
                            status: "rejected"
                          })}
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => updateBookingMutation.mutate({
                            bookingId: booking.id,
                            status: "accepted"
                          })}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No pending booking requests</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Upcoming Bookings */}
        <TabsContent value="upcoming" className="space-y-4">
          {acceptedBookings.length > 0 ? (
            acceptedBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{booking.serviceName}</h4>
                        <Badge className="bg-green-100 text-green-700">Confirmed</Badge>
                      </div>
                      {booking.scheduledDate && (
                        <p className="text-sm text-muted-foreground">
                          Scheduled: {format(new Date(booking.scheduledDate), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">₹{Number(booking.amount).toLocaleString('en-IN')}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => updateBookingMutation.mutate({
                          bookingId: booking.id,
                          status: "completed"
                        })}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No upcoming bookings</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Completed Bookings */}
        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length > 0 ? (
            completedBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{booking.serviceName}</h4>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.createdAt && format(new Date(booking.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      +₹{Number(booking.amount).toLocaleString('en-IN')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No completed bookings yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Manage your vendor profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Business Name</label>
                  <p className="mt-1 p-2 bg-muted rounded">{vendor.businessName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <p className="mt-1 p-2 bg-muted rounded capitalize">{vendor.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <p className="mt-1 p-2 bg-muted rounded">{vendor.location || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Price Range</label>
                  <p className="mt-1 p-2 bg-muted rounded">
                    {vendor.priceRange
                      ? `₹${(vendor.priceRange as any).min?.toLocaleString('en-IN')} - ₹${(vendor.priceRange as any).max?.toLocaleString('en-IN')}`
                      : "Not specified"}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="mt-1 p-3 bg-muted rounded min-h-[80px]">
                  {vendor.description || "No description provided"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
