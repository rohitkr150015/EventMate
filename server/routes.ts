import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupLocalAuth, isAuthenticated, hashPassword, verifyPassword } from "./localAuth";
import { getEventRecommendations, getVendorSuggestions } from "./gemini";
import { insertEventSchema, insertEventTaskSchema, insertBookingSchema, insertVendorSchema } from "@shared/schema";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const vendorRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  businessName: z.string().min(2, "Business name is required"),
  category: z.enum(['venue', 'catering', 'decoration', 'photography', 'entertainment', 'florist', 'cake', 'transport', 'other']),
  description: z.string().optional(),
  location: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupLocalAuth(app);

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await hashPassword(data.password);
      const user = await storage.createUser({
        email: data.email,
        passwordHash,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
      });

      req.session.userId = user.id;
      
      const { passwordHash: _, ...safeUser } = user as any;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await verifyPassword(data.password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      
      const { passwordHash: _, ...safeUser } = user as any;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { passwordHash: _, ...safeUser } = user as any;
    res.json(safeUser);
  });

  // Vendor Registration - Creates both user account and vendor profile
  app.post("/api/auth/vendor/register", async (req: Request, res: Response) => {
    try {
      const data = vendorRegisterSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await hashPassword(data.password);
      
      // Create user with vendor role
      const user = await storage.createUser({
        email: data.email,
        passwordHash,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phone: data.phone || null,
        role: 'vendor',
      });

      // Create vendor profile
      const vendor = await storage.createVendor({
        userId: user.id,
        businessName: data.businessName,
        category: data.category,
        description: data.description || null,
        location: data.location || null,
        isVerified: false,
        isActive: true,
      });

      req.session.userId = user.id;
      
      const { passwordHash: _, ...safeUser } = user as any;
      res.status(201).json({ user: safeUser, vendor });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Vendor registration error:", error);
      res.status(500).json({ message: "Vendor registration failed" });
    }
  });

  // Vendor Login - Same as regular login but validates vendor role
  app.post("/api/auth/vendor/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await verifyPassword(data.password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (user.role !== 'vendor') {
        return res.status(403).json({ message: "This account is not registered as a vendor. Please use the vendor registration page." });
      }

      const vendor = await storage.getVendorByUserId(user.id);
      if (!vendor) {
        return res.status(403).json({ message: "Vendor profile not found. Please contact support." });
      }

      req.session.userId = user.id;
      
      const { passwordHash: _, ...safeUser } = user as any;
      res.json({ user: safeUser, vendor });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Vendor login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin Login - Only allows admin role
  app.post("/api/auth/admin/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await verifyPassword(data.password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      req.session.userId = user.id;
      
      const { passwordHash: _, ...safeUser } = user as any;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin create route - Only accessible by existing admins
  app.post("/api/admin/create", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = (req as any).user;
      if (currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can create other admins" });
      }

      const data = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await hashPassword(data.password);
      const newAdmin = await storage.createUser({
        email: data.email,
        passwordHash,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        role: 'admin',
      });

      const { passwordHash: _, ...safeUser } = newAdmin as any;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Admin creation error:", error);
      res.status(500).json({ message: "Failed to create admin" });
    }
  });

  // Event routes
  app.get("/api/events", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    const events = await storage.getEventsByUserId(user.id);
    res.json(events);
  });

  app.get("/api/events/:id", isAuthenticated, async (req: Request, res: Response) => {
    const event = await storage.getEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  });

  app.post("/api/events", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const data = {
        ...req.body,
        userId: user.id,
        date: new Date(req.body.date),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      };
      const event = await storage.createEvent(data);
      res.status(201).json(event);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(400).json({ message: "Failed to create event" });
    }
  });

  app.patch("/api/events/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", isAuthenticated, async (req: Request, res: Response) => {
    await storage.deleteEvent(req.params.id);
    res.status(204).send();
  });

  // Event Tasks routes
  app.get("/api/events/:eventId/tasks", isAuthenticated, async (req: Request, res: Response) => {
    const tasks = await storage.getEventTasks(req.params.eventId);
    res.json(tasks);
  });

  app.get("/api/tasks", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    const events = await storage.getEventsByUserId(user.id);
    const allTasks = await Promise.all(events.map(e => storage.getEventTasks(e.id)));
    res.json(allTasks.flat());
  });

  app.post("/api/events/:eventId/tasks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const task = await storage.createEventTask({
        ...req.body,
        eventId: req.params.eventId,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
      });
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const task = await storage.updateEventTask(req.params.id, {
        ...req.body,
        completedAt: req.body.status === "completed" ? new Date() : null,
      });
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req: Request, res: Response) => {
    await storage.deleteEventTask(req.params.id);
    res.status(204).send();
  });

  // Vendor routes
  app.get("/api/vendors", async (req: Request, res: Response) => {
    const { category } = req.query;
    if (category && typeof category === "string") {
      const vendors = await storage.getVendorsByCategory(category);
      res.json(vendors);
    } else {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
    }
  });

  app.get("/api/vendors/:id", async (req: Request, res: Response) => {
    const vendor = await storage.getVendor(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(vendor);
  });

  app.get("/api/vendor/profile", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    const vendor = await storage.getVendorByUserId(user.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }
    res.json(vendor);
  });

  app.post("/api/vendor/setup", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const vendor = await storage.createVendor({
        ...req.body,
        userId: user.id,
      });
      await storage.updateUserRole(user.id, "vendor");
      res.status(201).json(vendor);
    } catch (error) {
      console.error("Vendor setup error:", error);
      res.status(400).json({ message: "Failed to create vendor profile" });
    }
  });

  app.patch("/api/vendor/profile", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    const vendor = await storage.getVendorByUserId(user.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }
    const updated = await storage.updateVendor(vendor.id, req.body);
    res.json(updated);
  });

  // Booking routes
  app.get("/api/bookings", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    const bookings = await storage.getBookingsByUserId(user.id);
    res.json(bookings);
  });

  app.get("/api/events/:eventId/bookings", isAuthenticated, async (req: Request, res: Response) => {
    const bookings = await storage.getBookingsByEventId(req.params.eventId);
    const bookingsWithVendors = await Promise.all(
      bookings.map(async (booking) => {
        const vendor = await storage.getVendor(booking.vendorId);
        return { ...booking, vendor };
      })
    );
    res.json(bookingsWithVendors);
  });

  app.get("/api/vendor/bookings", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    const vendor = await storage.getVendorByUserId(user.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }
    const bookings = await storage.getBookingsByVendorId(vendor.id);
    res.json(bookings);
  });

  app.post("/api/bookings", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const booking = await storage.createBooking({
        ...req.body,
        userId: user.id,
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : null,
      });
      res.status(201).json(booking);
    } catch (error) {
      console.error("Create booking error:", error);
      res.status(400).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const booking = await storage.updateBooking(req.params.id, req.body);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(400).json({ message: "Failed to update booking" });
    }
  });

  // Payment routes
  app.get("/api/payments", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    const payments = await storage.getPaymentsByUserId(user.id);
    res.json(payments);
  });

  app.post("/api/payments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const payment = await storage.createPayment({
        ...req.body,
        userId: user.id,
      });
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: "Failed to create payment" });
    }
  });

  // AI Recommendations route
  app.post("/api/ai/recommendations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { eventType, budget, guestCount, location, date, theme } = req.body;
      
      // Fetch all available vendors to provide context to AI
      const availableVendors = await storage.getAllVendors();
      
      const recommendations = await getEventRecommendations(
        eventType,
        budget,
        guestCount,
        location,
        date,
        theme,
        availableVendors
      );
      res.json(recommendations);
    } catch (error) {
      console.error("AI recommendations error:", error);
      res.status(500).json({ message: "Failed to get AI recommendations" });
    }
  });

  app.post("/api/ai/vendor-suggestions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { category, budget, eventType, guestCount } = req.body;
      const suggestions = await getVendorSuggestions(category, budget, eventType, guestCount);
      res.json(suggestions);
    } catch (error) {
      console.error("Vendor suggestions error:", error);
      res.status(500).json({ message: "Failed to get vendor suggestions" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const stats = await storage.getAdminStats();
    res.json(stats);
  });

  app.get("/api/admin/users", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/admin/events", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const events = await storage.getAllEvents();
    res.json(events);
  });

  app.get("/api/admin/bookings", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const bookings = await storage.getAllBookings();
    res.json(bookings);
  });

  app.patch("/api/admin/users/:id/role", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { role } = req.body;
    const updated = await storage.updateUserRole(req.params.id, role);
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updated);
  });

  app.patch("/api/admin/vendors/:id/verify", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { isVerified } = req.body;
    const updated = await storage.updateVendor(req.params.id, { isVerified });
    if (!updated) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(updated);
  });

  // Stripe payment routes
  app.get("/api/stripe/publishable-key", async (req: Request, res: Response) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error getting Stripe publishable key:", error);
      res.status(500).json({ message: "Failed to get Stripe configuration" });
    }
  });

  app.post("/api/checkout/booking", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { bookingId } = req.body;

      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const vendor = await storage.getVendor(booking.vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      const stripe = await getUncachableStripeClient();
      const baseUrl = process.env.APP_URL || `http://localhost:5000`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `${vendor.businessName} - ${booking.serviceName}`,
                description: `Booking for event services`,
              },
              unit_amount: Math.round(parseFloat(booking.amount) * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
        cancel_url: `${baseUrl}/payment/cancel?booking_id=${bookingId}`,
        metadata: {
          bookingId,
          userId: user.id,
          vendorId: booking.vendorId,
        },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/checkout/verify", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      const bookingId = session.metadata?.bookingId;
      const sessionUserId = session.metadata?.userId;

      if (sessionUserId !== user.id) {
        return res.status(403).json({ message: "Not authorized to verify this payment" });
      }

      if (!bookingId) {
        return res.status(400).json({ message: "Invalid session - no booking associated" });
      }

      if (session.payment_status === 'paid') {
        const booking = await storage.getBooking(bookingId);
        
        if (!booking) {
          return res.status(404).json({ message: "Booking not found" });
        }

        // Idempotency check - see if payment already exists for this session
        const existingPayments = await storage.getPaymentsByBookingId(bookingId);
        const alreadyProcessed = existingPayments.some(
          p => p.stripeSessionId === sessionId && p.status === 'completed'
        );

        if (alreadyProcessed) {
          // Already processed - return success without duplicating
          return res.json({ success: true, paymentStatus: 'paid', alreadyProcessed: true });
        }

        // Only update if booking is still pending
        if (booking.status === 'pending') {
          await storage.updateBooking(bookingId, { status: 'accepted' });
        }
        
        await storage.createPayment({
          bookingId,
          userId: booking.userId,
          vendorId: booking.vendorId,
          amount: booking.amount,
          status: 'completed',
          stripePaymentId: session.payment_intent as string,
          stripeSessionId: sessionId,
        });

        const event = await storage.getEvent(booking.eventId);
        if (event) {
          const currentSpent = parseFloat(event.spentAmount || '0');
          const newSpent = currentSpent + parseFloat(booking.amount);
          await storage.updateEventSpentAmount(booking.eventId, newSpent.toString());
        }

        res.json({ success: true, paymentStatus: 'paid' });
      } else {
        res.json({ success: false, paymentStatus: session.payment_status });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  app.get("/api/user/payments", isAuthenticated, async (req: Request, res: Response) => {
    const user = (req as any).user;
    const payments = await storage.getPaymentsByUserId(user.id);
    
    const paymentsWithDetails = await Promise.all(
      payments.map(async (payment) => {
        const booking = await storage.getBooking(payment.bookingId);
        const vendor = booking ? await storage.getVendor(booking.vendorId) : null;
        return { ...payment, booking, vendor };
      })
    );
    
    res.json(paymentsWithDetails);
  });

  return httpServer;
}
