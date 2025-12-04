import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
  Trash2,
  Edit,
  Building,
  UtensilsCrossed,
  Palette,
  Camera,
  Music
} from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";
import type { Event, EventTask, Booking, Vendor } from "@shared/schema";
import { useState } from "react";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  planning: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  confirmed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const taskStatusIcons: Record<string, any> = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
  overdue: AlertCircle,
};

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", category: "", dueDate: "" });

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["/api/events", params?.id],
    enabled: !!params?.id,
  });

  const { data: tasks } = useQuery<EventTask[]>({
    queryKey: ["/api/events", params?.id, "tasks"],
    enabled: !!params?.id,
  });

  const { data: bookings } = useQuery<(Booking & { vendor?: Vendor })[]>({
    queryKey: ["/api/events", params?.id, "bookings"],
    enabled: !!params?.id,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return apiRequest("POST", `/api/events/${params?.id}/tasks`, taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", params?.id, "tasks"] });
      setShowAddTask(false);
      setNewTask({ title: "", description: "", category: "", dueDate: "" });
      toast({ title: "Task added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add task", variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", params?.id, "tasks"] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/events/${params?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event deleted" });
      navigate("/");
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Event not found</p>
        <Link href="/">
          <Button className="mt-4">Go back</Button>
        </Link>
      </div>
    );
  }

  const budget = Number(event.budget) || 0;
  const spent = Number(event.spentAmount) || 0;
  const remaining = budget - spent;
  const spentPercentage = budget > 0 ? (spent / budget) * 100 : 0;

  const completedTasks = tasks?.filter(t => t.status === "completed").length || 0;
  const totalTasks = tasks?.length || 0;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const aiRecommendations = event.aiRecommendations as any;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold" data-testid="text-event-title">{event.title}</h1>
              <Badge className={statusColors[event.status]}>{event.status}</Badge>
            </div>
            <p className="text-muted-foreground capitalize">{event.type?.replace("_", " ")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/events/${event.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Event?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the event and all associated tasks and bookings.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteEventMutation.mutate()}
                  disabled={deleteEventMutation.isPending}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Event Info Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-semibold">{format(new Date(event.date), "MMM d, yyyy")}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(event.date), "h:mm a")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-semibold">{event.location || "TBD"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Guests</p>
              <p className="font-semibold">{event.guestCount || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="font-semibold">₹{budget.toLocaleString('en-IN')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Budget Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spent: ₹{spent.toLocaleString('en-IN')}</span>
                <span>Remaining: ₹{remaining.toLocaleString('en-IN')}</span>
              </div>
              <Progress value={spentPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {spentPercentage.toFixed(1)}% of budget used
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Task Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{completedTasks} completed</span>
                <span>{totalTasks - completedTasks} remaining</span>
              </div>
              <Progress value={taskProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {taskProgress.toFixed(0)}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="ai">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Event Tasks</h3>
            <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Task title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Task description"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={newTask.category}
                      onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="booking">Booking</SelectItem>
                        <SelectItem value="coordination">Coordination</SelectItem>
                        <SelectItem value="setup">Setup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddTask(false)}>Cancel</Button>
                  <Button
                    onClick={() => createTaskMutation.mutate(newTask)}
                    disabled={!newTask.title || createTaskMutation.isPending}
                  >
                    Add Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => {
                const Icon = taskStatusIcons[task.status] || Circle;
                const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date()) && task.status !== "completed";
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isOverdue ? "border-destructive/50 bg-destructive/5" : ""
                    }`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => updateTaskMutation.mutate({
                        taskId: task.id,
                        status: task.status === "completed" ? "pending" : "completed"
                      })}
                    >
                      <Icon className={`w-5 h-5 ${
                        task.status === "completed" ? "text-green-500" :
                        isOverdue ? "text-destructive" : "text-muted-foreground"
                      }`} />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary">{task.category}</Badge>
                    {task.dueDate && (
                      <span className={`text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                        {format(new Date(task.dueDate), "MMM d")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No tasks yet. Add your first task to get started.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Booked Vendors</h3>
            <Link href="/vendors">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Browse Vendors
              </Button>
            </Link>
          </div>

          {bookings && bookings.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{booking.serviceName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {booking.vendor?.businessName || "Vendor"}
                        </p>
                      </div>
                      <Badge variant={
                        booking.status === "accepted" ? "default" :
                        booking.status === "pending" ? "secondary" : "destructive"
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold">₹{Number(booking.amount).toLocaleString('en-IN')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">No vendors booked yet.</p>
                <Link href="/vendors">
                  <Button>Browse Vendors</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          {aiRecommendations ? (
            <>
              {aiRecommendations.vendorRecommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Recommended Vendors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {aiRecommendations.vendorRecommendations.slice(0, 5).map((rec: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{rec.name}</p>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{rec.estimatedCost?.toLocaleString('en-IN')}</p>
                          <Badge variant={rec.priority === "essential" ? "default" : "secondary"}>
                            {rec.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {aiRecommendations.tips && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Planning Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiRecommendations.tips.map((tip: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No AI recommendations available for this event.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
