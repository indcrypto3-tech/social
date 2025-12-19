
import { pgTable, uuid, text, varchar, timestamp, jsonb, pgEnum, integer, uniqueIndex, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro', 'business']);
export const platformEnum = pgEnum('platform', ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok']);
export const postStatusEnum = pgEnum('post_status', ['draft', 'scheduled', 'publishing', 'published', 'failed']);
export const destinationStatusEnum = pgEnum('destination_status', ['pending', 'success', 'failed']);
export const roleEnum = pgEnum('role', ['admin', 'editor', 'viewer']);
export const teamRoleEnum = pgEnum('team_role', ['owner', 'editor', 'viewer']);
export const notificationTypeEnum = pgEnum('notification_type', ['post_failed', 'post_published', 'weekly_digest']);


// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Matches Supabase Auth ID
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  avatarUrl: text('avatar_url'),
  // If managing password manually (optional if using Supabase Auth only, but good to have)
  passwordHash: varchar('password_hash'),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free'),
  subscriptionPlan: text('subscription_plan'),
  subscriptionStatus: text('subscription_status'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  refreshAt: timestamp('refresh_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Social Accounts (Connected Platforms)
export const socialAccounts = pgTable('social_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  platform: platformEnum('platform').notNull(),
  platformAccountId: varchar('platform_account_id').notNull(), // ID from the provider
  accountName: varchar('account_name'), // Handle or Page Name
  accessToken: text('access_token').notNull(), // Encrypted ideally
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at'),
  metadata: jsonb('metadata'), // Any extra profile info
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    platformAccountIdIndex: uniqueIndex('platform_account_id_idx').on(table.platform, table.platformAccountId)
  }
});

// Scheduled Posts
export const scheduledPosts = pgTable('scheduled_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content'),
  mediaUrls: jsonb('media_urls').$type<string[]>(), // Array of S3 URLs
  scheduledAt: timestamp('scheduled_at').notNull(),
  status: postStatusEnum('status').default('draft').notNull(),
  platformConfigs: jsonb('platform_configs'), // e.g., { instagram: { type: 'reel' } }
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Post Destinations (Link between a Post and an Account)
// Tracks status per platform
export const postDestinations = pgTable('post_destinations', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => scheduledPosts.id, { onDelete: 'cascade' }).notNull(),
  socialAccountId: uuid('social_account_id').references(() => socialAccounts.id, { onDelete: 'cascade' }).notNull(),
  status: destinationStatusEnum('status').default('pending').notNull(),
  platformPostId: varchar('platform_post_id'), // ID of the published post
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Media Library
export const mediaLibrary = pgTable('media_library', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(), // S3 URL
  fileType: varchar('file_type').notNull(), // MIME type
  fileSize: integer('file_size'),
  fileName: varchar('file_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notification Preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  emailPostFailed: boolean('email_post_failed').default(true).notNull(),
  emailPostPublished: boolean('email_post_published').default(true).notNull(),
  weeklyDigest: boolean('weekly_digest').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Teams
export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: teamRoleEnum('role').default('viewer').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  invitedAt: timestamp('invited_at').defaultNow(),
}, (table) => {
  return {
    uniqueTeamMember: uniqueIndex('unique_team_member').on(table.teamId, table.userId)
  }
});

export const teamInvites = pgTable('team_invites', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: teamRoleEnum('role').default('viewer').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notification Events
export const notificationEvents = pgTable('notification_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: notificationTypeEnum('type').notNull(),
  payload: jsonb('payload'), // Stores context like { postId: "...", error: "..." }
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Waitlist Table
export const waitlist = pgTable('waitlist', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  socialAccounts: many(socialAccounts),
  scheduledPosts: many(scheduledPosts),
  mediaLibrary: many(mediaLibrary),
  notificationPreferences: one(notificationPreferences),
}));

export const socialAccountsRelations = relations(socialAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [socialAccounts.userId],
    references: [users.id],
  }),
  postDestinations: many(postDestinations),
}));

export const scheduledPostsRelations = relations(scheduledPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [scheduledPosts.userId],
    references: [users.id],
  }),
  destinations: many(postDestinations),
}));

export const postDestinationsRelations = relations(postDestinations, ({ one }) => ({
  post: one(scheduledPosts, {
    fields: [postDestinations.postId],
    references: [scheduledPosts.id],
  }),
  socialAccount: one(socialAccounts, {
    fields: [postDestinations.socialAccountId],
    references: [socialAccounts.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

// Publish Logs (For tracking attempts and failures)
export const publishLogs = pgTable('publish_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => scheduledPosts.id, { onDelete: 'cascade' }).notNull(),
  platform: platformEnum('platform').notNull(),
  status: text('status').notNull(), // success | failed | retrying
  errorCode: text('error_code'),
  errorMessage: text('error_message'),
  attempt: integer('attempt').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const publishLogsRelations = relations(publishLogs, ({ one }) => ({
  post: one(scheduledPosts, {
    fields: [publishLogs.postId],
    references: [scheduledPosts.id],
  }),
}));

// Analytics Snapshots (Daily metrics per platform)
export const analyticsSnapshots = pgTable('analytics_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  platform: platformEnum('platform').notNull(),
  followers: integer('followers').default(0).notNull(),
  impressions: integer('impressions').default(0).notNull(),
  engagement: integer('engagement').default(0).notNull(),
  date: timestamp('date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const analyticsSnapshotsRelations = relations(analyticsSnapshots, ({ one }) => ({
  user: one(users, {
    fields: [analyticsSnapshots.userId],
    references: [users.id],
  }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  members: many(teamMembers),
  invites: many(teamInvites),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const teamInvitesRelations = relations(teamInvites, ({ one }) => ({
  team: one(teams, {
    fields: [teamInvites.teamId],
    references: [teams.id],
  }),
}));

export const notificationEventsRelations = relations(notificationEvents, ({ one }) => ({
  user: one(users, {
    fields: [notificationEvents.userId],
    references: [users.id],
  }),
}));

