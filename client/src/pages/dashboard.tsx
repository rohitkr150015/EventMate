import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  Calendar, 
  Plus, 
  Clock, 
  IndianRupee, 
  Users,
  MapPin,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import type { Event, EventTask } from "@shared/schema";

function EventCard({ event }: { event: Event }) {
  const isUpcoming = isAfter(new Date(event.date), new Date());
  const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    planning: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    confirmed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover-elevate cursor-pointer transition-all h-full">
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
          <Calendar className="w-12 h-12 text-primary/50" />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="outline" className={statusColors[event.status]}>
              {event.status}
            </Badge>
            {isUpcoming && daysUntil <= 7 && (
              <Badge variant="destructive" className="text-xs">
                {daysUntil} days left
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1" data-testid={`event-title-${event.id}`}>
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {event.description || `A ${event.type} event`}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(event.date), "MMM d, yyyy")}
            </div>
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.location}
              </div>
            )}
            {event.guestCount && event.guestCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {event.guestCount} guests
              </div>
            )}
          </div>
          {event.budget && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-semibold">₹{Number(event.budget).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function UpcomingTasks({ tasks }: { tasks: EventTask[] }) {
  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  if (upcomingTasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>All tasks completed!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingTasks.map((task) => {
        const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date());
        return (
          <div 
            key={task.id} 
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              isOverdue ? 'border-destructive/50 bg-destructive/5' : 'bg-card'
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{task.title}</p>
              <p className="text-xs text-muted-foreground">
                {task.dueDate && format(new Date(task.dueDate), "MMM d, yyyy")}
              </p>
            </div>
            <Badge variant={isOverdue ? "destructive" : "secondary"} className="shrink-0">
              {task.category}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: allTasks } = useQuery<EventTask[]>({
    queryKey: ["/api/tasks"],
  });

  const upcomingEvents = events?.filter(e => 
    isAfter(new Date(e.date), new Date()) && e.status !== 'cancelled'
  ) || [];
  
  const pastEvents = events?.filter(e => 
    isBefore(new Date(e.date), new Date())
  ) || [];

  const totalBudget = events?.reduce((sum, e) => sum + (Number(e.budget) || 0), 0) || 0;
  const totalSpent = events?.reduce((sum, e) => sum + (Number(e.spentAmount) || 0), 0) || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-welcome">
            Welcome back, {user?.firstName || 'there'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your events today.
          </p>
        </div>
        <Link href="/events/new">
          <Button className="gap-2" data-testid="button-create-event">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-upcoming-events">{upcomingEvents.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pastEvents.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-total-budget">₹{totalBudget.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">Total Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Events Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Events</h2>
            <Link href="/events">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          {eventsLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <Skeleton className="aspect-video rounded-t-lg" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {events.slice(0, 4).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first event and let AI help you plan the perfect celebration.
                </p>
                <Link href="/events/new">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UpcomingTasks tasks={allTasks || []} />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/events/new">
                <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-quick-new-event">
                  <Plus className="w-4 h-4" />
                  New Event
                </Button>
              </Link>
              <Link href="/vendors">
                <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-quick-browse-vendors">
                  <Users className="w-4 h-4" />
                  Browse Vendors
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  View Calendar
                </Button>
              </Link>
              <Link href="/budget">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Budget Tracker
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
