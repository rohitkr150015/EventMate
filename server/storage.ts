import {
  users,
  vendors,
  events,
  eventTasks,
  bookings,
  payments,
  type User,
  type UpsertUser,
  type Vendor,
  type InsertVendor,
  type Event,
  type InsertEvent,
  type EventTask,
  type InsertEventTask,
  type Booking,
  type InsertBooking,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(userId: string, role: 'user' | 'vendor' | 'admin'): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Vendor operations
  getVendor(id: string): Promise<Vendor | undefined>;
  getVendorByUserId(userId: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  getAllVendors(): Promise<Vendor[]>;
  getVendorsByCategory(category: string): Promise<Vendor[]>;

  // Event operations
  getEvent(id: string): Promise<Event | undefined>;
  getEventsByUserId(userId: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  getAllEvents(): Promise<Event[]>;

  // Event Task operations
  getEventTasks(eventId: string): Promise<EventTask[]>;
  createEventTask(task: InsertEventTask): Promise<EventTask>;
  updateEventTask(id: string, task: Partial<InsertEventTask>): Promise<EventTask | undefined>;
  deleteEventTask(id: string): Promise<boolean>;

  // Booking operations
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByEventId(eventId: string): Promise<Booking[]>;
  getBookingsByVendorId(vendorId: string): Promise<Booking[]>;
  getBookingsByUserId(userId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;

  // Payment operations
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByBookingId(bookingId: string): Promise<Payment[]>;
  getPaymentsByUserId(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  getAllPayments(): Promise<Payment[]>;

  // Analytics
  getAdminStats(): Promise<{
    totalUsers: number;
    totalVendors: number;
    totalEvents: number;
    totalBookings: number;
    totalRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...userData, email: userData.email?.toLowerCase() })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...userData, email: userData.email?.toLowerCase() })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: 'user' | 'vendor' | 'admin'): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Vendor operations
  async getVendor(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, userId));
    return vendor;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [updated] = await db
      .update(vendors)
      .set({ ...vendor, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return updated;
  }

  async getAllVendors(): Promise<Vendor[]> {
    return db.select().from(vendors).where(eq(vendors.isActive, true)).orderBy(desc(vendors.rating));
  }

  async getVendorsByCategory(category: string): Promise<Vendor[]> {
    return db
      .select()
      .from(vendors)
      .where(and(eq(vendors.category, category as any), eq(vendors.isActive, true)))
      .orderBy(desc(vendors.rating));
  }

  // Event operations
  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventsByUserId(userId: string): Promise<Event[]> {
    return db.select().from(events).where(eq(events.userId, userId)).orderBy(desc(events.date));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updated] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return true;
  }

  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(desc(events.date));
  }

  // Event Task operations
  async getEventTasks(eventId: string): Promise<EventTask[]> {
    return db.select().from(eventTasks).where(eq(eventTasks.eventId, eventId)).orderBy(eventTasks.dueDate);
  }

  async createEventTask(task: InsertEventTask): Promise<EventTask> {
    const [newTask] = await db.insert(eventTasks).values(task).returning();
    return newTask;
  }

  async updateEventTask(id: string, task: Partial<InsertEventTask>): Promise<EventTask | undefined> {
    const [updated] = await db
      .update(eventTasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(eventTasks.id, id))
      .returning();
    return updated;
  }

  async deleteEventTask(id: string): Promise<boolean> {
    await db.delete(eventTasks).where(eq(eventTasks.id, id));
    return true;
  }

  // Booking operations
  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByEventId(eventId: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.eventId, eventId)).orderBy(desc(bookings.createdAt));
  }

  async getBookingsByVendorId(vendorId: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.vendorId, vendorId)).orderBy(desc(bookings.createdAt));
  }

  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async getAllBookings(): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  // Payment operations
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByBookingId(bookingId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.bookingId, bookingId));
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updated] = await db
      .update(payments)
      .set({ ...payment, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  async getAllPayments(): Promise<Payment[]> {
    return db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  // Analytics
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalVendors: number;
    totalEvents: number;
    totalBookings: number;
    totalRevenue: number;
  }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [vendorCount] = await db.select({ count: sql<number>`count(*)` }).from(vendors);
    const [eventCount] = await db.select({ count: sql<number>`count(*)` }).from(events);
    const [bookingCount] = await db.select({ count: sql<number>`count(*)` }).from(bookings);
    const [revenueSum] = await db
      .select({ sum: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(payments)
      .where(eq(payments.status, 'completed'));

    return {
      totalUsers: Number(userCount?.count) || 0,
      totalVendors: Number(vendorCount?.count) || 0,
      totalEvents: Number(eventCount?.count) || 0,
      totalBookings: Number(bookingCount?.count) || 0,
      totalRevenue: Number(revenueSum?.sum) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
