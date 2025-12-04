import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'vendor', 'admin']);
export const eventStatusEnum = pgEnum('event_status', ['draft', 'planning', 'confirmed', 'completed', 'cancelled']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'accepted', 'rejected', 'completed', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed', 'refunded']);
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'completed', 'overdue']);
export const vendorCategoryEnum = pgEnum('vendor_category', ['venue', 'catering', 'decoration', 'photography', 'entertainment', 'florist', 'cake', 'transport', 'other']);

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with role support and local auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('user').notNull(),
  phone: varchar("phone"),
  location: varchar("location"),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendors table
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: varchar("business_name").notNull(),
  category: vendorCategoryEnum("category").notNull(),
  description: text("description"),
  services: jsonb("services"),
  priceRange: jsonb("price_range"),
  location: varchar("location"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default('0'),
  reviewCount: integer("review_count").default(0),
  images: jsonb("images"),
  availability: jsonb("availability"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  stripeAccountId: varchar("stripe_account_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  type: varchar("type").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  location: varchar("location"),
  guestCount: integer("guest_count").default(0),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  spentAmount: decimal("spent_amount", { precision: 12, scale: 2 }).default('0'),
  theme: varchar("theme"),
  status: eventStatusEnum("status").default('draft').notNull(),
  aiRecommendations: jsonb("ai_recommendations"),
  schedule: jsonb("schedule"),
  notes: text("notes"),
  coverImage: varchar("cover_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event Tasks table
export const eventTasks = pgTable("event_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category"),
  dueDate: timestamp("due_date"),
  status: taskStatusEnum("status").default('pending').notNull(),
  priority: integer("priority").default(0),
  assignedVendorId: varchar("assigned_vendor_id").references(() => vendors.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id).notNull(),
  vendorId: varchar("vendor_id").references(() => vendors.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  serviceName: varchar("service_name").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: bookingStatusEnum("status").default('pending').notNull(),
  notes: text("notes"),
  scheduledDate: timestamp("scheduled_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  vendorId: varchar("vendor_id").references(() => vendors.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default('pending').notNull(),
  stripePaymentId: varchar("stripe_payment_id"),
  stripeSessionId: varchar("stripe_session_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  events: many(events),
  bookings: many(bookings),
  vendor: one(vendors, {
    fields: [users.id],
    references: [vendors.userId],
  }),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, {
    fields: [vendors.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
  tasks: many(eventTasks),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  tasks: many(eventTasks),
  bookings: many(bookings),
}));

export const eventTasksRelations = relations(eventTasks, ({ one }) => ({
  event: one(events, {
    fields: [eventTasks.eventId],
    references: [events.id],
  }),
  vendor: one(vendors, {
    fields: [eventTasks.assignedVendorId],
    references: [vendors.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.id],
  }),
  vendor: one(vendors, {
    fields: [bookings.vendorId],
    references: [vendors.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  vendor: one(vendors, {
    fields: [payments.vendorId],
    references: [vendors.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  spentAmount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventTaskSchema = createInsertSchema(eventTasks).omit({
  id: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventTask = typeof eventTasks.$inferSelect;
export type InsertEventTask = z.infer<typeof insertEventTaskSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
