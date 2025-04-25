import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  timestamp, 
  boolean, 
  pgEnum, 
  decimal, 
  primaryKey 
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const challengeTypeEnum = pgEnum('challenge_type', ['CODE', 'DESIGN', 'VIDEO', 'AUDIO']);
export const challengeFormatEnum = pgEnum('challenge_format', ['ONE_VS_ONE', 'TEAM_VS_TEAM', 'BATTLE_ROYALE']);
export const voteTypeEnum = pgEnum('vote_type', ['STANDARD', 'DOUBLE', 'SPECIAL']);
export const sponsorVerificationStatusEnum = pgEnum('sponsor_verification_status', ['PENDING', 'VERIFIED', 'REJECTED']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  eloRating: integer("elo_rating").default(1000).notNull(),
  level: integer("level").default(1).notNull(),
  experience: integer("experience").default(0).notNull(),
  dailyVotesUsed: integer("daily_votes_used").default(0),
  dailyDoubleVotesUsed: integer("daily_double_votes_used").default(0),
  dailySpecialVotesUsed: integer("daily_special_votes_used").default(0),
  guildId: integer("guild_id").references(() => guilds.id),
});

// Challenges
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: challengeTypeEnum("type").notNull(),
  format: challengeFormatEnum("format").notNull(),
  duration: integer("duration").notNull(), // in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdById: integer("created_by_id").references(() => users.id),
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
});

// Submissions
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  teamId: integer("team_id").references(() => teams.id),
  content: text("content").notNull(), // URL to submission content
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  originalityScore: decimal("originality_score", { precision: 5, scale: 2 }),
});

// Votes
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").references(() => submissions.id).notNull(),
  voterId: integer("voter_id").references(() => users.id).notNull(),
  voteType: voteTypeEnum("vote_type").notNull(),
  votedAt: timestamp("voted_at").defaultNow().notNull(),
});

// Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").references(() => submissions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  likes: integer("likes").default(0),
});

// Teams
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  leaderUserId: integer("leader_user_id").references(() => users.id),
});

// Team Members
export const teamMembers = pgTable("team_members", {
  teamId: integer("team_id").references(() => teams.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.teamId, table.userId] }),
  };
});

// Guilds
export const guilds = pgTable("guilds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  weeklyPoints: integer("weekly_points").default(0),
  eloRating: integer("elo_rating").default(1000),
});

// Sponsors
export const sponsors = pgTable("sponsors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  companyName: text("company_name").notNull(),
  website: text("website"),
  logoUrl: text("logo_url"),
  description: text("description"),
  contactEmail: text("contact_email"),
  verificationStatus: sponsorVerificationStatusEnum("verification_status").default("PENDING").notNull(),
  verified: boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sponsored Challenges
export const sponsoredChallenges = pgTable("sponsored_challenges", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  sponsorId: integer("sponsor_id").references(() => sponsors.id).notNull(),
  prizeAmount: decimal("prize_amount", { precision: 10, scale: 2 }).notNull(),
  prizeDescription: text("prize_description"),
  paymentStatus: paymentStatusEnum("payment_status").default("PENDING").notNull(),
  winnerSelectedAt: timestamp("winner_selected_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Match history
export const matchHistory = pgTable("match_history", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  winnerId: integer("winner_id").references(() => users.id),
  winnerTeamId: integer("winner_team_id").references(() => teams.id),
  loserId: integer("loser_id").references(() => users.id),
  loserTeamId: integer("loser_team_id").references(() => teams.id),
  winnerEloChange: integer("winner_elo_change"),
  loserEloChange: integer("loser_elo_change"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  submissions: many(submissions),
  votes: many(votes),
  comments: many(comments),
  createdChallenges: many(challenges),
  teamMemberships: many(teamMembers),
  sponsorProfile: many(sponsors),
  guild: one(guilds, {
    fields: [users.guildId],
    references: [guilds.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ many, one }) => ({
  submissions: many(submissions),
  creator: one(users, {
    fields: [challenges.createdById],
    references: [users.id],
  }),
  sponsorship: many(sponsoredChallenges),
}));

export const submissionsRelations = relations(submissions, ({ many, one }) => ({
  challenge: one(challenges, {
    fields: [submissions.challengeId],
    references: [challenges.id],
  }),
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [submissions.teamId],
    references: [teams.id],
  }),
  votes: many(votes),
  comments: many(comments),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  submission: one(submissions, {
    fields: [votes.submissionId],
    references: [submissions.id],
  }),
  voter: one(users, {
    fields: [votes.voterId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  submission: one(submissions, {
    fields: [comments.submissionId],
    references: [submissions.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const teamsRelations = relations(teams, ({ many, one }) => ({
  members: many(teamMembers),
  submissions: many(submissions),
  leader: one(users, {
    fields: [teams.leaderUserId],
    references: [users.id],
  }),
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

export const guildsRelations = relations(guilds, ({ many, one }) => ({
  members: many(users),
  creator: one(users, {
    fields: [guilds.createdById],
    references: [users.id],
  }),
}));

export const sponsorsRelations = relations(sponsors, ({ many, one }) => ({
  user: one(users, {
    fields: [sponsors.userId],
    references: [users.id],
  }),
  sponsoredChallenges: many(sponsoredChallenges),
}));

export const sponsoredChallengesRelations = relations(sponsoredChallenges, ({ one }) => ({
  challenge: one(challenges, {
    fields: [sponsoredChallenges.challengeId],
    references: [challenges.id],
  }),
  sponsor: one(sponsors, {
    fields: [sponsoredChallenges.sponsorId],
    references: [sponsors.id],
  }),
}));

// Export validation schemas
export const insertUserSchema = createInsertSchema(users);
export const insertChallengeSchema = createInsertSchema(challenges);
export const insertSubmissionSchema = createInsertSchema(submissions);
export const insertVoteSchema = createInsertSchema(votes);
export const insertCommentSchema = createInsertSchema(comments);
export const insertTeamSchema = createInsertSchema(teams);
export const insertGuildSchema = createInsertSchema(guilds);
export const insertSponsorSchema = createInsertSchema(sponsors);
export const insertSponsoredChallengeSchema = createInsertSchema(sponsoredChallenges);

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type Guild = typeof guilds.$inferSelect;
export type InsertGuild = z.infer<typeof insertGuildSchema>;

export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = z.infer<typeof insertSponsorSchema>;

export type SponsoredChallenge = typeof sponsoredChallenges.$inferSelect;
export type InsertSponsoredChallenge = z.infer<typeof insertSponsoredChallengeSchema>;

export type MatchHistory = typeof matchHistory.$inferSelect;
