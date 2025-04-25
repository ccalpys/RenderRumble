import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { z } from "zod";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "../db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<schema.User>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(userData: any): Promise<schema.User>;
  updateUser(id: number, userData: Partial<schema.User>): Promise<schema.User>;
  
  // Challenge management
  getChallenge(id: number): Promise<schema.Challenge>;
  getChallenges(options?: {
    type?: string;
    format?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
    sponsored?: boolean;
  }): Promise<schema.Challenge[]>;
  createChallenge(challengeData: any): Promise<schema.Challenge>;
  updateChallenge(id: number, challengeData: Partial<schema.Challenge>): Promise<schema.Challenge>;
  
  // Submission management
  getSubmission(id: number): Promise<schema.Submission>;
  getSubmissionsByChallenge(challengeId: number): Promise<schema.Submission[]>;
  getSubmissionsByUser(userId: number): Promise<schema.Submission[]>;
  createSubmission(submissionData: any): Promise<schema.Submission>;
  
  // Voting management
  getVote(id: number): Promise<schema.Vote>;
  getVotesBySubmission(submissionId: number): Promise<schema.Vote[]>;
  createVote(voteData: any): Promise<schema.Vote>;
  getVoteCountBySubmission(submissionId: number): Promise<number>;
  getUserDailyVotes(userId: number): Promise<{
    standard: number;
    double: number;
    special: number;
  }>;
  
  // Comment management
  getCommentsBySubmission(submissionId: number): Promise<schema.Comment[]>;
  createComment(commentData: any): Promise<schema.Comment>;
  likeComment(commentId: number): Promise<schema.Comment>;
  
  // Team management
  getTeam(id: number): Promise<schema.Team>;
  getTeamsByUser(userId: number): Promise<schema.Team[]>;
  createTeam(teamData: any): Promise<schema.Team>;
  addTeamMember(teamId: number, userId: number): Promise<void>;
  
  // Guild management
  getGuild(id: number): Promise<schema.Guild>;
  getGuildByUser(userId: number): Promise<schema.Guild | undefined>;
  getTopGuilds(limit: number): Promise<schema.Guild[]>;
  createGuild(guildData: any): Promise<schema.Guild>;
  
  // Sponsor management
  getSponsor(id: number): Promise<schema.Sponsor>;
  getSponsorByUserId(userId: number): Promise<schema.Sponsor | undefined>;
  createSponsor(sponsorData: any): Promise<schema.Sponsor>;
  updateSponsor(id: number, sponsorData: Partial<schema.Sponsor>): Promise<schema.Sponsor>;
  verifySponsor(id: number): Promise<schema.Sponsor>;
  
  // Sponsored challenge management
  getSponsoredChallenge(id: number): Promise<schema.SponsoredChallenge>;
  getSponsoredChallengeByChallenge(challengeId: number): Promise<schema.SponsoredChallenge | undefined>;
  getSponsoredChallengesBySponsor(sponsorId: number): Promise<schema.SponsoredChallenge[]>;
  createSponsoredChallenge(sponsoredChallengeData: any): Promise<schema.SponsoredChallenge>;
  updateSponsoredChallenge(id: number, sponsoredChallengeData: Partial<schema.SponsoredChallenge>): Promise<schema.SponsoredChallenge>;
  selectWinnerForSponsoredChallenge(id: number, submissionId: number): Promise<schema.SponsoredChallenge>;
  
  // Match history
  getMatchHistory(id: number): Promise<schema.MatchHistory>;
  getMatchHistoryByUser(userId: number): Promise<schema.MatchHistory[]>;
  createMatchHistory(matchData: any): Promise<schema.MatchHistory>;
  
  // Leaderboard and ranking
  getUserRankings(category?: string, limit?: number): Promise<schema.User[]>;
  getTeamRankings(limit?: number): Promise<schema.Team[]>;
  getGuildRankings(limit?: number): Promise<schema.Guild[]>;
  
  // Voting pairs for the feed
  getVotingPairs(type?: string, limit?: number): Promise<any[]>;
  
  // Session store
  sessionStore: session.Store;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<schema.User> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });
    
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
  }

  async createUser(userData: any): Promise<schema.User> {
    const [user] = await db.insert(schema.users).values({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return user;
  }

  async updateUser(id: number, userData: Partial<schema.User>): Promise<schema.User> {
    const [updatedUser] = await db.update(schema.users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, id))
      .returning();
    
    return updatedUser;
  }

  async getChallenge(id: number): Promise<schema.Challenge> {
    const challenge = await db.query.challenges.findFirst({
      where: eq(schema.challenges.id, id)
    });
    
    if (!challenge) {
      throw new Error(`Challenge with ID ${id} not found`);
    }
    
    return challenge;
  }

  async getChallenges(options: {
    type?: string;
    format?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
    sponsored?: boolean;
  } = {}): Promise<schema.Challenge[]> {
    let query = db.select().from(schema.challenges);
    
    if (options.type) {
      query = query.where(eq(schema.challenges.type, options.type as any));
    }
    
    if (options.format) {
      query = query.where(eq(schema.challenges.format, options.format as any));
    }
    
    if (options.isActive !== undefined) {
      query = query.where(eq(schema.challenges.isActive, options.isActive));
    }
    
    // Handle sponsored challenges filter
    if (options.sponsored !== undefined) {
      const challenges = await query;
      
      if (options.sponsored) {
        // If looking for sponsored challenges, get all sponsored challenge IDs
        const sponsoredChallenges = await db.select().from(schema.sponsoredChallenges);
        const sponsoredChallengeIds = sponsoredChallenges.map(sc => sc.challengeId);
        
        return challenges.filter(challenge => sponsoredChallengeIds.includes(challenge.id));
      } else {
        // If looking for non-sponsored challenges, exclude sponsored challenge IDs
        const sponsoredChallenges = await db.select().from(schema.sponsoredChallenges);
        const sponsoredChallengeIds = sponsoredChallenges.map(sc => sc.challengeId);
        
        return challenges.filter(challenge => !sponsoredChallengeIds.includes(challenge.id));
      }
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    query = query.orderBy(desc(schema.challenges.createdAt));
    
    return await query;
  }

  async createChallenge(challengeData: any): Promise<schema.Challenge> {
    const [challenge] = await db.insert(schema.challenges).values({
      ...challengeData,
      createdAt: new Date()
    }).returning();
    
    return challenge;
  }

  async updateChallenge(id: number, challengeData: Partial<schema.Challenge>): Promise<schema.Challenge> {
    const [updatedChallenge] = await db.update(schema.challenges)
      .set(challengeData)
      .where(eq(schema.challenges.id, id))
      .returning();
    
    return updatedChallenge;
  }

  async getSubmission(id: number): Promise<schema.Submission> {
    const submission = await db.query.submissions.findFirst({
      where: eq(schema.submissions.id, id)
    });
    
    if (!submission) {
      throw new Error(`Submission with ID ${id} not found`);
    }
    
    return submission;
  }

  async getSubmissionsByChallenge(challengeId: number): Promise<schema.Submission[]> {
    return await db.select().from(schema.submissions)
      .where(eq(schema.submissions.challengeId, challengeId));
  }

  async getSubmissionsByUser(userId: number): Promise<schema.Submission[]> {
    return await db.select().from(schema.submissions)
      .where(eq(schema.submissions.userId, userId))
      .orderBy(desc(schema.submissions.submittedAt));
  }

  async createSubmission(submissionData: any): Promise<schema.Submission> {
    const [submission] = await db.insert(schema.submissions).values({
      ...submissionData,
      submittedAt: new Date()
    }).returning();
    
    return submission;
  }

  async getVote(id: number): Promise<schema.Vote> {
    const vote = await db.query.votes.findFirst({
      where: eq(schema.votes.id, id)
    });
    
    if (!vote) {
      throw new Error(`Vote with ID ${id} not found`);
    }
    
    return vote;
  }

  async getVotesBySubmission(submissionId: number): Promise<schema.Vote[]> {
    return await db.select().from(schema.votes)
      .where(eq(schema.votes.submissionId, submissionId));
  }

  async createVote(voteData: any): Promise<schema.Vote> {
    const [vote] = await db.insert(schema.votes).values({
      ...voteData,
      votedAt: new Date()
    }).returning();
    
    // Update user's daily vote count
    const user = await this.getUser(voteData.voterId);
    
    switch (voteData.voteType) {
      case "STANDARD":
        await this.updateUser(user.id, { dailyVotesUsed: user.dailyVotesUsed + 1 });
        break;
      case "DOUBLE":
        await this.updateUser(user.id, { dailyDoubleVotesUsed: user.dailyDoubleVotesUsed + 1 });
        break;
      case "SPECIAL":
        await this.updateUser(user.id, { dailySpecialVotesUsed: user.dailySpecialVotesUsed + 1 });
        break;
    }
    
    return vote;
  }

  async getVoteCountBySubmission(submissionId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(schema.votes)
      .where(eq(schema.votes.submissionId, submissionId));
    
    return result[0]?.count || 0;
  }

  async getUserDailyVotes(userId: number): Promise<{
    standard: number;
    double: number;
    special: number;
  }> {
    const user = await this.getUser(userId);
    
    return {
      standard: user.dailyVotesUsed,
      double: user.dailyDoubleVotesUsed,
      special: user.dailySpecialVotesUsed
    };
  }

  async getCommentsBySubmission(submissionId: number): Promise<schema.Comment[]> {
    return await db.select().from(schema.comments)
      .where(eq(schema.comments.submissionId, submissionId))
      .orderBy(desc(schema.comments.createdAt));
  }

  async createComment(commentData: any): Promise<schema.Comment> {
    const [comment] = await db.insert(schema.comments).values({
      ...commentData,
      createdAt: new Date(),
      likes: 0
    }).returning();
    
    return comment;
  }

  async likeComment(commentId: number): Promise<schema.Comment> {
    const comment = await db.query.comments.findFirst({
      where: eq(schema.comments.id, commentId)
    });
    
    if (!comment) {
      throw new Error(`Comment with ID ${commentId} not found`);
    }
    
    const [updatedComment] = await db.update(schema.comments)
      .set({ likes: comment.likes + 1 })
      .where(eq(schema.comments.id, commentId))
      .returning();
    
    return updatedComment;
  }

  async getTeam(id: number): Promise<schema.Team> {
    const team = await db.query.teams.findFirst({
      where: eq(schema.teams.id, id)
    });
    
    if (!team) {
      throw new Error(`Team with ID ${id} not found`);
    }
    
    return team;
  }

  async getTeamsByUser(userId: number): Promise<schema.Team[]> {
    const teamMembers = await db.select().from(schema.teamMembers)
      .where(eq(schema.teamMembers.userId, userId));
    
    const teamIds = teamMembers.map(tm => tm.teamId);
    
    if (teamIds.length === 0) {
      return [];
    }
    
    return await db.select().from(schema.teams)
      .where(sql`${schema.teams.id} IN (${teamIds.join(',')})`);
  }

  async createTeam(teamData: any): Promise<schema.Team> {
    const [team] = await db.insert(schema.teams).values({
      ...teamData,
      createdAt: new Date()
    }).returning();
    
    // Add leader as team member
    await db.insert(schema.teamMembers).values({
      teamId: team.id,
      userId: teamData.leaderUserId,
      joinedAt: new Date()
    });
    
    return team;
  }

  async addTeamMember(teamId: number, userId: number): Promise<void> {
    await db.insert(schema.teamMembers).values({
      teamId,
      userId,
      joinedAt: new Date()
    });
  }

  async getGuild(id: number): Promise<schema.Guild> {
    const guild = await db.query.guilds.findFirst({
      where: eq(schema.guilds.id, id)
    });
    
    if (!guild) {
      throw new Error(`Guild with ID ${id} not found`);
    }
    
    return guild;
  }

  async getGuildByUser(userId: number): Promise<schema.Guild | undefined> {
    const user = await this.getUser(userId);
    
    if (!user.guildId) {
      return undefined;
    }
    
    return await this.getGuild(user.guildId);
  }

  async getTopGuilds(limit: number = 10): Promise<schema.Guild[]> {
    return await db.select().from(schema.guilds)
      .orderBy(desc(schema.guilds.eloRating))
      .limit(limit);
  }

  async createGuild(guildData: any): Promise<schema.Guild> {
    const [guild] = await db.insert(schema.guilds).values({
      ...guildData,
      createdAt: new Date(),
      weeklyPoints: 0,
      eloRating: 1000
    }).returning();
    
    // Set guild for creator
    await this.updateUser(guildData.createdById, { guildId: guild.id });
    
    return guild;
  }

  async getMatchHistory(id: number): Promise<schema.MatchHistory> {
    const matchHistory = await db.query.matchHistory.findFirst({
      where: eq(schema.matchHistory.id, id)
    });
    
    if (!matchHistory) {
      throw new Error(`Match history with ID ${id} not found`);
    }
    
    return matchHistory;
  }

  async getMatchHistoryByUser(userId: number): Promise<schema.MatchHistory[]> {
    return await db.select().from(schema.matchHistory)
      .where(
        sql`${schema.matchHistory.winnerId} = ${userId} OR ${schema.matchHistory.loserId} = ${userId}`
      )
      .orderBy(desc(schema.matchHistory.completedAt));
  }

  async createMatchHistory(matchData: any): Promise<schema.MatchHistory> {
    const [match] = await db.insert(schema.matchHistory).values({
      ...matchData,
      completedAt: new Date()
    }).returning();
    
    // Update elo ratings
    if (matchData.winnerId) {
      const winner = await this.getUser(matchData.winnerId);
      await this.updateUser(winner.id, { eloRating: winner.eloRating + matchData.winnerEloChange });
    }
    
    if (matchData.loserId) {
      const loser = await this.getUser(matchData.loserId);
      await this.updateUser(loser.id, { eloRating: loser.eloRating + matchData.loserEloChange });
    }
    
    // Update guild weekly points if applicable
    if (matchData.winnerId) {
      const winner = await this.getUser(matchData.winnerId);
      
      if (winner.guildId) {
        const guild = await this.getGuild(winner.guildId);
        await db.update(schema.guilds)
          .set({ weeklyPoints: guild.weeklyPoints + 10 })
          .where(eq(schema.guilds.id, guild.id));
      }
    }
    
    return match;
  }

  async getUserRankings(category?: string, limit: number = 50): Promise<schema.User[]> {
    let query = db.select().from(schema.users);
    
    // If category is specified, we'd need more complex logic here
    // For now, just return top users by ELO
    query = query.orderBy(desc(schema.users.eloRating)).limit(limit);
    
    return await query;
  }

  async getTeamRankings(limit: number = 50): Promise<schema.Team[]> {
    // In a real app, we'd need to calculate team rankings
    // For now, return all teams
    return await db.select().from(schema.teams).limit(limit);
  }

  async getGuildRankings(limit: number = 50): Promise<schema.Guild[]> {
    return await db.select().from(schema.guilds)
      .orderBy(desc(schema.guilds.eloRating))
      .limit(limit);
  }

  // Sponsor methods
  async getSponsor(id: number): Promise<schema.Sponsor> {
    const sponsor = await db.query.sponsors.findFirst({
      where: eq(schema.sponsors.id, id)
    });
    
    if (!sponsor) {
      throw new Error(`Sponsor with ID ${id} not found`);
    }
    
    return sponsor;
  }

  async getSponsorByUserId(userId: number): Promise<schema.Sponsor | undefined> {
    return await db.query.sponsors.findFirst({
      where: eq(schema.sponsors.userId, userId)
    });
  }

  async createSponsor(sponsorData: any): Promise<schema.Sponsor> {
    const [sponsor] = await db.insert(schema.sponsors).values({
      ...sponsorData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return sponsor;
  }

  async updateSponsor(id: number, sponsorData: Partial<schema.Sponsor>): Promise<schema.Sponsor> {
    const [updatedSponsor] = await db.update(schema.sponsors)
      .set({
        ...sponsorData,
        updatedAt: new Date()
      })
      .where(eq(schema.sponsors.id, id))
      .returning();
    
    return updatedSponsor;
  }

  async verifySponsor(id: number): Promise<schema.Sponsor> {
    const [verifiedSponsor] = await db.update(schema.sponsors)
      .set({
        verificationStatus: "VERIFIED",
        verified: true,
        verifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(schema.sponsors.id, id))
      .returning();
    
    return verifiedSponsor;
  }

  // Sponsored challenge methods
  async getSponsoredChallenge(id: number): Promise<schema.SponsoredChallenge> {
    const sponsoredChallenge = await db.query.sponsoredChallenges.findFirst({
      where: eq(schema.sponsoredChallenges.id, id)
    });
    
    if (!sponsoredChallenge) {
      throw new Error(`Sponsored challenge with ID ${id} not found`);
    }
    
    return sponsoredChallenge;
  }

  async getSponsoredChallengeByChallenge(challengeId: number): Promise<schema.SponsoredChallenge | undefined> {
    return await db.query.sponsoredChallenges.findFirst({
      where: eq(schema.sponsoredChallenges.challengeId, challengeId)
    });
  }

  async getSponsoredChallengesBySponsor(sponsorId: number): Promise<schema.SponsoredChallenge[]> {
    return await db.select().from(schema.sponsoredChallenges)
      .where(eq(schema.sponsoredChallenges.sponsorId, sponsorId))
      .orderBy(desc(schema.sponsoredChallenges.createdAt));
  }

  async createSponsoredChallenge(sponsoredChallengeData: any): Promise<schema.SponsoredChallenge> {
    const [sponsoredChallenge] = await db.insert(schema.sponsoredChallenges).values({
      ...sponsoredChallengeData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return sponsoredChallenge;
  }

  async updateSponsoredChallenge(id: number, sponsoredChallengeData: Partial<schema.SponsoredChallenge>): Promise<schema.SponsoredChallenge> {
    const [updatedSponsoredChallenge] = await db.update(schema.sponsoredChallenges)
      .set({
        ...sponsoredChallengeData,
        updatedAt: new Date()
      })
      .where(eq(schema.sponsoredChallenges.id, id))
      .returning();
    
    return updatedSponsoredChallenge;
  }

  async selectWinnerForSponsoredChallenge(id: number, submissionId: number): Promise<schema.SponsoredChallenge> {
    const sponsoredChallenge = await this.getSponsoredChallenge(id);
    const submission = await this.getSubmission(submissionId);
    
    // Make sure the submission is for the correct challenge
    if (submission.challengeId !== sponsoredChallenge.challengeId) {
      throw new Error(`Submission ${submissionId} is not for the sponsored challenge's associated challenge`);
    }
    
    const [updatedSponsoredChallenge] = await db.update(schema.sponsoredChallenges)
      .set({
        winnerSelectedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(schema.sponsoredChallenges.id, id))
      .returning();
    
    // Create a match history record for this win
    await this.createMatchHistory({
      challengeId: sponsoredChallenge.challengeId,
      winnerId: submission.userId,
      winnerTeamId: submission.teamId,
      completedAt: new Date()
    });
    
    return updatedSponsoredChallenge;
  }

  async getVotingPairs(type?: string, limit: number = 10): Promise<any[]> {
    // Query to get challenges
    const challenges = await this.getChallenges({ 
      isActive: true, 
      type: type,
      limit
    });
    
    if (challenges.length === 0) {
      return [];
    }
    
    // Fetch submissions for each challenge
    const result = [];
    
    for (const challenge of challenges) {
      const submissions = await this.getSubmissionsByChallenge(challenge.id);
      
      if (submissions.length >= 2) {
        // Randomly select 2 submissions
        const shuffled = submissions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2);
        
        // Fetch vote counts
        const submission1Votes = await this.getVoteCountBySubmission(selected[0].id);
        const submission2Votes = await this.getVoteCountBySubmission(selected[1].id);
        
        // Get user info for submissions
        const user1 = await this.getUser(selected[0].userId);
        const user2 = await this.getUser(selected[1].userId);
        
        // Get sponsored challenge info if this is a sponsored challenge
        const sponsoredChallenge = await this.getSponsoredChallengeByChallenge(challenge.id);
        
        result.push({
          challenge,
          sponsoredChallenge,
          submissions: {
            [selected[0].id]: {
              ...selected[0],
              user: { id: user1.id, username: user1.username, avatarUrl: user1.avatarUrl },
              votesCount: submission1Votes
            },
            [selected[1].id]: {
              ...selected[1],
              user: { id: user2.id, username: user2.username, avatarUrl: user2.avatarUrl },
              votesCount: submission2Votes
            }
          },
          totalVotes: submission1Votes + submission2Votes
        });
      }
    }
    
    return result;
  }
}

export const storage = new DatabaseStorage();