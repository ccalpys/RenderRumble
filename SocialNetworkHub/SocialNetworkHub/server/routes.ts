import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupSocketHandlers } from "./ws-handlers";
import { 
  challenges, users, submissions, votes, comments, teams, guilds, matchHistory,
  sponsors, sponsoredChallenges,
  insertChallengeSchema, insertSubmissionSchema, insertVoteSchema, insertCommentSchema,
  insertSponsorSchema, insertSponsoredChallengeSchema
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@db";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  setupSocketHandlers(wss, storage);

  // API Routes
  // ----- Challenges -----
  app.get("/api/challenges", async (req, res) => {
    try {
      const { type, format, active } = req.query;
      const isActive = active === 'true' ? true : active === 'false' ? false : undefined;
      
      const challenges = await storage.getChallenges({
        type: type as string,
        format: format as string,
        isActive
      });
      
      res.json(challenges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/challenges/active", async (req, res) => {
    try {
      const { category } = req.query;
      
      const activeChallenges = await storage.getChallenges({
        type: category as string,
        isActive: true
      });
      
      res.json(activeChallenges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/challenges/:id", async (req, res) => {
    try {
      const challenge = await storage.getChallenge(parseInt(req.params.id));
      res.json(challenge);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });
  
  app.post("/api/challenges", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const validData = insertChallengeSchema.parse({
        ...req.body,
        createdById: req.user.id
      });
      
      const challenge = await storage.createChallenge(validData);
      res.status(201).json(challenge);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  // ----- Submissions -----
  app.get("/api/submissions/user/:userId", async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByUser(parseInt(req.params.userId));
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/submissions/challenge/:challengeId", async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByChallenge(parseInt(req.params.challengeId));
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/submissions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const validData = insertSubmissionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const submission = await storage.createSubmission(validData);
      res.status(201).json(submission);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  // ----- Votes -----
  app.post("/api/votes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Check if user has votes left
      const dailyVotes = await storage.getUserDailyVotes(req.user.id);
      
      switch (req.body.voteType) {
        case 'STANDARD':
          if (dailyVotes.standard >= 15) {
            return res.status(400).json({ message: "You've used all your standard votes for today" });
          }
          break;
        case 'DOUBLE':
          if (dailyVotes.double >= 3) {
            return res.status(400).json({ message: "You've used all your double votes for today" });
          }
          break;
        case 'SPECIAL':
          if (dailyVotes.special >= 1) {
            return res.status(400).json({ message: "You've used all your special votes for today" });
          }
          break;
      }
      
      const validData = insertVoteSchema.parse({
        ...req.body,
        voterId: req.user.id
      });
      
      const vote = await storage.createVote(validData);
      res.status(201).json(vote);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/votes/submission/:submissionId", async (req, res) => {
    try {
      const votes = await storage.getVotesBySubmission(parseInt(req.params.submissionId));
      res.json(votes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ----- Comments -----
  app.get("/api/comments/:submissionId", async (req, res) => {
    try {
      const comments = await storage.getCommentsBySubmission(parseInt(req.params.submissionId));
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const validData = insertCommentSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const comment = await storage.createComment(validData);
      res.status(201).json(comment);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/comments/:commentId/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const comment = await storage.likeComment(parseInt(req.params.commentId));
      res.json(comment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ----- Teams -----
  app.get("/api/teams/user", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const teams = await storage.getTeamsByUser(req.user.id);
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/teams", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const team = await storage.createTeam({
        ...req.body,
        leaderUserId: req.user.id
      });
      
      res.status(201).json(team);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/teams/:teamId/members", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { userId } = req.body;
      await storage.addTeamMember(parseInt(req.params.teamId), userId);
      res.status(201).json({ message: "Member added successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ----- Guilds -----
  app.get("/api/guilds/user/:userId", async (req, res) => {
    try {
      const guild = await storage.getGuildByUser(parseInt(req.params.userId));
      
      if (!guild) {
        return res.json(null);
      }
      
      // Get guild members
      const guildMembers = await storage.getUserRankings();
      const filteredMembers = guildMembers.filter(m => m.guildId === guild.id);
      
      // Get recent matches
      const recentMatches: any[] = [];
      
      res.json({
        ...guild,
        members: filteredMembers,
        recentMatches
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/guilds/top", async (req, res) => {
    try {
      const topGuilds = await storage.getTopGuilds(10);
      res.json(topGuilds);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/guilds", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const guild = await storage.createGuild({
        ...req.body,
        createdById: req.user.id
      });
      
      res.status(201).json(guild);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  // ----- Leaderboard -----
  app.get("/api/leaderboard/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const { category, search } = req.query;
      
      let results;
      
      switch (type) {
        case 'users':
          results = await storage.getUserRankings(category as string);
          if (search) {
            results = results.filter(u => 
              u.username.toLowerCase().includes((search as string).toLowerCase())
            );
          }
          break;
        case 'teams':
          results = await storage.getTeamRankings();
          break;
        case 'guilds':
          results = await storage.getGuildRankings();
          break;
        default:
          return res.status(400).json({ message: "Invalid leaderboard type" });
      }
      
      // Transform results to include rank and other metrics
      const transformedResults = results.map((entity, index) => {
        const rankChange = Math.floor(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1);
        const wins = Math.floor(Math.random() * 100);
        const losses = Math.floor(Math.random() * 50);
        
        return {
          ...entity,
          type: type.slice(0, -1), // singular form: 'user', 'team', 'guild'
          rank: index + 1,
          rankChange,
          wins,
          losses,
          rating: entity.eloRating,
          name: type === 'users' ? entity.username : entity.name,
          members: type !== 'users' ? Math.floor(Math.random() * 10) + 1 : undefined,
          category: ['CODE', 'DESIGN', 'VIDEO', 'AUDIO'][Math.floor(Math.random() * 4)]
        };
      });
      
      res.json(transformedResults);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/leaderboard/user/:userId", async (req, res) => {
    if (!req.params.userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      const rankedUsers = await storage.getUserRankings();
      const userRank = rankedUsers.findIndex((u: any) => u.id === userId) + 1;
      
      // Get user's win/loss record
      const matchHistory = await storage.getMatchHistoryByUser(userId);
      const wins = matchHistory.filter(m => m.winnerId === userId).length;
      const losses = matchHistory.filter(m => m.loserId === userId).length;
      
      res.json({
        ...user,
        rank: userRank,
        rankChange: Math.floor(Math.random() * 5),
        wins,
        losses
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ----- User Profile -----
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      // Get user's submissions
      const submissions = await storage.getSubmissionsByUser(userId);
      
      // Get user's match history
      const matchHistory = await storage.getMatchHistoryByUser(userId);
      
      // Calculate wonChallenges and totalChallenges
      const wonChallenges = matchHistory.filter(m => m.winnerId === userId).length;
      const totalChallenges = matchHistory.length;
      
      // Generate some mock badges
      const badges = [
        {
          id: 1,
          name: "Code Master",
          icon: "code",
          description: "Win 10 coding challenges",
          rarity: "epic"
        },
        {
          id: 2,
          name: "Design Guru",
          icon: "brush",
          description: "Complete 5 design challenges",
          rarity: "rare"
        },
        {
          id: 3,
          name: "First Victory",
          icon: "trophy",
          description: "Win your first challenge",
          rarity: "common"
        },
        {
          id: 4,
          name: "Early Adopter",
          icon: "star",
          description: "Join during beta testing",
          rarity: "legendary"
        }
      ];
      
      // Generate stats
      const rankedUsers = await storage.getUserRankings();
      const userRank = rankedUsers.findIndex((u: any) => u.id === userId) + 1;

      const stats = {
        category: {
          code: 75,
          design: 50,
          video: 30,
          audio: 15
        },
        winRate: matchHistory.length > 0 
          ? Math.round((wonChallenges / totalChallenges) * 100) 
          : 0,
        avgScore: 4.2,
        rank: userRank
      };
      
      res.json({
        ...user,
        submissions,
        matchHistory,
        wonChallenges,
        totalChallenges,
        badges,
        stats
      });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });
  
  // ----- Voting Feed -----
  app.get("/api/vote-submission-pairs/:challengeId", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.challengeId);
      const challenge = await storage.getChallenge(challengeId);
      
      // Get all submissions for this challenge
      const allSubmissions = await storage.getSubmissionsByChallenge(challengeId);
      
      if (allSubmissions.length < 2) {
        return res.status(400).json({ message: "Not enough submissions for voting" });
      }
      
      // Get the first two submissions
      const submission1 = allSubmissions[0];
      const submission2 = allSubmissions[1];
      
      // Get vote counts
      const votes1 = await storage.getVoteCountBySubmission(submission1.id);
      const votes2 = await storage.getVoteCountBySubmission(submission2.id);
      const totalVotes = votes1 + votes2;
      
      const response = {
        challenge,
        submissions: {
          submission1: {
            ...submission1,
            votesCount: votes1
          },
          submission2: {
            ...submission2,
            votesCount: votes2
          }
        },
        totalVotes
      };
      
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ----- Sponsors API Routes -----
  app.get("/api/sponsors", async (req, res) => {
    try {
      // Fetch all verified sponsors
      const results = await db.select().from(sponsors).where(eq(sponsors.verified, true));
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sponsors/:id", async (req, res) => {
    try {
      const sponsorId = parseInt(req.params.id);
      const sponsor = await storage.getSponsor(sponsorId);
      res.json(sponsor);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });

  app.post("/api/sponsors", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const validData = insertSponsorSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const sponsor = await storage.createSponsor(validData);
      res.status(201).json(sponsor);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/sponsors/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const sponsorId = parseInt(req.params.id);
      const sponsor = await storage.getSponsor(sponsorId);
      
      // Check if user is the owner of the sponsor
      if (sponsor.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedSponsor = await storage.updateSponsor(sponsorId, req.body);
      res.json(updatedSponsor);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sponsors/:id/verify", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // TODO: Check if user is an admin
    
    try {
      const sponsorId = parseInt(req.params.id);
      const verifiedSponsor = await storage.verifySponsor(sponsorId);
      res.json(verifiedSponsor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ----- Sponsored Challenges API Routes -----
  app.get("/api/sponsored-challenges", async (req, res) => {
    try {
      const { active } = req.query;
      const isActive = active === 'true' ? true : active === 'false' ? false : undefined;
      
      // Get all sponsored challenges
      const sponsoredChallenges = await storage.getChallenges({
        sponsored: true,
        isActive
      });
      
      res.json(sponsoredChallenges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sponsored-challenges/:id", async (req, res) => {
    try {
      const sponsoredChallengeId = parseInt(req.params.id);
      const sponsoredChallenge = await storage.getSponsoredChallenge(sponsoredChallengeId);
      
      // Get the challenge details
      const challenge = await storage.getChallenge(sponsoredChallenge.challengeId);
      
      // Get the sponsor details
      const sponsor = await storage.getSponsor(sponsoredChallenge.sponsorId);
      
      res.json({
        ...sponsoredChallenge,
        challenge,
        sponsor
      });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });

  app.post("/api/sponsored-challenges", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Check if user is a verified sponsor
      const sponsor = await storage.getSponsorByUserId(req.user.id);
      
      if (!sponsor) {
        return res.status(403).json({ message: "You must be a verified sponsor to create sponsored challenges" });
      }
      
      if (sponsor.verificationStatus !== 'VERIFIED') {
        return res.status(403).json({ message: "Your sponsor account must be verified before creating sponsored challenges" });
      }
      
      // Create the challenge first
      const challengeData = insertChallengeSchema.parse({
        ...req.body.challenge,
        createdById: req.user.id
      });
      
      const challenge = await storage.createChallenge(challengeData);
      
      // Then create the sponsored challenge
      const sponsoredChallengeData = insertSponsoredChallengeSchema.parse({
        ...req.body,
        sponsorId: sponsor.id,
        challengeId: challenge.id
      });
      
      const sponsoredChallenge = await storage.createSponsoredChallenge(sponsoredChallengeData);
      
      res.status(201).json({
        ...sponsoredChallenge,
        challenge,
        sponsor
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/sponsored-challenges/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const sponsoredChallengeId = parseInt(req.params.id);
      const sponsoredChallenge = await storage.getSponsoredChallenge(sponsoredChallengeId);
      
      // Get the sponsor to check ownership
      const sponsor = await storage.getSponsor(sponsoredChallenge.sponsorId);
      
      if (sponsor.userId !== req.user.id) {
        return res.status(403).json({ message: "You can only update your own sponsored challenges" });
      }
      
      const updatedSponsoredChallenge = await storage.updateSponsoredChallenge(sponsoredChallengeId, req.body);
      
      // Update the challenge if challenge data is provided
      let challenge = await storage.getChallenge(sponsoredChallenge.challengeId);
      
      if (req.body.challenge) {
        challenge = await storage.updateChallenge(sponsoredChallenge.challengeId, req.body.challenge);
      }
      
      res.json({
        ...updatedSponsoredChallenge,
        challenge,
        sponsor
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sponsored-challenges/:id/select-winner", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const sponsoredChallengeId = parseInt(req.params.id);
      const { submissionId } = req.body;
      
      if (!submissionId) {
        return res.status(400).json({ message: "Submission ID is required" });
      }
      
      const sponsoredChallenge = await storage.getSponsoredChallenge(sponsoredChallengeId);
      
      // Check if user is the sponsor
      const sponsor = await storage.getSponsor(sponsoredChallenge.sponsorId);
      
      if (sponsor.userId !== req.user.id) {
        return res.status(403).json({ message: "Only the sponsor can select a winner" });
      }
      
      // Check if the submission exists and belongs to this challenge
      const submission = await storage.getSubmission(submissionId);
      
      if (submission.challengeId !== sponsoredChallenge.challengeId) {
        return res.status(400).json({ message: "This submission does not belong to this challenge" });
      }
      
      // Select the winner
      const updatedSponsoredChallenge = await storage.selectWinnerForSponsoredChallenge(
        sponsoredChallengeId, 
        submissionId
      );
      
      res.json(updatedSponsoredChallenge);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ----- Tournaments -----
  app.get("/api/tournaments/upcoming", async (req, res) => {
    try {
      // Mock data for upcoming tournaments
      const upcomingTournaments = [
        {
          id: 1,
          title: "Weekly Code Wars",
          description: "Compete in a series of coding challenges",
          type: "CODE",
          format: "ONE_VS_ONE",
          duration: 120,
          startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          tags: ["javascript", "react", "algorithms"]
        },
        {
          id: 2,
          title: "Design Masters Cup",
          description: "Show off your design skills",
          type: "DESIGN",
          format: "TEAM_VS_TEAM",
          duration: 180,
          startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          tags: ["ui", "ux", "figma"]
        },
        {
          id: 3,
          title: "Creative Battle Royale",
          description: "Multi-discipline creative challenge",
          type: "VIDEO",
          format: "BATTLE_ROYALE",
          duration: 240,
          startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          tags: ["video", "editing", "effects"]
        }
      ];
      
      res.json(upcomingTournaments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
