import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { useMobile } from "@/hooks/use-mobile";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Guild, User, Challenge, MatchHistory } from "@shared/schema";
import { 
  UsersRound, Trophy, Clock, Shield, Search, Plus, Calendar, 
  ArrowRight, Star, BarChart3, Crown, TrendingUp 
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type GuildWithMembers = Guild & {
  members: User[];
  recentMatches: MatchHistory[];
};

export default function GuildPage() {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [tab, setTab] = useState<"home" | "members" | "matches" | "leaderboard">("home");
  const [createGuildDialog, setCreateGuildDialog] = useState(false);
  
  const { data: userGuild, isLoading } = useQuery<GuildWithMembers | null>({
    queryKey: ["/api/guilds/user", user?.id],
    enabled: !!user,
  });
  
  const { data: topGuilds = [] } = useQuery<Guild[]>({
    queryKey: ["/api/guilds/top"],
    enabled: !!user,
  });
  
  const { data: upcomingTournaments = [] } = useQuery<Challenge[]>({
    queryKey: ["/api/tournaments/upcoming"],
    enabled: !!user,
  });
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto md:flex">
        {/* Left Sidebar */}
        <Sidebar type="guild" />
        
        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Guild Hall</h1>
              <p className="text-muted-foreground">
                Collaborate with other creators and compete as a team
              </p>
            </div>
            
            {!userGuild && !isLoading && (
              <Button onClick={() => setCreateGuildDialog(true)} className="mt-4 md:mt-0">
                <Plus className="h-4 w-4 mr-2" /> Create Guild
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : !userGuild ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="md:col-span-2">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">You're not in a guild yet</h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-md">
                    Join forces with other creators to compete in tournaments, climb the ranks, and earn exclusive rewards.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => setCreateGuildDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Create Guild
                    </Button>
                    <Button variant="outline">
                      Browse Guilds
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-primary" />
                    Top Guilds
                  </CardTitle>
                  <CardDescription>
                    The highest-ranked guilds this season
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topGuilds.slice(0, 5).map((guild, index) => (
                      <div key={guild.id} className="flex items-center">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium mr-3">
                          {index + 1}
                        </div>
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={guild.avatarUrl || ""} />
                          <AvatarFallback>{getInitials(guild.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{guild.name}</div>
                          <div className="text-xs text-muted-foreground">ELO {guild.eloRating}</div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {guild.weeklyPoints} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="link" className="w-full mt-4 p-0">
                    View Full Leaderboard
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Upcoming Tournaments
                  </CardTitle>
                  <CardDescription>
                    Guild competitions with exclusive rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingTournaments.slice(0, 3).map((tournament) => (
                      <div key={tournament.id} className="bg-muted rounded-lg p-3 border-l-4 border-primary hover:bg-muted/80 transition-colors cursor-pointer">
                        <div className="text-xs text-muted-foreground mb-1">Starts in 2 days</div>
                        <h4 className="text-sm font-medium mb-1">{tournament.title}</h4>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground flex items-center">
                            <UsersRound className="h-3 w-3 mr-1" /> 32 guilds
                          </span>
                          <span className="text-primary flex items-center">
                            <Trophy className="h-3 w-3 mr-1" /> 1000 XP
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="link" className="w-full mt-4 p-0">
                    View All Tournaments
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <Card className="mb-6 overflow-hidden">
                <div className="relative h-32 bg-gradient-to-r from-primary via-secondary to-accent">
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end">
                    <div className="flex items-end">
                      <Avatar className="h-16 w-16 border-4 border-background">
                        <AvatarImage src={userGuild.avatarUrl || ""} />
                        <AvatarFallback className="text-lg">{getInitials(userGuild.name)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 mb-1">
                        <h2 className="text-2xl font-bold text-white">{userGuild.name}</h2>
                        <div className="flex items-center text-white/80 text-sm">
                          <Badge className="bg-background/30 border-none text-white">Rank #{8}</Badge>
                          <span className="mx-2">•</span>
                          <span className="flex items-center">
                            <UsersRound className="h-3.5 w-3.5 mr-1" />
                            {userGuild.members.length} members
                          </span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center">
                            <Star className="h-3.5 w-3.5 mr-1" />
                            ELO {userGuild.eloRating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                        <Shield className="h-4 w-4 mr-2" /> Manage
                      </Button>
                      <Button className="bg-white/20 hover:bg-white/30 text-white border-none">
                        <Plus className="h-4 w-4 mr-2" /> Invite
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <Tabs value={tab} onValueChange={(value) => setTab(value as any)}>
                    <TabsList>
                      <TabsTrigger value="home">Home</TabsTrigger>
                      <TabsTrigger value="members">Members</TabsTrigger>
                      <TabsTrigger value="matches">Matches</TabsTrigger>
                      <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </Card>
              
              {tab === "home" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Weekly Progress</CardTitle>
                      <CardDescription>Track your guild's performance this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Points towards next rank</span>
                          <span className="text-sm text-primary font-medium">
                            {userGuild.weeklyPoints}/1000
                          </span>
                        </div>
                        <Progress value={(userGuild.weeklyPoints / 1000) * 100} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-muted rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold">#{8}</div>
                          <div className="text-xs text-muted-foreground">Current Rank</div>
                        </div>
                        
                        <div className="bg-muted rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold flex items-center justify-center">
                            {userGuild.weeklyPoints} <TrendingUp className="h-4 w-4 ml-1 text-success" />
                          </div>
                          <div className="text-xs text-muted-foreground">Weekly Points</div>
                        </div>
                        
                        <div className="bg-muted rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold">{userGuild.recentMatches.length}</div>
                          <div className="text-xs text-muted-foreground">Matches This Week</div>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
                      <div className="space-y-3">
                        {userGuild.recentMatches.slice(0, 3).map((match, index) => (
                          <div key={index} className="flex p-3 bg-muted rounded-lg">
                            <div className="p-2 rounded-full bg-primary/20 mr-3">
                              <Trophy className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Guild Challenge Win</div>
                              <div className="text-sm text-muted-foreground">
                                Your guild won against "Digital Dynamos" in a coding challenge
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">2 days ago</div>
                            </div>
                            <div className="flex items-center text-success font-medium">
                              +75 pts
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button variant="link" className="mt-3 p-0">
                        View All Activity
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-primary" />
                          Upcoming Guild Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="bg-muted rounded-lg p-3 border-l-4 border-primary hover:bg-muted/80 transition-colors cursor-pointer">
                            <div className="text-xs text-muted-foreground mb-1">Tomorrow, 8PM</div>
                            <h4 className="text-sm font-medium mb-1">Weekly Coding Session</h4>
                            <div className="text-xs text-muted-foreground">
                              Practice together for the upcoming tournament
                            </div>
                          </div>
                          
                          <div className="bg-muted rounded-lg p-3 border-l-4 border-secondary hover:bg-muted/80 transition-colors cursor-pointer">
                            <div className="text-xs text-muted-foreground mb-1">Saturday, 2PM</div>
                            <h4 className="text-sm font-medium mb-1">Guild vs Guild Battle</h4>
                            <div className="text-xs text-muted-foreground">
                              Friendly match against "Code Warriors"
                            </div>
                          </div>
                        </div>
                        
                        <Button variant="link" className="w-full mt-3 p-0">
                          See Full Calendar
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Crown className="h-5 w-5 mr-2 text-warning" />
                          Top Contributors
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {userGuild.members.slice(0, 3).map((member, index) => (
                            <div key={member.id} className="flex items-center">
                              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium mr-3">
                                {index + 1}
                              </div>
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage src={member.avatarUrl || ""} />
                                <AvatarFallback>{getInitials(member.username)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-medium">{member.username}</div>
                                <div className="text-xs text-muted-foreground">{member.eloRating} ELO</div>
                              </div>
                              <Badge variant="outline" className="ml-2">
                                120 pts
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              
              {tab === "members" && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Guild Members</CardTitle>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input placeholder="Search members..." className="pl-10" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userGuild.members.map((member, index) => (
                        <div key={member.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={member.avatarUrl || ""} />
                              <AvatarFallback>{getInitials(member.username)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center">
                                {member.username}
                                {index === 0 && (
                                  <Badge variant="outline" className="ml-2 bg-warning/20 text-warning border-none">
                                    <Crown className="h-3 w-3 mr-1" /> Guild Leader
                                  </Badge>
                                )}
                                {index === 1 && (
                                  <Badge variant="outline" className="ml-2 bg-primary/20 text-primary border-none">
                                    <Shield className="h-3 w-3 mr-1" /> Officer
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <span className="flex items-center">
                                  <Star className="h-3.5 w-3.5 mr-1 text-warning" />
                                  {member.eloRating} ELO
                                </span>
                                <span className="mx-2">•</span>
                                <span>Joined 2 months ago</span>
                              </div>
                            </div>
                          </div>
                          <Link href={`/profile/${member.id}`}>
                            <Button variant="ghost" size="sm" className="flex items-center">
                              View Profile <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {tab === "matches" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Match History</CardTitle>
                    <CardDescription>
                      Recent battles and tournament results for your guild
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userGuild.recentMatches.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No matches yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Your guild hasn't participated in any matches yet.
                          </p>
                          <Button>
                            Find Matches
                          </Button>
                        </div>
                      ) : (
                        userGuild.recentMatches.map((match, index) => (
                          <div key={index} className="bg-muted rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <Badge variant="outline" className="mb-2">
                                  {match.challengeId} Challenge
                                </Badge>
                                <h4 className="font-medium">Space-themed Logo Design</h4>
                              </div>
                              <Badge className="bg-success text-white">Victory</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10 mr-3 border-2 border-primary">
                                  <AvatarImage src={userGuild.avatarUrl || ""} />
                                  <AvatarFallback>{getInitials(userGuild.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{userGuild.name}</div>
                                  <div className="text-xs text-success">+15 ELO</div>
                                </div>
                              </div>
                              
                              <div className="font-bold text-xl">VS</div>
                              
                              <div className="flex items-center">
                                <div className="text-right mr-3">
                                  <div className="font-medium">Digital Dynamos</div>
                                  <div className="text-xs text-destructive">-15 ELO</div>
                                </div>
                                <Avatar className="h-10 w-10 border-2 border-muted">
                                  <AvatarFallback>DD</AvatarFallback>
                                </Avatar>
                              </div>
                            </div>
                            
                            <div className="mt-3 text-xs text-muted-foreground">
                              Completed on {new Date(match.completedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {tab === "leaderboard" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Guild Leaderboard</CardTitle>
                      <CardDescription>
                        Track your guild's ranking among all guilds
                      </CardDescription>
                    </div>
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topGuilds.slice(0, 10).map((guild, index) => (
                        <div key={guild.id} className={`flex items-center p-3 rounded-lg ${guild.id === userGuild.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'}`}>
                          <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted text-xs font-medium mr-3">
                            {index + 1}
                          </div>
                          <Avatar className="h-9 w-9 mr-3">
                            <AvatarImage src={guild.avatarUrl || ""} />
                            <AvatarFallback>{getInitials(guild.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium flex items-center">
                              {guild.name}
                              {guild.id === userGuild.id && (
                                <Badge variant="outline" className="ml-2 bg-primary/20 text-primary border-none">
                                  Your Guild
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <Star className="h-3.5 w-3.5 inline mr-1 text-warning" />
                              {guild.eloRating} ELO · {guild.weeklyPoints} weekly points
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            Rank #{index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Create Guild Dialog */}
      <Dialog open={createGuildDialog} onOpenChange={setCreateGuildDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create a Guild</DialogTitle>
            <DialogDescription>
              Form a team of creators and compete together in challenges and tournaments
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Guild Name</label>
              <Input placeholder="Enter a name for your guild" />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea 
                placeholder="Describe your guild's mission and focus..." 
                className="w-full min-h-[100px] px-3 py-2 border border-muted rounded-md bg-background"
              ></textarea>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Focus Areas</label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  <Code className="h-3.5 w-3.5 mr-1" /> Coding
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  <Brush className="h-3.5 w-3.5 mr-1" /> Design
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  <Video className="h-3.5 w-3.5 mr-1" /> Video
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  <Music className="h-3.5 w-3.5 mr-1" /> Audio
                </Badge>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateGuildDialog(false)}>Cancel</Button>
            <Button>Create Guild</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Space for mobile footer */}
      {isMobile && <div className="h-16"></div>}
    </div>
  );
}
