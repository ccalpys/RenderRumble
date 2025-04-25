import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { calculateRemainingVotes } from "@/lib/utils";
import { Code, Brush, Video, Music, Trophy, Clock, Users, Star, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const isMobile = useMobile();
  
  if (!user) return null;

  const remainingVotes = calculateRemainingVotes(user);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-primary">{user.username}</span>
          </h1>
          <p className="text-muted-foreground">
            Ready to showcase your creative skills today?
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Challenges card */}
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Active Challenges</h2>
                <Badge className="bg-primary text-white">6 Live</Badge>
              </div>
              
              <div className="space-y-4 mb-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 rounded-md bg-primary/20 mr-3">
                      <Code className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">React Mini-Game</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> 38 min left
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-muted/70">
                    <Users className="h-3 w-3 mr-1" /> 24
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 rounded-md bg-accent/20 mr-3">
                      <Brush className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium">Cyberpunk Logo</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> 14 min left
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-muted/70">
                    <Users className="h-3 w-3 mr-1" /> 18
                  </Badge>
                </div>
              </div>
              
              <Button asChild className="w-full">
                <Link href="/compete">
                  <span className="flex items-center justify-center">
                    View All Challenges <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Voting card */}
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Votes</h2>
                <Badge className="bg-secondary text-white">32 Pending</Badge>
              </div>
              
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span>Daily Votes</span>
                    <span>{15 - remainingVotes.standard}/15</span>
                  </div>
                  <Progress value={(15 - remainingVotes.standard) / 15 * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span>Double Likes</span>
                    <span>{3 - remainingVotes.double}/3</span>
                  </div>
                  <Progress value={(3 - remainingVotes.double) / 3 * 100} className="h-2 [&>div]:bg-secondary" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span>Coups de Coeur</span>
                    <span>{1 - remainingVotes.special}/1</span>
                  </div>
                  <Progress value={(1 - remainingVotes.special) / 1 * 100} className="h-2 [&>div]:bg-accent" />
                </div>
              </div>
              
              <Button asChild className="w-full" variant="secondary">
                <Link href="/vote">
                  <span className="flex items-center justify-center">
                    Vote Now <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Stats card */}
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Stats</h2>
                <div className="bg-primary/20 text-primary p-1 rounded flex items-center">
                  <Star className="h-4 w-4 mr-1" /> {user.eloRating}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{user.level}</div>
                  <div className="text-xs text-muted-foreground">Level</div>
                </div>
                
                <div className="bg-muted p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">42</div>
                  <div className="text-xs text-muted-foreground">Challenges Won</div>
                </div>
                
                <div className="bg-muted p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">87</div>
                  <div className="text-xs text-muted-foreground">Challenges Completed</div>
                </div>
                
                <div className="bg-muted p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">Top 8%</div>
                  <div className="text-xs text-muted-foreground">Global Ranking</div>
                </div>
              </div>
              
              <Button asChild className="w-full" variant="outline">
                <Link href="/profile">
                  <span className="flex items-center justify-center">
                    View Profile <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent activity */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <Button variant="outline">View All</Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex p-4 bg-card rounded-lg">
              <div className="p-2 rounded-full bg-primary/20 mr-4">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">You won a challenge!</div>
                <div className="text-sm text-muted-foreground">Your "Space Portfolio" submission won against CosmicCoder. +15 ELO</div>
                <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
              </div>
            </div>
            
            <div className="flex p-4 bg-card rounded-lg">
              <div className="p-2 rounded-full bg-secondary/20 mr-4">
                <Star className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <div className="font-medium">DevMaster99 liked your submission</div>
                <div className="text-sm text-muted-foreground">Your "React Mini-Game" received a Double Like vote</div>
                <div className="text-xs text-muted-foreground mt-1">5 hours ago</div>
              </div>
            </div>
            
            <div className="flex p-4 bg-card rounded-lg">
              <div className="p-2 rounded-full bg-accent/20 mr-4">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="font-medium">Guild achievement</div>
                <div className="text-sm text-muted-foreground">Your guild "Pixel Pioneers" reached Rank #8</div>
                <div className="text-xs text-muted-foreground mt-1">Yesterday</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upcoming tournaments */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Upcoming Tournaments</h2>
            <Button variant="outline">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-l-4 border-primary">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Starts in 2 days</div>
                <h4 className="text-lg font-medium mb-2">Weekly Code Wars</h4>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">32 participants</Badge>
                  <span className="text-primary flex items-center">
                    <Trophy className="h-4 w-4 mr-1" /> 500 XP
                  </span>
                </div>
                <Button variant="link" className="w-full mt-2 p-0">Register Now</Button>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-secondary">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Starts in 5 days</div>
                <h4 className="text-lg font-medium mb-2">Design Masters Cup</h4>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">16 participants</Badge>
                  <span className="text-secondary flex items-center">
                    <Trophy className="h-4 w-4 mr-1" /> 750 XP
                  </span>
                </div>
                <Button variant="link" className="w-full mt-2 p-0">Register Now</Button>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-accent">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Starts in 1 week</div>
                <h4 className="text-lg font-medium mb-2">Creative Battle Royale</h4>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">64 participants</Badge>
                  <span className="text-accent flex items-center">
                    <Trophy className="h-4 w-4 mr-1" /> 1000 XP
                  </span>
                </div>
                <Button variant="link" className="w-full mt-2 p-0">Register Now</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Space for mobile footer */}
      {isMobile && <div className="h-16"></div>}
    </div>
  );
}
