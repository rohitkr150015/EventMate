import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  addDays,
  isToday
} from "date-fns";
import type { Event, EventTask } from "@shared/schema";

const statusColors: Record<string, string> = {
  draft: "bg-gray-400",
  planning: "bg-blue-500",
  confirmed: "bg-green-500",
  completed: "bg-gray-500",
  cancelled: "bg-red-500",
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: tasks } = useQuery<EventTask[]>({
    queryKey: ["/api/tasks"],
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date: Date) => {
    return events?.filter((event) => isSameDay(new Date(event.date), date)) || [];
  };

  const getTasksForDay = (date: Date) => {
    return tasks?.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), date)) || [];
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];
  const selectedDayTasks = selectedDate ? getTasksForDay(selectedDate) : [];

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View your events and tasks at a glance</p>
        </div>
        <Link href="/events/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Event
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {format(currentMonth, "MMMM yyyy")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                      <div
                        key={dayName}
                        className="text-center text-sm font-medium text-muted-foreground py-2"
                      >
                        {dayName}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((dayDate, index) => {
                      const dayEvents = getEventsForDay(dayDate);
                      const dayTasks = getTasksForDay(dayDate);
                      const isCurrentMonth = isSameMonth(dayDate, currentMonth);
                      const isSelected = selectedDate && isSameDay(dayDate, selectedDate);
                      const isTodayDate = isToday(dayDate);

                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(dayDate)}
                          className={`min-h-[80px] p-1 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : isTodayDate
                              ? "border-primary/50 bg-primary/5"
                              : "border-transparent hover:bg-muted/50"
                          } ${!isCurrentMonth ? "opacity-40" : ""}`}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            isTodayDate ? "text-primary" : ""
                          }`}>
                            {format(dayDate, "d")}
                          </div>
                          <div className="space-y-0.5">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs px-1 py-0.5 rounded truncate text-white ${
                                  statusColors[event.status] || "bg-primary"
                                }`}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayTasks.slice(0, 1).map((task) => (
                              <div
                                key={task.id}
                                className="text-xs px-1 py-0.5 rounded truncate bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                              >
                                {task.title}
                              </div>
                            ))}
                            {(dayEvents.length > 2 || (dayEvents.length === 2 && dayTasks.length > 0)) && (
                              <div className="text-xs text-muted-foreground px-1">
                                +{dayEvents.length - 2 + dayTasks.length} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Day Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-4">
                  {/* Events */}
                  {selectedDayEvents.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Events</h4>
                      <div className="space-y-2">
                        {selectedDayEvents.map((event) => (
                          <Link key={event.id} href={`/events/${event.id}`}>
                            <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-medium text-sm">{event.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(event.date), "h:mm a")}
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <MapPin className="w-3 h-3" />
                                      {event.location}
                                    </div>
                                  )}
                                </div>
                                <Badge
                                  variant="secondary"
                                  className={`shrink-0 text-white ${statusColors[event.status]}`}
                                >
                                  {event.status}
                                </Badge>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks */}
                  {selectedDayTasks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Tasks Due</h4>
                      <div className="space-y-2">
                        {selectedDayTasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                          >
                            <p className="font-medium text-sm">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <Badge variant="outline" className="mt-2">
                              {task.category}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDayEvents.length === 0 && selectedDayTasks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No events or tasks on this day
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Click on a date to see details
                </p>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(statusColors).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${color}`} />
                    <span className="text-sm capitalize">{status}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-400" />
                  <span className="text-sm">Tasks</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
