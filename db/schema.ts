import { pgTable, serial, text, timestamp, varchar, boolean, integer, decimal, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userTypeEnum = pgEnum('user_type', ['client', 'tech']);
export const requestStatusEnum = pgEnum('request_status', ['pending', 'approved', 'modified', 'rejected', 'completed']);
export const authProviderEnum = pgEnum('auth_provider', ['email', 'google', 'apple']);

// Users table - both clients and nail techs
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  authProvider: authProviderEnum('auth_provider').default('email').notNull(),
  userType: userTypeEnum('user_type').notNull(),
  avatar: text('avatar'),
  credits: integer('credits').default(5).notNull(), // Free credits on signup
  referralCode: varchar('referral_code', { length: 50 }).unique(), // User's unique referral code
  referredBy: integer('referred_by').references(() => users.id), // Who referred this user
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
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.id],
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
