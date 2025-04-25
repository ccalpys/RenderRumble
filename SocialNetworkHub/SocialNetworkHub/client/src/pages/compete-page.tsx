import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChallengeCard from "@/components/challenge-card";
import { Challenge } from "@shared/schema";
import { 
  Code, Brush, Video, Music, Plus, Search, Timer, Calendar, CheckCircle, 
  Circle, Filter, ChevronDown, ArrowUpRight 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CompetePage() {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [tab, setTab] = useState<"active" | "upcoming" | "completed">("active");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: challenges = [], isLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges", tab, selectedCategory, searchQuery],
  });
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  const getTabLabel = (tabName: string) => {
    switch (tabName) {
      case "active":
        return (
          <div className="flex items-center">
            <Timer className="h-4 w-4 mr-1" />
            <span>Live Challenges</span>
          </div>
        );
      case "upcoming":
        return (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Upcoming</span>
          </div>
        );
      case "completed":
        return (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Completed</span>
          </div>
        );
      default:
        return tabName;
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "CODE":
        return <Code className="h-4 w-4 mr-1" />;
      case "DESIGN":
        return <Brush className="h-4 w-4 mr-1" />;
      case "VIDEO":
        return <Video className="h-4 w-4 mr-1" />;
      case "AUDIO":
        return <Music className="h-4 w-4 mr-1" />;
      default:
        return <Circle className="h-4 w-4 mr-1" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Creative Challenges</h1>
            <p className="text-muted-foreground">
              Compete in real-time challenges and showcase your creative skills
            </p>
          </div>
          
          <Button onClick={() => setDialogOpen(true)} className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" /> Create Challenge
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search challenges..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {selectedCategory === "all" ? "All Categories" : selectedCategory}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuCheckboxItem
                  checked={selectedCategory === "all"}
                  onCheckedChange={() => handleCategoryChange("all")}
                >
                  <Circle className="h-4 w-4 mr-2" /> All Categories
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedCategory === "CODE"}
                  onCheckedChange={() => handleCategoryChange("CODE")}
                >
                  <Code className="h-4 w-4 mr-2 text-accent" /> Coding
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedCategory === "DESIGN"}
                  onCheckedChange={() => handleCategoryChange("DESIGN")}
                >
                  <Brush className="h-4 w-4 mr-2 text-primary" /> Design
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedCategory === "VIDEO"}
                  onCheckedChange={() => handleCategoryChange("VIDEO")}
                >
                  <Video className="h-4 w-4 mr-2 text-secondary" /> Video
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedCategory === "AUDIO"}
                  onCheckedChange={() => handleCategoryChange("AUDIO")}
                >
                  <Music className="h-4 w-4 mr-2 text-accent" /> Audio
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Tabs value={tab} onValueChange={(value) => setTab(value as any)} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="active">{getTabLabel("active")}</TabsTrigger>
            <TabsTrigger value="upcoming">{getTabLabel("upcoming")}</TabsTrigger>
            <TabsTrigger value="completed">{getTabLabel("completed")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : challenges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Timer className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No active challenges</h3>
                  <p className="text-muted-foreground mb-4 text-center max-w-md">
                    There are currently no active challenges. Check back later or create your own challenge.
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Create Challenge
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="group cursor-pointer">
                    <ChallengeCard 
                      challenge={challenge}
                      isActive={true}
                      timeLeft="38 min"
                      participantCount={24}
                    />
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button className="w-full">
                        Join Challenge <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : challenges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No upcoming challenges</h3>
                  <p className="text-muted-foreground mb-4 text-center max-w-md">
                    There are currently no upcoming challenges scheduled. Check back later or create your own.
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Create Challenge
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="group cursor-pointer">
                    <ChallengeCard 
                      challenge={challenge}
                      isActive={false}
                      timeLeft="Starts in 2 days"
                      participantCount={16}
                    />
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" className="w-full">
                        Get Notified <Calendar className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : challenges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No completed challenges</h3>
                  <p className="text-muted-foreground mb-4 text-center max-w-md">
                    You haven't participated in any challenges yet. Join a challenge to start building your portfolio.
                  </p>
                  <Button variant="outline" onClick={() => setTab("active")}>
                    Explore Active Challenges
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="group cursor-pointer">
                    <ChallengeCard 
                      challenge={challenge}
                      isActive={false}
                      participantCount={42}
                    />
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" className="w-full">
                        View Results
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Create Challenge Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create a New Challenge</DialogTitle>
            <DialogDescription>
              Set up your creative challenge and invite other creators to compete
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Challenge Title</label>
                <Input placeholder="E.g., Space Themed Portfolio Page" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="flex items-center justify-start">
                    <Code className="h-4 w-4 mr-2 text-accent" /> Coding
                  </Button>
                  <Button variant="outline" className="flex items-center justify-start">
                    <Brush className="h-4 w-4 mr-2 text-primary" /> Design
                  </Button>
                  <Button variant="outline" className="flex items-center justify-start">
                    <Video className="h-4 w-4 mr-2 text-secondary" /> Video
                  </Button>
                  <Button variant="outline" className="flex items-center justify-start">
                    <Music className="h-4 w-4 mr-2 text-accent" /> Audio
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Format</label>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" className="flex items-center justify-start">
                    <Badge className="mr-2 bg-primary/20 text-primary border-none">1v1</Badge> 
                    One vs One
                  </Button>
                  <Button variant="outline" className="flex items-center justify-start">
                    <Badge className="mr-2 bg-secondary/20 text-secondary border-none">2v2</Badge> 
                    Team Battle
                  </Button>
                  <Button variant="outline" className="flex items-center justify-start">
                    <Badge className="mr-2 bg-accent/20 text-accent border-none">BR</Badge> 
                    Battle Royale
                  </Button>
                </div>
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Challenge Description</label>
                <textarea 
                  placeholder="Describe the challenge in detail..." 
                  className="w-full min-h-[100px] px-3 py-2 border border-muted rounded-md bg-background"
                ></textarea>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                <Input type="number" min="5" placeholder="45" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <Input placeholder="E.g., HTML, CSS, SpaceTheme" />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button>Create Challenge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Space for mobile footer */}
      {isMobile && <div className="h-16"></div>}
    </div>
  );
}
