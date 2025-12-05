



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
    Clock, ChartNoAxesGantt,
} from "lucide-react";

const services = [
    {
        icon: Calendar,
        title: "End-to-End Planning",
        description: "From dates and invites to timelines and reminders, everything stays organised.",
    },
    {
        icon: Users,
        title: "For Every Occasion",
        description: "Birthdays, weddings, baby showers, family reunions, conferences and more.",
    },
    {
        icon: DollarSign,
        title: "Smart Budgeting",
        description: "Set a budget and track every expense in one clear, simple view.",
    },
    {
        icon: Shield,
        title: "Smooth & Secure",
        description: "Safe payments and clear confirmations for every booking.",
    },
];

const popularEvents = [
    {
        name: "Dream Wedding",
        location: "Jaipur, Rajasthan",
        duration: "3-Day Celebration",
        image:
            "https://images.unsplash.com/photo-1610186594416-1c109091a22a?q=80&w=1400",
    },
    {
        name: "Colorful Birthday",
        location: "Bengaluru, Karnataka",
        duration: "Evening Party",
        image:
            "https://images.unsplash.com/photo-1605733160314-4fc7c9cba3ed?q=80&w=1400",
    },
    {
        name: "Corporate Conference",
        location: "Mumbai, Maharashtra",
        duration: "2-Day Event",
        image:
            "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400",
    },
    {
        name: "Baby Shower",
        location: "Hyderabad, Telangana",
        duration: "Day Gathering",
        image:
            "https://images.unsplash.com/photo-1515468381878-2c362f97c424?q=80&w=1400",
    },
];

const steps = [
    {
        title: "Choose Event & Date",
        description: "Select the occasion, city and preferred dates for your event.",
    },
    {
        title: "Set Budget & Details",
        description: "Add guest count, style, and budget so everything fits your plan.",
    },
    {
        title: "Confirm & Relax",
        description: "Track tasks, bookings and updates from a single dashboard.",
    },
];

const testimonials = [
    {
        name: "Priya Sharma",
        role: "Bride – Mumbai",
        quote:
            "We planned our engagement and wedding with EventMate. Timelines, tasks, everything stayed under control.",
    },
    {
        name: "Rahul Verma",
        role: "HR Manager – Bengaluru",
        quote:
            "Our annual conference and family day were easier to manage than ever. The team finally had one place for all details.",
    },
];

const brands = ["Axon", "JetStar", "Expedia", "Qantas", "Alitalia"];

export default function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm">
                            <ChartNoAxesGantt  className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col leading-none">
        <span className="text-xl font-extrabold tracking-tight text-foreground">
          EventMate
        </span>
                            <span className="text-xs text-muted-foreground">Events for every moment</span>
                        </div>
                    </div>

                    {/* Center nav links */}
                    <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
                        <a className="hover:text-foreground cursor-pointer">Occasions</a>
                        <a className="hover:text-foreground cursor-pointer">How it works</a>
                        <a className="hover:text-foreground cursor-pointer">Pricing</a>
                        <a className="hover:text-foreground cursor-pointer">About</a>
                    </div>

                    {/* Right actions: toggles + auth */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        <Link href="/vendor/login">
                            <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
                                Vendor Login
                            </Button>
                        </Link>

                        <Link href="/admin/login">
                            <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
                                Admin Login
                            </Button>
                        </Link>

                        <Link href="/login">
                            <Button variant="ghost" className="text-sm hover:text-foreground">
                                Sign In
                            </Button>
                        </Link>

                        <Link href="/register">
                            <Button className="bg-orange-500 hover:bg-orange-600 text-sm text-white shadow-md">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>


            <main className="pt-28 md:pt-32">
                {/* HERO */}
                <section className="px-6 py-10 md:py-16">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
                        {/* Left: Text */}
                        <div className="space-y-6">
                            <Badge className="bg-orange-100 text-orange-700 border-none w-fit">
                                Events across India
                            </Badge>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                                Plan birthdays, weddings &{" "}
                                <span className="text-orange-500">every family moment</span> in
                                one place.
                            </h1>
                            <p className="text-base md:text-lg text-muted-foreground max-w-xl">
                                From intimate baby showers to grand corporate conferences, EventMate
                                keeps your guests, budgets and timelines perfectly aligned.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/register">
                                    <Button
                                        size="lg"
                                        className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                                    >
                                        Start planning
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>

                            </div>

                            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-orange-500" />
                                    <span>Trusted for 10,000+ events</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-orange-500" />
                                    <span>Pan-India support</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Hero Visual */}
                        <div className="relative">
                            {/* Background shape */}
                            <div className="absolute inset-0 -z-10">
                                <div className="absolute -top-10 right-0 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-70" />
                                <div className="absolute bottom-0 -left-10 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-70" />
                            </div>

                            <Card className="rounded-3xl shadow-xl overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600"
                                    alt="Guests enjoying an event"
                                    className="w-full h-80 object-cover"
                                />
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                Upcoming event
                                            </p>
                                            <p className="font-semibold">Family reunion & dinner</p>
                                        </div>
                                        <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                      On track
                    </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>Sat, 22 Feb</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            <span>85 guests</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            <span>Pune</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Floating mini card */}
                            <Card className="absolute -bottom-6 -left-4 md:-left-10 w-40 shadow-lg border bg-background">
                                <CardContent className="p-3 text-xs space-y-1">
                                    <p className="font-semibold">Haldi & Mehendi</p>
                                    <p className="text-muted-foreground">Jaipur · 2 days left</p>
                                    <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Tasks done
                    </span>
                                        <span className="text-[11px] font-medium text-green-600">
                      80%
                    </span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full w-4/5 bg-green-500 rounded-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* SERVICES */}
                <section className="px-6 py-10 md:py-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-10">
                            <p className="text-xs tracking-[0.2em] text-orange-500 uppercase">
                                Category
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold mt-2">
                                We Offer Best Event Services
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
                                A single workspace to plan every kind of celebration – without
                                endless spreadsheets and chats.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            {services.map((service, idx) => {
                                const Icon = service.icon;
                                return (
                                    <Card
                                        key={idx}
                                        className={`rounded-2xl shadow-sm ${
                                            idx === 1 ? "border border-orange-200 shadow-md" : ""
                                        }`}
                                    >
                                        <CardContent className="p-6 space-y-4">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-orange-500" />
                                            </div>
                                            <h3 className="font-semibold text-lg">{service.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {service.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* POPULAR EVENTS / TOP DESTINATIONS STYLE */}
                <section className="px-6 py-10 md:py-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <p className="text-xs tracking-[0.25em] text-orange-500 uppercase">
                                Popular
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold mt-2">
                                Popular Event Types
                            </h2>
                            <p className="text-muted-foreground max-w-xl mt-3">
                                Get inspired by the occasions people plan most often with EventMate.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {popularEvents.map((ev, idx) => (
                                <Card key={idx} className="rounded-3xl shadow-md overflow-hidden">
                                    <div className="h-40 w-full">
                                        <img
                                            src={ev.image}
                                            alt={ev.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <CardContent className="p-4 space-y-2">
                                        <h3 className="font-semibold text-base">{ev.name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <MapPin className="w-3 h-3" />
                                            <span>{ev.location}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs mt-2 text-muted-foreground">
                                            <span>{ev.duration}</span>
                                            <span>Planning made simple</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS / 3 STEPS */}
                <section className="px-6 py-10 md:py-16 bg-background/60">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
                        <div className="space-y-4">
                            <p className="text-xs tracking-[0.25em] uppercase text-orange-500">
                                Easy & fast
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold">
                                Book Your Next Event in 3 Easy Steps
                            </h2>
                            <p className="text-muted-foreground max-w-xl">
                                No matter the occasion, EventMate keeps every detail in one clear timeline.
                                You decide the vibe, we keep everything on track.
                            </p>

                            <div className="space-y-4 mt-4">
                                {steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-orange-500">
                        0{idx + 1}
                      </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base">{step.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Side preview card like Jadoo */}
                        <div className="flex justify-center">
                            <Card className="rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
                                <div className="h-52">
                                    <img
                                        src="https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=1600"
                                        alt="Outdoor event"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase text-muted-foreground tracking-wide">
                                                Trip to celebrate
                                            </p>
                                            <p className="font-semibold text-sm">
                                                Engagement party · Goa
                                            </p>
                                        </div>
                                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                      Ongoing
                    </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                        <span>Guest list ready</span>
                                        <span>Venue secured</span>
                                        <span>Decor in progress</span>
                                    </div>

                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                            <span>Overall progress</span>
                                            <span>45% completed</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full w-[45%] bg-orange-500 rounded-full" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* TESTIMONIALS */}
                <section className="px-6 py-10 md:py-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <p className="text-xs tracking-[0.25em] uppercase text-orange-500">
                                Testimonials
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold mt-2">
                                What People Say About Us
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {testimonials.map((t, idx) => (
                                <Card key={idx} className="rounded-3xl shadow-md">
                                    <CardContent className="p-6 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-orange-600">
                                                {t.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{t.name}</p>
                                                <p className="text-xs text-muted-foreground">{t.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className="w-4 h-4"
                                                    fill="#f97316"
                                                    stroke="#f97316"
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{t.quote}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* BRANDS / LOGOS */}
                <section className="px-6 pb-10 md:pb-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-6">
                            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                                Trusted by teams across India
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-8 text-muted-foreground text-sm">
                            {brands.map((b, idx) => (
                                <span key={idx} className="opacity-70">
                  {b}
                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SUBSCRIBE / CTA BANNER */}
                <section className="px-6 pb-16">
                    <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-orange-50 border border-muted shadow-sm px-6 md:px-10 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-2 max-w-md">
                            <h3 className="text-xl md:text-2xl font-bold">
                                Stay updated on tips, ideas & offers for your next event.
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Get practical checklists, decor ideas and planning tricks straight in your inbox.
                            </p>
                        </div>
                        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 rounded-full border px-4 py-2 text-sm bg-background"
                            />
                            <Button className="rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm px-6">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="border-t bg-background/80">
                <div className="max-w-7xl mx-auto px-6 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold tracking-tight">EventMate</span>
                        <span className="text-xs text-muted-foreground">
              Plan. Celebrate. Remember.
            </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} EventMate. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}




// import { Link } from "wouter";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { ThemeToggle } from "@/components/theme-toggle";
// import {
//   Calendar,
//   Sparkles,
//   Users,
//   DollarSign,
//   MapPin,
//   Star,
//   ArrowRight,
//   CheckCircle,
//   Zap,
//   Shield,
//   Clock
// } from "lucide-react";
//
// const eventTypes = [
//   { name: "Weddings", icon: "ring", count: "500+" },
//   { name: "Birthdays", icon: "cake", count: "1.2k+" },
//   { name: "Corporate", icon: "briefcase", count: "350+" },
//   { name: "Conferences", icon: "mic", count: "200+" },
//   { name: "Parties", icon: "party", count: "800+" },
//   { name: "Reunions", icon: "users", count: "150+" },
// ];
//
// const features = [
//   {
//     icon: Sparkles,
//     title: "AI-Powered Planning",
//     description: "Get intelligent recommendations for venues, vendors, and schedules based on your preferences and budget.",
//   },
//   {
//     icon: Calendar,
//     title: "Smart Scheduling",
//     description: "Automated task timelines and reminders ensure nothing falls through the cracks.",
//   },
//   {
//     icon: Users,
//     title: "Vendor Marketplace",
//     description: "Browse and book from hundreds of verified vendors - caterers, decorators, photographers, and more.",
//   },
//   {
//     icon: DollarSign,
//     title: "Budget Management",
//     description: "Track every expense with real-time budget breakdowns and cost optimization suggestions.",
//   },
//   {
//     icon: Shield,
//     title: "Secure Payments",
//     description: "Safe and secure payment processing with Stripe for all vendor bookings.",
//   },
//   {
//     icon: Clock,
//     title: "Real-time Updates",
//     description: "Stay informed with instant notifications on bookings, confirmations, and task completions.",
//   },
// ];
//
// const testimonials = [
//   {
//     name: "Priya Sharma",
//     role: "Bride",
//     content: "EventMate made planning our wedding so much easier. The AI recommendations were spot-on!",
//     rating: 5,
//   },
//   {
//     name: "Rahul Verma",
//     role: "Event Manager",
//     content: "We've planned over 50 corporate events using EventMate. It's a game-changer for our team.",
//     rating: 5,
//   },
//   {
//     name: "Ananya Patel",
//     role: "Party Planner",
//     content: "The vendor marketplace and budget tracking features are absolutely fantastic.",
//     rating: 5,
//   },
// ];
//
// export default function Landing() {
//   return (
//     <div className="min-h-screen bg-background">
//       {/* Navigation */}
//       <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
//               <Sparkles className="w-6 h-6 text-primary-foreground" />
//             </div>
//             <span className="text-xl font-bold">EventMate</span>
//           </div>
//           <div className="flex items-center gap-4 flex-wrap">
//             <ThemeToggle />
//             <Link href="/vendor/login">
//               <Button variant="ghost" size="sm" data-testid="button-vendor-login">Vendor Login</Button>
//             </Link>
//             <Link href="/admin/login">
//               <Button variant="ghost" size="sm" data-testid="button-admin-login">Admin</Button>
//             </Link>
//             <Link href="/login">
//               <Button variant="ghost" data-testid="button-login">Sign In</Button>
//             </Link>
//             <Link href="/register">
//               <Button data-testid="button-register">Get Started</Button>
//             </Link>
//           </div>
//         </div>
//       </nav>
//
//       {/* Hero Section */}
//       <section className="pt-32 pb-20 px-6 relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
//         <div className="max-w-7xl mx-auto relative">
//           <div className="text-center max-w-4xl mx-auto">
//             <Badge variant="secondary" className="mb-6" data-testid="badge-hero">
//               <Zap className="w-3 h-3 mr-1" />
//               AI-Powered Event Planning
//             </Badge>
//             <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
//               Plan Your Perfect Event with{" "}
//               <span className="text-primary">AI Assistance</span>
//             </h1>
//             <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
//               From weddings to corporate events, EventMate helps you plan, organize, and execute
//               flawless events with intelligent recommendations, vendor matching, and budget tracking.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Link href="/register">
//                 <Button size="lg" className="gap-2" data-testid="button-start-planning">
//                   Start Planning <ArrowRight className="w-4 h-4" />
//                 </Button>
//               </Link>
//               <Link href="/login">
//                 <Button size="lg" variant="outline" data-testid="button-browse-vendors">
//                   Sign In
//                 </Button>
//               </Link>
//             </div>
//           </div>
//
//           {/* Stats */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
//             {[
//               { value: "10,000+", label: "Events Planned" },
//               { value: "500+", label: "Verified Vendors" },
//               { value: "4.9", label: "Average Rating" },
//               { value: "₹15Cr+", label: "Transactions" },
//             ].map((stat, i) => (
//               <div key={i} className="text-center p-6 rounded-xl bg-card border">
//                 <div className="text-3xl font-bold text-primary mb-1" data-testid={`stat-value-${i}`}>{stat.value}</div>
//                 <div className="text-sm text-muted-foreground">{stat.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//
//       {/* Event Types */}
//       <section className="py-20 px-6 bg-card/50">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold mb-4">Events We Help Plan</h2>
//             <p className="text-muted-foreground max-w-2xl mx-auto">
//               Whether it's an intimate gathering or a grand celebration, we've got you covered.
//             </p>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//             {eventTypes.map((type, i) => (
//               <Card key={i} className="hover-elevate cursor-pointer transition-all">
//                 <CardContent className="p-6 text-center">
//                   <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
//                     <Calendar className="w-6 h-6 text-primary" />
//                   </div>
//                   <h3 className="font-semibold mb-1">{type.name}</h3>
//                   <p className="text-sm text-muted-foreground">{type.count} events</p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>
//
//       {/* Features */}
//       <section className="py-20 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
//             <p className="text-muted-foreground max-w-2xl mx-auto">
//               Powerful features designed to make event planning effortless and enjoyable.
//             </p>
//           </div>
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {features.map((feature, i) => (
//               <Card key={i} className="border-0 bg-card/50">
//                 <CardContent className="p-6">
//                   <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
//                     <feature.icon className="w-6 h-6 text-primary" />
//                   </div>
//                   <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
//                   <p className="text-muted-foreground">{feature.description}</p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>
//
//       {/* How It Works */}
//       <section className="py-20 px-6 bg-card/50">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
//             <p className="text-muted-foreground max-w-2xl mx-auto">
//               Plan your perfect event in just a few simple steps.
//             </p>
//           </div>
//           <div className="grid md:grid-cols-4 gap-8">
//             {[
//               { step: "1", title: "Create Your Event", desc: "Enter your event details, budget, and preferences." },
//               { step: "2", title: "Get AI Recommendations", desc: "Receive personalized vendor and venue suggestions." },
//               { step: "3", title: "Book & Plan", desc: "Select vendors, book services, and track your budget." },
//               { step: "4", title: "Execute Perfectly", desc: "Follow your schedule and enjoy a flawless event." },
//             ].map((item, i) => (
//               <div key={i} className="text-center">
//                 <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
//                   {item.step}
//                 </div>
//                 <h3 className="font-semibold mb-2">{item.title}</h3>
//                 <p className="text-sm text-muted-foreground">{item.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//
//       {/* Testimonials */}
//       <section className="py-20 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
//             <p className="text-muted-foreground max-w-2xl mx-auto">
//               Join thousands of satisfied event planners who trust EventMate.
//             </p>
//           </div>
//           <div className="grid md:grid-cols-3 gap-6">
//             {testimonials.map((testimonial, i) => (
//               <Card key={i}>
//                 <CardContent className="p-6">
//                   <div className="flex gap-1 mb-4">
//                     {Array.from({ length: testimonial.rating }).map((_, j) => (
//                       <Star key={j} className="w-4 h-4 fill-primary text-primary" />
//                     ))}
//                   </div>
//                   <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//                       <span className="text-primary font-semibold">{testimonial.name[0]}</span>
//                     </div>
//                     <div>
//                       <p className="font-semibold text-sm">{testimonial.name}</p>
//                       <p className="text-xs text-muted-foreground">{testimonial.role}</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>
//
//       {/* CTA Section */}
//       <section className="py-20 px-6 bg-primary text-primary-foreground">
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4">
//             Ready to Plan Your Perfect Event?
//           </h2>
//           <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
//             Join thousands of event planners who've made their events unforgettable with EventMate.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link href="/register">
//               <Button size="lg" variant="secondary" className="gap-2" data-testid="button-get-started-free">
//                 Get Started Free <ArrowRight className="w-4 h-4" />
//               </Button>
//             </Link>
//           </div>
//           <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm">
//             <div className="flex items-center gap-2">
//               <CheckCircle className="w-4 h-4" />
//               <span>Free to start</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <CheckCircle className="w-4 h-4" />
//               <span>No credit card required</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <CheckCircle className="w-4 h-4" />
//               <span>500+ vendors</span>
//             </div>
//           </div>
//         </div>
//       </section>
//
//       {/* Footer */}
//       <footer className="py-12 px-6 border-t">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
//                 <Sparkles className="w-4 h-4 text-primary-foreground" />
//               </div>
//               <span className="font-semibold">EventMate</span>
//             </div>
//             <p className="text-sm text-muted-foreground">
//               © 2024 EventMate. All rights reserved.
//             </p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }
