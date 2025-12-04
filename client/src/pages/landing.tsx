import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Calendar, 
  Sparkles, 
  Users, 
  DollarSign, 
  MapPin, 
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Clock
} from "lucide-react";

const eventTypes = [
  { name: "Weddings", icon: "ring", count: "500+" },
  { name: "Birthdays", icon: "cake", count: "1.2k+" },
  { name: "Corporate", icon: "briefcase", count: "350+" },
  { name: "Conferences", icon: "mic", count: "200+" },
  { name: "Parties", icon: "party", count: "800+" },
  { name: "Reunions", icon: "users", count: "150+" },
];

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Planning",
    description: "Get intelligent recommendations for venues, vendors, and schedules based on your preferences and budget.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Automated task timelines and reminders ensure nothing falls through the cracks.",
  },
  {
    icon: Users,
    title: "Vendor Marketplace",
    description: "Browse and book from hundreds of verified vendors - caterers, decorators, photographers, and more.",
  },
  {
    icon: DollarSign,
    title: "Budget Management",
    description: "Track every expense with real-time budget breakdowns and cost optimization suggestions.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Safe and secure payment processing with Stripe for all vendor bookings.",
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Stay informed with instant notifications on bookings, confirmations, and task completions.",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Bride",
    content: "EventMate made planning our wedding so much easier. The AI recommendations were spot-on!",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "Event Manager",
    content: "We've planned over 50 corporate events using EventMate. It's a game-changer for our team.",
    rating: 5,
  },
  {
    name: "Ananya Patel",
    role: "Party Planner",
    content: "The vendor marketplace and budget tracking features are absolutely fantastic.",
    rating: 5,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EventMate</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" data-testid="button-login">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button data-testid="button-register">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6" data-testid="badge-hero">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Event Planning
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
              Plan Your Perfect Event with{" "}
              <span className="text-primary">AI Assistance</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              From weddings to corporate events, EventMate helps you plan, organize, and execute 
              flawless events with intelligent recommendations, vendor matching, and budget tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2" data-testid="button-start-planning">
                  Start Planning <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" data-testid="button-browse-vendors">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { value: "10,000+", label: "Events Planned" },
              { value: "500+", label: "Verified Vendors" },
              { value: "4.9", label: "Average Rating" },
              { value: "₹15Cr+", label: "Transactions" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-card border">
                <div className="text-3xl font-bold text-primary mb-1" data-testid={`stat-value-${i}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Events We Help Plan</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether it's an intimate gathering or a grand celebration, we've got you covered.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {eventTypes.map((type, i) => (
              <Card key={i} className="hover-elevate cursor-pointer transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{type.name}</h3>
                  <p className="text-sm text-muted-foreground">{type.count} events</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make event planning effortless and enjoyable.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-0 bg-card/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Plan your perfect event in just a few simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Create Your Event", desc: "Enter your event details, budget, and preferences." },
              { step: "2", title: "Get AI Recommendations", desc: "Receive personalized vendor and venue suggestions." },
              { step: "3", title: "Book & Plan", desc: "Select vendors, book services, and track your budget." },
              { step: "4", title: "Execute Perfectly", desc: "Follow your schedule and enjoy a flawless event." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied event planners who trust EventMate.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Plan Your Perfect Event?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of event planners who've made their events unforgettable with EventMate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2" data-testid="button-get-started-free">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>500+ vendors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">EventMate</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 EventMate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
