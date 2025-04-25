import { db } from "./index";
import * as schema from "@shared/schema";
import { eq, and } from "drizzle-orm";

async function seed() {
  try {
    console.log("Starting database seed...");
    
    // Create sample users
    console.log("Creating sample users...");
    
    const usersData = [
      {
        username: "CodeMaster42",
        password: "password-hash.salt", // In production, these would be properly hashed
        email: "codemaster42@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&auto=format&fit=crop&q=60",
        bio: "Full-stack developer with a passion for clean code and creative solutions.",
        eloRating: 1842,
        level: 24,
        experience: 5600,
        dailyVotesUsed: 3,
        dailyDoubleVotesUsed: 1,
        dailySpecialVotesUsed: 0
      },
      {
        username: "PixelQueen",
        password: "password-hash.salt",
        email: "pixelqueen@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1614644147724-2d4785d69962?w=150&h=150&auto=format&fit=crop&q=60",
        bio: "Digital artist and UI designer with an eye for detail.",
        eloRating: 2130,
        level: 27,
        experience: 7300,
        dailyVotesUsed: 5,
        dailyDoubleVotesUsed: 0,
        dailySpecialVotesUsed: 0
      },
      {
        username: "CodeArtisan",
        password: "password-hash.salt",
        email: "codeartisan@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&auto=format&fit=crop&q=60",
        bio: "Crafting beautiful code is my art form.",
        eloRating: 2054,
        level: 22,
        experience: 4800,
        dailyVotesUsed: 7,
        dailyDoubleVotesUsed: 2,
        dailySpecialVotesUsed: 0
      },
      {
        username: "DevMaster99",
        password: "password-hash.salt",
        email: "devmaster99@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&auto=format&fit=crop&q=60",
        bio: "Professional developer with 10 years of experience in web and mobile.",
        eloRating: 2156,
        level: 30,
        experience: 9200,
        dailyVotesUsed: 8,
        dailyDoubleVotesUsed: 3,
        dailySpecialVotesUsed: 1
      },
      {
        username: "SpaceNinja",
        password: "password-hash.salt",
        email: "spaceninja@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&auto=format&fit=crop&q=60",
        bio: "Creating out-of-this-world designs and animations.",
        eloRating: 1762,
        level: 18,
        experience: 3200,
        dailyVotesUsed: 2,
        dailyDoubleVotesUsed: 0,
        dailySpecialVotesUsed: 0
      },
      {
        username: "CosmicCoder",
        password: "password-hash.salt",
        email: "cosmiccoder@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&auto=format&fit=crop&q=60",
        bio: "Frontend developer specializing in React and Three.js.",
        eloRating: 1788,
        level: 19,
        experience: 3600,
        dailyVotesUsed: 4,
        dailyDoubleVotesUsed: 1,
        dailySpecialVotesUsed: 0
      },
      {
        username: "WebWizard",
        password: "password-hash.salt",
        email: "webwizard@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&auto=format&fit=crop&q=60",
        bio: "Creating magical web experiences with modern technologies.",
        eloRating: 1902,
        level: 21,
        experience: 4400,
        dailyVotesUsed: 6,
        dailyDoubleVotesUsed: 2,
        dailySpecialVotesUsed: 0
      },
      {
        username: "PixelPirate",
        password: "password-hash.salt",
        email: "pixelpirate@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&auto=format&fit=crop&q=60",
        bio: "Sailing the digital seas in search of pixel-perfect designs.",
        eloRating: 1845,
        level: 17,
        experience: 2900,
        dailyVotesUsed: 3,
        dailyDoubleVotesUsed: 1,
        dailySpecialVotesUsed: 0
      }
    ];

    for (const userData of usersData) {
      const existingUser = await db.query.users.findFirst({
        where: eq(schema.users.username, userData.username)
      });

      if (!existingUser) {
        await db.insert(schema.users).values({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    // Create sample guilds
    console.log("Creating sample guilds...");
    
    const guildsData = [
      {
        name: "Pixel Pioneers",
        description: "A collective of creative designers pushing the boundaries of digital art.",
        avatarUrl: null,
        createdById: 1, // CodeMaster42
        weeklyPoints: 586,
        eloRating: 1920
      },
      {
        name: "Code Warriors",
        description: "Elite developers who thrive on challenging coding competitions.",
        avatarUrl: null,
        createdById: 3, // CodeArtisan
        weeklyPoints: 720,
        eloRating: 2050
      },
      {
        name: "Digital Dynamos",
        description: "A guild focused on all aspects of digital creation.",
        avatarUrl: null,
        createdById: 4, // DevMaster99
        weeklyPoints: 650,
        eloRating: 1980
      }
    ];
    
    for (const guildData of guildsData) {
      const existingGuild = await db.query.guilds.findFirst({
        where: eq(schema.guilds.name, guildData.name)
      });
      
      if (!existingGuild) {
        const [guild] = await db.insert(schema.guilds).values({
          ...guildData,
          createdAt: new Date()
        }).returning();
        
        // Set guild for creator
        await db.update(schema.users)
          .set({ guildId: guild.id })
          .where(eq(schema.users.id, guildData.createdById));
        
        // Add some members to guild
        if (guild.id === 1) {
          await db.update(schema.users)
            .set({ guildId: guild.id })
            .where(eq(schema.users.id, 2)); // PixelQueen
          
          await db.update(schema.users)
            .set({ guildId: guild.id })
            .where(eq(schema.users.id, 5)); // SpaceNinja
        }
      }
    }
    
    // Create sample teams
    console.log("Creating sample teams...");
    
    const teamsData = [
      {
        name: "Team Pixel",
        avatarUrl: null,
        leaderUserId: 2 // PixelQueen
      },
      {
        name: "Team Arcade",
        avatarUrl: null,
        leaderUserId: 7 // WebWizard
      }
    ];
    
    const teamIds: number[] = [];
    
    for (const teamData of teamsData) {
      const existingTeam = await db.query.teams.findFirst({
        where: eq(schema.teams.name, teamData.name)
      });
      
      if (!existingTeam) {
        const [team] = await db.insert(schema.teams).values({
          ...teamData,
          createdAt: new Date()
        }).returning();
        
        // Add team members
        if (team.id === 1) {
          await db.insert(schema.teamMembers).values({
            teamId: team.id,
            userId: 2, // PixelQueen (leader)
            joinedAt: new Date()
          });
          
          await db.insert(schema.teamMembers).values({
            teamId: team.id,
            userId: 8, // PixelPirate
            joinedAt: new Date()
          });
        } else if (team.id === 2) {
          await db.insert(schema.teamMembers).values({
            teamId: team.id,
            userId: 7, // WebWizard (leader)
            joinedAt: new Date()
          });
          
          await db.insert(schema.teamMembers).values({
            teamId: team.id,
            userId: 6, // CosmicCoder
            joinedAt: new Date()
          });
        }
        
        teamIds.push(team.id);
      } else {
        teamIds.push(existingTeam.id);
      }
    }

    // Create sample challenges
    console.log("Creating sample challenges...");
    
    const challengesData = [
      {
        title: "Space Themed Portfolio Page",
        description: "Create a responsive space-themed portfolio landing page with pure HTML/CSS in 45 minutes.",
        type: "CODE",
        format: "ONE_VS_ONE",
        duration: 45,
        createdById: 1,
        tags: ["HTML", "CSS", "SpaceTheme", "Portfolio"],
        isActive: false,
        startsAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        endsAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        title: "Retro Gaming App UI",
        description: "Design a mobile app interface for a retro game marketplace with Figma. Teams have 60 minutes to complete.",
        type: "DESIGN",
        format: "TEAM_VS_TEAM",
        duration: 60,
        createdById: 2,
        tags: ["UI", "Figma", "RetroGaming", "Mobile"],
        isActive: false,
        startsAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endsAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        title: "React Mini-Game Hackathon",
        description: "Build a simple mini-game using React in 45 minutes.",
        type: "CODE",
        format: "ONE_VS_ONE",
        duration: 45,
        createdById: 3,
        tags: ["React", "JavaScript", "Game", "Frontend"],
        isActive: true,
        startsAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
        endsAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins from now
      },
      {
        title: "Cyberpunk Logo Design",
        description: "Create a cyberpunk-themed logo for a fictional tech company.",
        type: "DESIGN",
        format: "ONE_VS_ONE",
        duration: 30,
        createdById: 4,
        tags: ["Logo", "Cyberpunk", "Branding", "Illustrator"],
        isActive: true,
        startsAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
        endsAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins from now
      }
    ];
    
    const challengeIds: number[] = [];
    
    for (const challengeData of challengesData) {
      const existingChallenge = await db.query.challenges.findFirst({
        where: eq(schema.challenges.title, challengeData.title)
      });
      
      if (!existingChallenge) {
        const [challenge] = await db.insert(schema.challenges).values({
          ...challengeData,
          createdAt: new Date()
        }).returning();
        
        challengeIds.push(challenge.id);
      } else {
        challengeIds.push(existingChallenge.id);
      }
    }
    
    // Create sample submissions
    console.log("Creating sample submissions...");
    
    const submissionsData = [
      {
        challengeId: challengeIds[0],
        userId: 5, // SpaceNinja
        content: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?q=80&w=800&auto=format&fit=crop",
        originalityScore: 4.8
      },
      {
        challengeId: challengeIds[0],
        userId: 6, // CosmicCoder
        content: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=800&auto=format&fit=crop",
        originalityScore: 4.7
      },
      {
        challengeId: challengeIds[1],
        userId: 2, // PixelQueen
        teamId: teamIds[0], // Team Pixel
        content: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
        originalityScore: 4.9
      },
      {
        challengeId: challengeIds[1],
        userId: 7, // WebWizard
        teamId: teamIds[1], // Team Arcade
        content: "https://images.unsplash.com/photo-1588336271629-1704e27ef8be?q=80&w=800&auto=format&fit=crop",
        originalityScore: 4.7
      }
    ];
    
    const submissionIds: number[] = [];
    
    for (const submissionData of submissionsData) {
      const existingSubmission = await db.query.submissions.findFirst({
        where: eq(schema.submissions.content, submissionData.content)
      });
      
      if (!existingSubmission) {
        const [submission] = await db.insert(schema.submissions).values({
          ...submissionData,
          submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
        }).returning();
        
        submissionIds.push(submission.id);
      } else {
        submissionIds.push(existingSubmission.id);
      }
    }
    
    // Create sample votes
    console.log("Creating sample votes...");
    
    const votesData = [
      { submissionId: submissionIds[0], voterId: 2, voteType: "STANDARD" },
      { submissionId: submissionIds[0], voterId: 3, voteType: "DOUBLE" },
      { submissionId: submissionIds[0], voterId: 4, voteType: "STANDARD" },
      { submissionId: submissionIds[0], voterId: 7, voteType: "SPECIAL" },
      { submissionId: submissionIds[1], voterId: 1, voteType: "STANDARD" },
      { submissionId: submissionIds[1], voterId: 8, voteType: "DOUBLE" },
      { submissionId: submissionIds[2], voterId: 1, voteType: "STANDARD" },
      { submissionId: submissionIds[2], voterId: 3, voteType: "DOUBLE" },
      { submissionId: submissionIds[2], voterId: 4, voteType: "STANDARD" },
      { submissionId: submissionIds[2], voterId: 6, voteType: "STANDARD" },
      { submissionId: submissionIds[2], voterId: 8, voteType: "SPECIAL" },
      { submissionId: submissionIds[3], voterId: 5, voteType: "STANDARD" },
      { submissionId: submissionIds[3], voterId: 7, voteType: "STANDARD" }
    ];
    
    for (const voteData of votesData) {
      const existingVote = await db.query.votes.findFirst({
        where: and(
          eq(schema.votes.submissionId, voteData.submissionId),
          eq(schema.votes.voterId, voteData.voterId)
        )
      });
      
      if (!existingVote) {
        await db.insert(schema.votes).values({
          ...voteData,
          votedAt: new Date()
        });
      }
    }
    
    // Create sample comments
    console.log("Creating sample comments...");
    
    const commentsData = [
      { 
        submissionId: submissionIds[0], 
        userId: 8, // PixelPirate
        content: "SpaceNinja's color scheme is fantastic! Love the parallax effect too.",
        likes: 5
      },
      { 
        submissionId: submissionIds[0], 
        userId: 7, // WebWizard
        content: "Both are amazing but CosmicCoder's typography choices are 🔥",
        likes: 3
      },
      { 
        submissionId: submissionIds[1], 
        userId: 1, // CodeMaster42
        content: "Great use of animation here. The transitions are smooth.",
        likes: 2
      },
      { 
        submissionId: submissionIds[2], 
        userId: 3, // CodeArtisan
        content: "The attention to detail on these retro designs is impressive!",
        likes: 4
      }
    ];
    
    for (const commentData of commentsData) {
      const existingComment = await db.query.comments.findFirst({
        where: and(
          eq(schema.comments.submissionId, commentData.submissionId),
          eq(schema.comments.userId, commentData.userId),
          eq(schema.comments.content, commentData.content)
        )
      });
      
      if (!existingComment) {
        await db.insert(schema.comments).values({
          ...commentData,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 60 * 1000) // Random time in the last hour
        });
      }
    }
    
    // Create sample match history
    console.log("Creating sample match history...");
    
    const matchHistoryData = [
      {
        challengeId: challengeIds[0],
        winnerId: 5, // SpaceNinja
        loserId: 6, // CosmicCoder
        winnerEloChange: 15,
        loserEloChange: -15
      },
      {
        challengeId: challengeIds[1],
        winnerTeamId: 1, // Team Pixel
        loserTeamId: 2, // Team Arcade
        winnerId: 2, // PixelQueen (as representative)
        loserId: 7, // WebWizard (as representative)
        winnerEloChange: 20,
        loserEloChange: -20
      }
    ];
    
    for (const matchData of matchHistoryData) {
      const existingMatch = await db.query.matchHistory.findFirst({
        where: and(
          eq(schema.matchHistory.challengeId, matchData.challengeId),
          eq(schema.matchHistory.winnerId, matchData.winnerId as number)
        )
      });
      
      if (!existingMatch) {
        await db.insert(schema.matchHistory).values({
          ...matchData,
          completedAt: new Date(Date.now() - 30 * 60 * 1000) // 30 mins ago
        });
      }
    }
    
    console.log("Seed completed successfully!");
  }
  catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
