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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { 
  Trophy, Medal, Code, Brush, Video, Music, Search, ArrowUp, ArrowDown, 
  Medal as MedalIcon, TrendingUp, ChevronRight, Star, Shield
} from "lucide-react";
import { User, Team, Guild } from "@shared/schema";
import { getInitials } from "@/lib/utils";

type RankedUser = User & {
  rank: number;
  rankChange: number;
  wins: number;
  losses: number;
  category?: string;
};

type RankedEntity = {
  id: number;
  rank: number;
  rankChange: number;
  name: string;
  avatarUrl?: string;
  rating: number;
  wins: number;
  losses: number;
  type: 'user' | 'team' | 'guild';
  members?: number;
  category?: string;
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [tab, setTab] = useState<"users" | "teams" | "guilds">("users");
  const [category, setCategory] = useState<"all" | "code" | "design" | "video" | "audio">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: rankedEntities = [], isLoading } = useQuery<RankedEntity[]>({
    queryKey: ["/api/leaderboard", tab, category, searchQuery],
  });
  
  const { data: currentUserRank } = useQuery<RankedUser>({
    queryKey: ["/api/leaderboard/user", user?.id],
    enabled: !!user,
  });
  
  const renderRankChange = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-success text-xs">
          <TrendingUp className="h-3 w-3 mr-0.5" /> {change}
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-destructive text-xs">
          <ArrowDown className="h-3 w-3 mr-0.5" /> {Math.abs(change)}
        </div>
      );
    } else {
      return <div className="text-muted-foreground text-xs">—</div>;
    }
  };
  
  const getCategoryIcon = (categoryName?: string) => {
    switch (categoryName?.toLowerCase()) {
      case "code":
        return <Code className="h-4 w-4 text-accent" />;
      case "design":
        return <Brush className="h-4 w-4 text-primary" />;
      case "video":
        return <Video className="h-4 w-4 text-secondary" />;
      case "audio":
        return <Music className="h-4 w-4 text-accent" />;
      default:
        return null;
    }
  };
  
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Trophy className="h-5 w-5 text-warning" />;
    } else if (rank === 2) {
      return <MedalIcon className="h-5 w-5 text-secondary" />;
    } else if (rank === 3) {
      return <MedalIcon className="h-5 w-5 text-accent" />;
    } else {
      return (
        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
          {rank}
        </div>
      );
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto md:flex">
        {/* Left Sidebar */}
        <Sidebar type="leaderboard" />
        
        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Leaderboards</h1>
              <p className="text-muted-foreground">
                See who's leading the creative competition
              </p>
            </div>
          </div>
          
          {currentUserRank && (
            <Card className="mb-6 bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex items-center flex-1">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium mr-3">
                      {currentUserRank.rank}
                    </div>
                    <Avatar className="h-10 w-10 mr-3 border-2 border-primary">
                      <AvatarImage src={currentUserRank.avatarUrl || ""} />
                      <AvatarFallback>{getInitials(currentUserRank.username)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{currentUserRank.username}</div>
                      <div className="text-xs text-muted-foreground">
                        Your current ranking
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-warning mr-1" />
                      <span className="font-bold">{currentUserRank.eloRating}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {currentUserRank.wins} wins · {currentUserRank.losses} losses
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Tabs value={tab} onValueChange={(value) => setTab(value as any)} className="flex-1">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="users">Creators</TabsTrigger>
                <TabsTrigger value="teams">Teams</TabsTrigger>
                <TabsTrigger value="guilds">Guilds</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Tabs value={category} onValueChange={(value) => setCategory(value as any)} className="flex-1">
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-1">
                  <Code className="h-3.5 w-3.5" /> Code
                </TabsTrigger>
                <TabsTrigger value="design" className="flex items-center gap-1">
                  <Brush className="h-3.5 w-3.5" /> Design
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-1">
                  <Video className="h-3.5 w-3.5" /> Video
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-1">
                  <Music className="h-3.5 w-3.5" /> Audio
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={`Search ${tab}...`}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : rankedEntities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4 text-center max-w-md">
                  {searchQuery 
                    ? `No ${tab} match your search criteria.` 
                    : `There are no ranked ${tab} in this category yet.`}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Rank</TableHead>
                    <TableHead>{tab === "users" ? "Creator" : tab === "teams" ? "Team" : "Guild"}</TableHead>
                    <TableHead className="text-right">ELO</TableHead>
                    <TableHead className="text-right">W/L</TableHead>
                    {category === "all" && <TableHead className="text-right">Category</TableHead>}
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankedEntities.map((entity) => (
                    <TableRow key={`${entity.type}-${entity.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {getRankBadge(entity.rank)}
                          <div className="ml-2">{renderRankChange(entity.rankChange)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={entity.avatarUrl || ""} />
                            <AvatarFallback>{getInitials(entity.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{entity.name}</div>
                            {entity.type === "team" && (
                              <div className="text-xs text-muted-foreground">
                                {entity.members} members
                              </div>
                            )}
                            {entity.type === "guild" && (
                              <div className="text-xs text-muted-foreground">
                                {entity.members} members
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">{entity.rating}</TableCell>
                      <TableCell className="text-right">
                        {entity.wins}W / {entity.losses}L
                      </TableCell>
                      {category === "all" && (
                        <TableCell className="text-right">
                          {entity.category && (
                            <Badge variant="outline" className="flex items-center gap-1 ml-auto w-fit">
                              {getCategoryIcon(entity.category)}
                              <span>{entity.category}</span>
                            </Badge>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <Link href={`/profile/${entity.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>
      
      {/* Space for mobile footer */}
      {isMobile && <div className="h-16"></div>}
    </div>
  );
}
