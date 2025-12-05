import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    IndianRupee,
    TrendingUp,
    TrendingDown,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Building,
    UtensilsCrossed,
    Palette,
    Camera,
    Music, DollarSign
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useState } from "react";
import type { Event, Booking, Payment } from "@shared/schema";

const COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#6366f1"];

const categoryIcons: Record<string, any> = {
  venue: Building,
  catering: UtensilsCrossed,
  decoration: Palette,
  photography: Camera,
  entertainment: Music,
};

export default function BudgetPage() {
  const [selectedEvent, setSelectedEvent] = useState<string>("all");

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: payments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  // Calculate totals
  const filteredEvents = selectedEvent === "all" 
    ? events 
    : events?.filter(e => e.id === selectedEvent);

  const totalBudget = filteredEvents?.reduce((sum, e) => sum + (Number(e.budget) || 0), 0) || 0;
  const totalSpent = filteredEvents?.reduce((sum, e) => sum + (Number(e.spentAmount) || 0), 0) || 0;
  const totalRemaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Budget breakdown by category (mock data structure)
  const categoryBreakdown = [
    { name: "Venue", value: totalBudget * 0.35, color: COLORS[0] },
    { name: "Catering", value: totalBudget * 0.30, color: COLORS[1] },
    { name: "Decoration", value: totalBudget * 0.10, color: COLORS[2] },
    { name: "Photography", value: totalBudget * 0.10, color: COLORS[3] },
    { name: "Entertainment", value: totalBudget * 0.10, color: COLORS[4] },
    { name: "Other", value: totalBudget * 0.05, color: COLORS[5] },
  ];

  // Monthly spending data
  const monthlyData = [
    { month: "Jan", budget: 5000, spent: 4200 },
    { month: "Feb", budget: 8000, spent: 7500 },
    { month: "Mar", budget: 6000, spent: 5800 },
    { month: "Apr", budget: 10000, spent: 9200 },
    { month: "May", budget: 12000, spent: 11000 },
    { month: "Jun", budget: 15000, spent: 13500 },
  ];

  // Recent transactions
  const recentPayments = payments?.slice(0, 5) || [];

  if (eventsLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Budget Tracker</h1>
          <p className="text-muted-foreground">Monitor your event spending and stay on budget</p>
        </div>
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events?.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold" data-testid="stat-total-budget">
                  ₹{totalBudget.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-orange-600" data-testid="stat-total-spent">
                  ₹{totalSpent.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={spentPercentage} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">
                {spentPercentage.toFixed(1)}% of budget
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-2xl font-bold ${totalRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ₹{Math.abs(totalRemaining).toLocaleString('en-IN')}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                totalRemaining >= 0 
                  ? "bg-green-100 dark:bg-green-900/30" 
                  : "bg-red-100 dark:bg-red-900/30"
              }`}>
                {totalRemaining >= 0 ? (
                  <TrendingDown className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingUp className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalRemaining >= 0 ? "Under budget" : "Over budget"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Events</p>
                <p className="text-2xl font-bold">
                  {events?.filter(e => e.status !== "cancelled" && e.status !== "completed").length || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Budget Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Budget Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalBudget > 0 ? (
              <div className="flex items-center gap-6">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {categoryBreakdown.map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        ₹{category.value.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No budget data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Spending Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                  />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" name="Spent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Budget List */}
      <Card>
        <CardHeader>
          <CardTitle>Event Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          {events && events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => {
                const eventBudget = Number(event.budget) || 0;
                const eventSpent = Number(event.spentAmount) || 0;
                const eventRemaining = eventBudget - eventSpent;
                const eventProgress = eventBudget > 0 ? (eventSpent / eventBudget) * 100 : 0;

                return (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {event.type?.replace("_", " ")}
                          </p>
                        </div>
                        <Badge variant={
                          event.status === "confirmed" ? "default" :
                          event.status === "planning" ? "secondary" : "outline"
                        }>
                          {event.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-medium">₹{eventBudget.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Spent</p>
                          <p className="font-medium text-orange-600">₹{eventSpent.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Remaining</p>
                          <p className={`font-medium ${eventRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ₹{Math.abs(eventRemaining).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <Progress value={Math.min(eventProgress, 100)} className="h-2" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No events to track</p>
              <Link href="/events/new">
                <Button className="mt-4">Create Event</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
