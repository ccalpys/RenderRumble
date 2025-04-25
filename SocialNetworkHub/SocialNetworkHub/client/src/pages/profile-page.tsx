import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  User, Challenge, Submission, MatchHistory
} from "@shared/schema";
import {
  Star, Trophy, Medal, Upload, Code, Brush, Video, Music, Clock, Users,
  Calendar, BarChart3, Crown, Edit, Link as LinkIcon, Calendar as CalendarIcon, 
  Sparkles, Check, X
} from "lucide-react";
import { getInitials } from "@/lib/utils";

type UserProfile = User & {
  submissions: Array<Submission & { challenge: Challenge }>;
  matchHistory: MatchHistory[];
  wonChallenges: number;
  totalChallenges: number;
  badges: Array<{
    id: number;
    name: string;
    icon: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }>;
  stats: {
    category: {
      code: number;
      design: number;
      video: number;
      audio: number;
    };
    winRate: number;
    avgScore: number;
    rank: number;
  };
};

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const isMobile = useMobile();
  const [tab, setTab] = useState<"overview" | "submissions" | "badges" | "stats">("overview");
  
  // Determine if viewing own profile or someone else's
  const isOwnProfile = !id || (currentUser && id === currentUser.id.toString());
  
  const userId = isOwnProfile ? currentUser?.id : Number(id);
  
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });
  
  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'code':
        return <Code className="h-4 w-4 text-accent" />;
      case 'design':
        return <Brush className="h-4 w-4 text-primary" />;
      case 'video':
        return <Video className="h-4 w-4 text-secondary" />;
      case 'audio':
        return <Music className="h-4 w-4 text-accent" />;
      default:
        return <Code className="h-4 w-4 text-accent" />;
    }
  };
  
  const getBadgeBackground = (rarity: string) => {
    switch(rarity) {
      case 'common':
        return 'bg-muted';
      case 'rare':
        return 'bg-primary/20';
      case 'epic':
        return 'bg-secondary/20';
      case 'legendary':
        return 'bg-accent/20';
      default:
        return 'bg-muted';
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-primary via-secondary to-accent">
            {isOwnProfile && (
              <Button variant="secondary" size="sm" className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white border-none">
                <Edit className="h-4 w-4 mr-2" /> Edit Cover
              </Button>
            )}
            <div className="absolute -bottom-12 left-8">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={profile.avatarUrl || ""} />
                <AvatarFallback className="text-2xl">{getInitials(profile.username)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <div className="pt-16 px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold mr-2">{profile.username}</h1>
                  {profile.guildId && (
                    <Badge variant="outline" className="bg-primary/20 text-primary border-none">
                      <Shield className="h-3.5 w-3.5 mr-1" /> Pixel Pioneers
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-muted-foreground mt-1">
                  <div className="flex items-center mr-4">
                    <Star className="h-4 w-4 text-warning mr-1" />
                    <span>ELO {profile.eloRating}</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <Trophy className="h-4 w-4 text-primary mr-1" />
                    <span>{profile.wonChallenges} wins</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button variant="outline" className="flex items-center">
                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-2" /> Follow
                    </Button>
                    <Button className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" /> Challenge
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <Tabs value={tab} onValueChange={(value) => setTab(value as any)} className="mt-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>
        
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bio</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.bio ? (
                    <p>{profile.bio}</p>
                  ) : (
                    <p className="text-muted-foreground">No bio provided.</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.matchHistory.length > 0 ? (
                    <div className="space-y-4">
                      {profile.matchHistory.slice(0, 3).map((match, index) => (
                        <div key={index} className="flex p-3 bg-muted rounded-lg">
                          <div className="p-2 rounded-full bg-primary/20 mr-3">
                            {match.winnerId === profile.id ? (
                              <Trophy className="h-4 w-4 text-primary" />
                            ) : (
                              <Medal className="h-4 w-4 text-secondary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {match.winnerId === profile.id ? 'Won a challenge!' : 'Participated in a challenge'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {match.winnerId === profile.id 
                                ? `Won against another competitor in Challenge #${match.challengeId}. +${match.winnerEloChange} ELO` 
                                : `Lost to another competitor in Challenge #${match.challengeId}. ${match.loserEloChange} ELO`}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(match.completedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button variant="link" className="px-0">
                        View All Activity
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No activity yet</h3>
                      <p className="text-muted-foreground mb-4">
                        This user hasn't participated in any challenges yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Featured Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.submissions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.submissions.slice(0, 4).map((submission) => (
                        <div key={submission.id} className="group relative aspect-video bg-muted rounded-lg overflow-hidden">
                          <img 
                            src={submission.content} 
                            alt={`Submission for ${submission.challenge.title}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                            <div className="p-3 w-full">
                              <Badge variant="outline" className="bg-black/40 text-white border-none mb-1">
                                {getCategoryIcon(submission.challenge.type)} {submission.challenge.type}
                              </Badge>
                              <h4 className="font-medium text-white truncate">{submission.challenge.title}</h4>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
                      <p className="text-muted-foreground mb-4">
                        This user hasn't submitted any challenges yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stats Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold">{profile.level}</div>
                      <div className="text-xs text-muted-foreground">Level</div>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold">{profile.wonChallenges}</div>
                      <div className="text-xs text-muted-foreground">Challenges Won</div>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold">{profile.totalChallenges}</div>
                      <div className="text-xs text-muted-foreground">Total Challenges</div>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold">Top 8%</div>
                      <div className="text-xs text-muted-foreground">Global Ranking</div>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-2">Skill Distribution</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="flex items-center">
                          <Code className="h-3.5 w-3.5 mr-1 text-accent" /> Coding
                        </span>
                        <span>{profile.stats.category.code}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-accent h-1.5 rounded-full" style={{ width: `${profile.stats.category.code}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="flex items-center">
                          <Brush className="h-3.5 w-3.5 mr-1 text-primary" /> Design
                        </span>
                        <span>{profile.stats.category.design}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${profile.stats.category.design}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="flex items-center">
                          <Video className="h-3.5 w-3.5 mr-1 text-secondary" /> Video
                        </span>
                        <span>{profile.stats.category.video}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${profile.stats.category.video}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="flex items-center">
                          <Music className="h-3.5 w-3.5 mr-1 text-accent" /> Audio
                        </span>
                        <span>{profile.stats.category.audio}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-accent h-1.5 rounded-full" style={{ width: `${profile.stats.category.audio}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Featured Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.badges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {profile.badges.slice(0, 6).map((badge) => (
                        <div key={badge.id} className={`${getBadgeBackground(badge.rarity)} rounded-lg p-3 text-center flex flex-col items-center aspect-square`}>
                          <div className="p-2 rounded-full bg-background mb-2">
                            <Sparkles className="h-6 w-6 text-warning" />
                          </div>
                          <div className="font-medium text-sm">{badge.name}</div>
                          <div className="text-xs text-muted-foreground mt-auto">{badge.rarity}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground text-sm">
                        No badges earned yet.
                      </p>
                    </div>
                  )}
                  
                  <Button variant="link" className="w-full mt-2 p-0" onClick={() => setTab("badges")}>
                    View All Badges
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="submissions" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Submissions</CardTitle>
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="winning">Winning</TabsTrigger>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {profile.submissions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.submissions.map((submission) => (
                    <div key={submission.id} className="group cursor-pointer">
                      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={submission.content} 
                          alt={`Submission for ${submission.challenge.title}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                          <div className="p-3 w-full">
                            <div className="flex justify-between items-center mb-1">
                              <Badge variant="outline" className="bg-black/40 text-white border-none">
                                {getCategoryIcon(submission.challenge.type)} {submission.challenge.type}
                              </Badge>
                              {submission.id % 2 === 0 && (
                                <Badge className="bg-success text-white">Winner</Badge>
                              )}
                            </div>
                            <h4 className="font-medium text-white truncate">{submission.challenge.title}</h4>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="font-medium truncate">{submission.challenge.title}</h3>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                          <span>
                            {submission.originalityScore ? `${submission.originalityScore}/5.0` : "No rating"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isOwnProfile 
                      ? "You haven't submitted any challenges yet." 
                      : "This user hasn't submitted any challenges yet."}
                  </p>
                  {isOwnProfile && (
                    <Button>
                      Enter a Challenge
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="badges" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Badges & Achievements</CardTitle>
              <CardDescription>
                Collect badges by participating in challenges and tournaments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.badges.length > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3 flex items-center">
                      <Crown className="h-5 w-5 text-warning mr-2" /> Legendary
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {profile.badges
                        .filter(badge => badge.rarity === 'legendary')
                        .map((badge) => (
                          <div key={badge.id} className="bg-accent/20 rounded-lg p-3 text-center flex flex-col items-center">
                            <div className="p-2 rounded-full bg-background mb-2">
                              <Sparkles className="h-8 w-8 text-warning" />
                            </div>
                            <div className="font-medium">{badge.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3 flex items-center">
                      <Sparkles className="h-5 w-5 text-secondary mr-2" /> Epic
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {profile.badges
                        .filter(badge => badge.rarity === 'epic')
                        .map((badge) => (
                          <div key={badge.id} className="bg-secondary/20 rounded-lg p-3 text-center flex flex-col items-center">
                            <div className="p-2 rounded-full bg-background mb-2">
                              <Trophy className="h-8 w-8 text-secondary" />
                            </div>
                            <div className="font-medium">{badge.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3 flex items-center">
                      <Star className="h-5 w-5 text-primary mr-2" /> Rare
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {profile.badges
                        .filter(badge => badge.rarity === 'rare')
                        .map((badge) => (
                          <div key={badge.id} className="bg-primary/20 rounded-lg p-3 text-center flex flex-col items-center">
                            <div className="p-2 rounded-full bg-background mb-2">
                              <Medal className="h-8 w-8 text-primary" />
                            </div>
                            <div className="font-medium">{badge.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3 flex items-center">
                      <Check className="h-5 w-5 text-muted-foreground mr-2" /> Common
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {profile.badges
                        .filter(badge => badge.rarity === 'common')
                        .map((badge) => (
                          <div key={badge.id} className="bg-muted rounded-lg p-3 text-center flex flex-col items-center">
                            <div className="p-2 rounded-full bg-background mb-2">
                              <Star className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="font-medium">{badge.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No badges yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isOwnProfile 
                      ? "You haven't earned any badges yet. Participate in challenges to collect badges." 
                      : "This user hasn't earned any badges yet."}
                  </p>
                  {isOwnProfile && (
                    <Button>
                      Enter a Challenge
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold">{profile.wonChallenges} / {profile.totalChallenges}</div>
                    <div className="text-xs text-muted-foreground">Win / Loss Ratio</div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold">{profile.stats.winRate}%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold">{profile.stats.avgScore}</div>
                    <div className="text-xs text-muted-foreground">Avg. Score</div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold">#{profile.stats.rank}</div>
                    <div className="text-xs text-muted-foreground">Global Rank</div>
                  </div>
                </div>
                
                <h4 className="font-medium text-sm mb-3">Win Rate by Category</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="flex items-center">
                        <Code className="h-4 w-4 mr-1 text-accent" /> Coding
                      </span>
                      <span>{profile.stats.category.code}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: `${profile.stats.category.code}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="flex items-center">
                        <Brush className="h-4 w-4 mr-1 text-primary" /> Design
                      </span>
                      <span>{profile.stats.category.design}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${profile.stats.category.design}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="flex items-center">
                        <Video className="h-4 w-4 mr-1 text-secondary" /> Video
                      </span>
                      <span>{profile.stats.category.video}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: `${profile.stats.category.video}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="flex items-center">
                        <Music className="h-4 w-4 mr-1 text-accent" /> Audio
                      </span>
                      <span>{profile.stats.category.audio}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: `${profile.stats.category.audio}%` }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-primary" />
                  Match History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.matchHistory.length > 0 ? (
                  <div className="space-y-3">
                    {profile.matchHistory.slice(0, 8).map((match, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg flex items-center ${
                          match.winnerId === profile.id ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          match.winnerId === profile.id ? 'bg-success/20' : 'bg-destructive/20'
                        } mr-3`}>
                          {match.winnerId === profile.id ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <X className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            Challenge #{match.challengeId}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {new Date(match.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {match.winnerId === profile.id 
                            ? <span className="text-success">+{match.winnerEloChange} ELO</span> 
                            : <span className="text-destructive">{match.loserEloChange} ELO</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No match history</h3>
                    <p className="text-muted-foreground mb-4">
                      {isOwnProfile 
                        ? "You haven't participated in any challenges yet." 
                        : "This user hasn't participated in any challenges yet."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Participation Timeline
                </CardTitle>
                <CardDescription>
                  Activity and performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center py-12">
                  <div className="text-center max-w-md">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Timeline will be shown here</h3>
                    <p className="text-muted-foreground">
                      Visualize your performance and activity over time with challenges, wins, and ELO changes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </main>
      
      {/* Space for mobile footer */}
      {isMobile && <div className="h-16"></div>}
    </div>
  );
}
