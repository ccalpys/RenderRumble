import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { calculateRemainingVotes } from "@/lib/utils";
import { Code, Brush, Video, Music, Star, Clock, Users, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type SidebarProps = {
  type: 'vote' | 'leaderboard' | 'guild';
}

const Sidebar = ({ type }: SidebarProps) => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const remainingVotes = calculateRemainingVotes(user);
  
  return (
    <aside className="hidden md:block w-64 p-4 bg-card border-r border-muted min-h-[calc(100vh-4rem)]">
      {type === 'vote' && (
        <>
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2 text-foreground">Categories</h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-between">
                <span className="flex items-center">
                  <Code className="h-4 w-4 mr-2 text-accent" /> 
                  Coding
                </span>
                <Badge variant="outline" className="ml-2 bg-muted">24</Badge>
              </Button>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center">
                  <Brush className="h-4 w-4 mr-2 text-primary" /> 
                  Design
                </span>
                <Badge variant="outline" className="ml-2 bg-muted/50">18</Badge>
              </Button>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center">
                  <Video className="h-4 w-4 mr-2 text-primary" /> 
                  Video
                </span>
                <Badge variant="outline" className="ml-2 bg-muted/50">7</Badge>
              </Button>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center">
                  <Music className="h-4 w-4 mr-2 text-primary" /> 
                  Audio
                </span>
                <Badge variant="outline" className="ml-2 bg-muted/50">5</Badge>
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2 text-foreground">Your Stats</h3>
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Daily Votes</span>
                <span className="text-xs text-foreground">{15 - remainingVotes.standard}/15</span>
              </div>
              <Progress value={(15 - remainingVotes.standard) / 15 * 100} className="h-1.5 mb-3" />
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Double Likes</span>
                <span className="text-xs text-foreground">{3 - remainingVotes.double}/3</span>
              </div>
              <Progress value={(3 - remainingVotes.double) / 3 * 100} className="h-1.5 mb-3 bg-muted-foreground [&>div]:bg-secondary" />
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Coups de Coeur</span>
                <span className="text-xs text-foreground">{1 - remainingVotes.special}/1</span>
              </div>
              <Progress value={(1 - remainingVotes.special) / 1 * 100} className="h-1.5 mb-3 bg-muted-foreground [&>div]:bg-accent" />
            </div>
            
            <div className="mt-4 bg-muted rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Your ELO</span>
                <div className="flex items-center text-green-400 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                  +12
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold mr-2">{user.eloRating}</span>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-none">
                  Top 8%
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2 text-foreground">Live Competitions</h3>
            <div className="space-y-3">
              <div className="bg-muted rounded-lg p-3 border-l-4 border-warning">
                <div className="flex justify-between mb-1">
                  <Badge variant="outline" className="bg-transparent text-warning border-warning">ENDING SOON</Badge>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> 14 min left
                  </span>
                </div>
                <h4 className="text-sm font-medium mb-1">Cyberpunk Logo Design</h4>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  18 participants
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-3 border-l-4 border-primary">
                <div className="flex justify-between mb-1">
                  <Badge variant="outline" className="bg-transparent text-primary border-primary">ONGOING</Badge>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> 38 min left
                  </span>
                </div>
                <h4 className="text-sm font-medium mb-1">React Mini-Game Hackathon</h4>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  24 participants
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {type === 'leaderboard' && (
        <div className="mb-6">
          <h3 className="font-medium text-lg mb-4 text-foreground">Top Creators</h3>
          <div className="space-y-3">
            <div className="flex items-center p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-2">
                1
              </div>
              <Avatar className="h-8 w-8 mr-2 border border-primary">
                <AvatarImage src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&auto=format&fit=crop&q=60" />
                <AvatarFallback>DM</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">DevMaster99</div>
                <div className="text-xs text-muted-foreground">ELO 2156 · 124 wins</div>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-muted/70 flex items-center text-warning border-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 7L21 7" />
                    <path d="M3 7L9 7" />
                    <path d="M3 17L13 17" />
                    <path d="M17 17L21 17" />
                    <path d="M13 7L13 13L9 17" />
                  </svg>
                  3
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-secondary text-white text-xs font-bold mr-2">
                2
              </div>
              <Avatar className="h-8 w-8 mr-2 border border-secondary">
                <AvatarImage src="https://images.unsplash.com/photo-1614644147724-2d4785d69962?w=150&h=150&auto=format&fit=crop&q=60" />
                <AvatarFallback>PQ</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">PixelQueen</div>
                <div className="text-xs text-muted-foreground">ELO 2130 · 118 wins</div>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-muted/70 flex items-center text-destructive border-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 17L21 17" />
                    <path d="M3 17L9 17" />
                    <path d="M3 7L13 7" />
                    <path d="M17 7L21 7" />
                    <path d="M13 17L13 11L9 7" />
                  </svg>
                  1
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-accent text-white text-xs font-bold mr-2">
                3
              </div>
              <Avatar className="h-8 w-8 mr-2 border border-accent">
                <AvatarImage src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&auto=format&fit=crop&q=60" />
                <AvatarFallback>CA</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">CodeArtisan</div>
                <div className="text-xs text-muted-foreground">ELO 2054 · 97 wins</div>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-muted/70 flex items-center text-warning border-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 7L21 7" />
                    <path d="M3 7L9 7" />
                    <path d="M3 17L13 17" />
                    <path d="M17 17L21 17" />
                    <path d="M13 7L13 13L9 17" />
                  </svg>
                  5
                </Badge>
              </div>
            </div>
            
            <Button variant="link" className="w-full text-primary">
              View full leaderboard
            </Button>
          </div>
        </div>
      )}
      
      {type === 'guild' && (
        <div className="mb-6">
          <h3 className="font-medium text-lg mb-4 text-foreground">Your Guild</h3>
          <div className="bg-muted rounded-lg p-4 border border-muted">
            <div className="flex justify-between items-center mb-3">
              <div className="font-bold text-primary text-lg">Pixel Pioneers</div>
              <Badge variant="outline" className="bg-muted/50">Rank #8</Badge>
            </div>
            <div className="flex items-center mb-3">
              <div className="flex -space-x-2 mr-2">
                <Avatar className="h-6 w-6 border border-primary z-30">
                  <AvatarImage src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&auto=format&fit=crop&q=60" />
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6 border border-primary z-20">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&auto=format&fit=crop&q=60" />
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6 border border-primary z-10">
                  <AvatarImage src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&auto=format&fit=crop&q=60" />
                  <AvatarFallback>U3</AvatarFallback>
                </Avatar>
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-muted border border-primary text-xs font-medium z-0">
                  +4
                </div>
              </div>
              <div className="text-xs text-muted-foreground">7 members</div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Weekly Points</span>
                <span className="text-xs text-primary font-medium">586/1000</span>
              </div>
              <Progress value={58.6} className="h-1.5" />
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" className="flex-1 h-9">
                Guild Hall
              </Button>
              <Button variant="outline" className="flex-1 h-9">
                Matches
              </Button>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <h3 className="font-medium text-lg mb-4 text-foreground">Upcoming Tournaments</h3>
          <div className="space-y-3">
            <div className="bg-muted rounded-lg p-3 border-l-4 border-primary hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="text-xs text-muted-foreground mb-1">Starts in 2 days</div>
              <h4 className="text-sm font-medium mb-1">Weekly Code Wars</h4>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">32 participants</span>
                <span className="text-primary flex items-center">
                  <Trophy className="h-3 w-3 mr-1" /> 500 XP
                </span>
              </div>
            </div>
            
            <div className="bg-muted rounded-lg p-3 border-l-4 border-secondary hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="text-xs text-muted-foreground mb-1">Starts in 5 days</div>
              <h4 className="text-sm font-medium mb-1">Design Masters Cup</h4>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">16 participants</span>
                <span className="text-secondary flex items-center">
                  <Trophy className="h-3 w-3 mr-1" /> 750 XP
                </span>
              </div>
            </div>
            
            <div className="bg-muted rounded-lg p-3 border-l-4 border-accent hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="text-xs text-muted-foreground mb-1">Starts in 1 week</div>
              <h4 className="text-sm font-medium mb-1">Creative Battle Royale</h4>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">64 participants</span>
                <span className="text-accent flex items-center">
                  <Trophy className="h-3 w-3 mr-1" /> 1000 XP
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
