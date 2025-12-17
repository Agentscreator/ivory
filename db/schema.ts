import { pgTable, serial, text, timestamp, varchar, boolean, integer, decimal, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userTypeEnum = pgEnum('user_type', ['client', 'tech']);
export const requestStatusEnum = pgEnum('request_status', ['pending', 'approved', 'modified', 'rejected', 'completed']);
export const authProviderEnum = pgEnum('auth_provider', ['email', 'google', 'apple']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed', 'no_show']);
export const dayOfWeekEnum = pgEnum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

// Users table - both clients and nail techs
export const users: any = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  authProvider: authProviderEnum('auth_provider').default('email').notNull(),
  userType: userTypeEnum('user_type').notNull(),
  avatar: text('avatar'),
  credits: integer('credits').default(5).notNull(), // Free credits on signup
  referralCode: varchar('referral_code', { length: 50 }).unique(), // User's unique referral code
  referredBy: integer('referred_by').references((): any => users.id), // Who referred this user
  // Subscription fields
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('free'), // free, pro, business
  subscriptionStatus: varchar('subscription_status', { length: 50 }).default('inactive'), // active, canceled, past_due, inactive
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  subscriptionCurrentPeriodEnd: timestamp('subscription_current_period_end'),
  resetPasswordToken: varchar('reset_password_token', { length: 255 }),
  resetPasswordExpires: timestamp('reset_password_expires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Nail tech profiles - extended info for techs
export const techProfiles = pgTable('tech_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  businessName: varchar('business_name', { length: 255 }),
  location: varchar('location', { length: 255 }),
  bio: text('bio'),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  phoneNumber: varchar('phone_number', { length: 50 }),
  website: varchar('website', { length: 255 }),
  instagramHandle: varchar('instagram_handle', { length: 100 }),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Services offered by nail techs
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  techProfileId: integer('tech_profile_id').references(() => techProfiles.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }),
  duration: integer('duration'), // in minutes
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tech availability schedule
export const techAvailability = pgTable('tech_availability', {
  id: serial('id').primaryKey(),
  techProfileId: integer('tech_profile_id').references(() => techProfiles.id).notNull(),
  dayOfWeek: dayOfWeekEnum('day_of_week').notNull(),
  startTime: varchar('start_time', { length: 5 }).notNull(), // HH:MM format
  endTime: varchar('end_time', { length: 5 }).notNull(), // HH:MM format
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tech time off / blocked dates
export const techTimeOff = pgTable('tech_time_off', {
  id: serial('id').primaryKey(),
  techProfileId: integer('tech_profile_id').references(() => techProfiles.id).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bookings/Appointments
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => users.id).notNull(),
  techProfileId: integer('tech_profile_id').references(() => techProfiles.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  lookId: integer('look_id').references(() => looks.id), // Design they want
  appointmentDate: timestamp('appointment_date').notNull(),
  duration: integer('duration').notNull(), // in minutes
  status: bookingStatusEnum('status').default('pending').notNull(),
  clientNotes: text('client_notes'),
  techNotes: text('tech_notes'),
  servicePrice: decimal('service_price', { precision: 10, scale: 2 }).notNull(), // Original service price
  serviceFee: decimal('service_fee', { precision: 10, scale: 2 }).notNull(), // 12.5% platform fee
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(), // servicePrice + serviceFee
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending'), // pending, paid, refunded
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  stripeCheckoutSessionId: varchar('stripe_checkout_session_id', { length: 255 }),
  paidAt: timestamp('paid_at'),
  cancellationReason: text('cancellation_reason'),
  cancelledBy: integer('cancelled_by').references(() => users.id),
  cancelledAt: timestamp('cancelled_at'),
  refundedAt: timestamp('refunded_at'),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// AI-generated design breakdowns for nail techs
export const designBreakdowns = pgTable('design_breakdowns', {
  id: serial('id').primaryKey(),
  lookId: integer('look_id').references(() => looks.id).notNull(),
  bookingId: integer('booking_id').references(() => bookings.id),
  generatedFor: integer('generated_for').references(() => users.id).notNull(), // Tech who requested it
  breakdown: jsonb('breakdown').notNull(), // Structured breakdown with steps, products, techniques
  rawText: text('raw_text').notNull(), // Full AI-generated text
  difficulty: varchar('difficulty', { length: 50 }), // beginner, intermediate, advanced
  estimatedTime: integer('estimated_time'), // in minutes
  productsNeeded: jsonb('products_needed'), // Array of products/tools
  techniques: jsonb('techniques'), // Array of techniques used
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Nail design looks created by users
export const looks = pgTable('looks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  imageUrl: text('image_url').notNull(),
  originalImageUrl: text('original_image_url'), // original hand photo
  aiPrompt: text('ai_prompt'), // AI generation prompt if used
  nailPositions: jsonb('nail_positions'), // coordinates and colors for each nail
  isPublic: boolean('is_public').default(false),
  shareToken: varchar('share_token', { length: 100 }).unique(),
  allowCollaborativeEdit: boolean('allow_collaborative_edit').default(false),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Design requests sent from clients to techs
export const designRequests = pgTable('design_requests', {
  id: serial('id').primaryKey(),
  lookId: integer('look_id').references(() => looks.id).notNull(),
  clientId: integer('client_id').references(() => users.id).notNull(),
  techId: integer('tech_id').references(() => users.id).notNull(),
  status: requestStatusEnum('status').default('pending').notNull(),
  clientMessage: text('client_message'),
  techResponse: text('tech_response'),
  estimatedPrice: decimal('estimated_price', { precision: 10, scale: 2 }),
  appointmentDate: timestamp('appointment_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tech portfolio/gallery images
export const portfolioImages = pgTable('portfolio_images', {
  id: serial('id').primaryKey(),
  techProfileId: integer('tech_profile_id').references(() => techProfiles.id).notNull(),
  imageUrl: text('image_url').notNull(),
  caption: text('caption'),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Color palettes (predefined and custom)
export const colorPalettes = pgTable('color_palettes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }), // classic, seasonal, branded
  colors: jsonb('colors').notNull(), // array of hex colors
  brandName: varchar('brand_name', { length: 255 }),
  isPublic: boolean('is_public').default(true),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// AI generated design variations
export const aiGenerations = pgTable('ai_generations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  prompt: text('prompt').notNull(),
  generatedImages: jsonb('generated_images').notNull(), // array of image URLs
  selectedImageUrl: text('selected_image_url'),
  lookId: integer('look_id').references(() => looks.id), // if user saved one
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Favorites/saved looks
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  lookId: integer('look_id').references(() => looks.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reviews for nail techs
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  techProfileId: integer('tech_profile_id').references(() => techProfiles.id).notNull(),
  clientId: integer('client_id').references(() => users.id).notNull(),
  designRequestId: integer('design_request_id').references(() => designRequests.id),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  images: jsonb('images'), // array of image URLs
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions for persistent login
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 100 }).notNull(), // request_received, request_approved, etc.
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message'),
  relatedId: integer('related_id'), // ID of related entity (request, look, etc.)
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Referrals tracking
export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  referrerId: integer('referrer_id').references(() => users.id).notNull(), // User who shared
  referredUserId: integer('referred_user_id').references(() => users.id).notNull(), // New user who signed up
  creditAwarded: boolean('credit_awarded').default(false), // Whether referrer got credit
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Credit transactions log
export const creditTransactions = pgTable('credit_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(), // Positive for credits added, negative for used
  type: varchar('type', { length: 100 }).notNull(), // signup_bonus, referral_reward, design_generation, etc.
  description: text('description'),
  relatedId: integer('related_id'), // ID of related entity (referral, design, etc.)
  balanceAfter: integer('balance_after').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Content moderation - flagged content
export const contentFlags = pgTable('content_flags', {
  id: serial('id').primaryKey(),
  reporterId: integer('reporter_id').references(() => users.id).notNull(),
  contentType: varchar('content_type', { length: 50 }).notNull(), // 'look', 'review', 'profile'
  contentId: integer('content_id').notNull(), // ID of the flagged content
  contentOwnerId: integer('content_owner_id').references(() => users.id).notNull(),
  reason: varchar('reason', { length: 100 }).notNull(), // 'inappropriate', 'spam', 'harassment', 'other'
  description: text('description'),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // 'pending', 'reviewed', 'action_taken', 'dismissed'
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  actionTaken: text('action_taken'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Blocked users
export const blockedUsers = pgTable('blocked_users', {
  id: serial('id').primaryKey(),
  blockerId: integer('blocker_id').references(() => users.id).notNull(), // User who blocked
  blockedId: integer('blocked_id').references(() => users.id).notNull(), // User who is blocked
  reason: varchar('reason', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  techProfile: one(techProfiles, {
    fields: [users.id],
    references: [techProfiles.userId],
  }),
  looks: many(looks),
  sentRequests: many(designRequests, { relationName: 'clientRequests' }),
  receivedRequests: many(designRequests, { relationName: 'techRequests' }),
  favorites: many(favorites),
  reviews: many(reviews),
  notifications: many(notifications),
  aiGenerations: many(aiGenerations),
  referralsMade: many(referrals, { relationName: 'referrer' }),
  creditTransactions: many(creditTransactions),
  sessions: many(sessions),
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
}));

export const portfolioImagesRelations = relations(portfolioImages, ({ one }) => ({
  techProfile: one(techProfiles, {
    fields: [portfolioImages.techProfileId],
    references: [techProfiles.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  techProfile: one(techProfiles, {
    fields: [reviews.techProfileId],
    references: [techProfiles.id],
  }),
  client: one(users, {
    fields: [reviews.clientId],
    references: [users.id],
  }),
  designRequest: one(designRequests, {
    fields: [reviews.designRequestId],
    references: [designRequests.id],
  }),
}));

export const techProfilesRelations = relations(techProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [techProfiles.userId],
    references: [users.id],
  }),
  services: many(services),
  portfolioImages: many(portfolioImages),
  reviews: many(reviews),
  availability: many(techAvailability),
  timeOff: many(techTimeOff),
  bookings: many(bookings),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  techProfile: one(techProfiles, {
    fields: [services.techProfileId],
    references: [techProfiles.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  client: one(users, {
    fields: [bookings.clientId],
    references: [users.id],
  }),
  techProfile: one(techProfiles, {
    fields: [bookings.techProfileId],
    references: [techProfiles.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  look: one(looks, {
    fields: [bookings.lookId],
    references: [looks.id],
  }),
  designBreakdowns: many(designBreakdowns),
}));

export const designBreakdownsRelations = relations(designBreakdowns, ({ one }) => ({
  look: one(looks, {
    fields: [designBreakdowns.lookId],
    references: [looks.id],
  }),
  booking: one(bookings, {
    fields: [designBreakdowns.bookingId],
    references: [bookings.id],
  }),
  generatedForUser: one(users, {
    fields: [designBreakdowns.generatedFor],
    references: [users.id],
  }),
}));

export const looksRelations = relations(looks, ({ one, many }) => ({
  user: one(users, {
    fields: [looks.userId],
    references: [users.id],
  }),
  designRequests: many(designRequests),
  favorites: many(favorites),
}));

export const designRequestsRelations = relations(designRequests, ({ one }) => ({
  look: one(looks, {
    fields: [designRequests.lookId],
    references: [looks.id],
  }),
  client: one(users, {
    fields: [designRequests.clientId],
    references: [users.id],
  }),
  tech: one(users, {
    fields: [designRequests.techId],
    references: [users.id],
  }),
  review: one(reviews, {
    fields: [designRequests.id],
    references: [reviews.designRequestId],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
  }),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, {
    fields: [creditTransactions.userId],
    references: [users.id],
  }),
}));

export const contentFlagsRelations = relations(contentFlags, ({ one }) => ({
  reporter: one(users, {
    fields: [contentFlags.reporterId],
    references: [users.id],
  }),
  contentOwner: one(users, {
    fields: [contentFlags.contentOwnerId],
    references: [users.id],
  }),
}));

export const blockedUsersRelations = relations(blockedUsers, ({ one }) => ({
  blocker: one(users, {
    fields: [blockedUsers.blockerId],
    references: [users.id],
  }),
  blocked: one(users, {
    fields: [blockedUsers.blockedId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
