import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import VoteCard from "@/components/vote-card";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Brush, Video, Music } from "lucide-react";

export default function VotePage() {
  const isMobile = useMobile();
  const [activeCategory, setActiveCategory] = useState<"CODE" | "DESIGN" | "VIDEO" | "AUDIO">("CODE");
  
  const { data: challenges = [], isLoading } = useQuery<Array<{id: number}>>({
    queryKey: ["/api/challenges/active", activeCategory],
  });
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto md:flex">
        {/* Left Sidebar */}
        <Sidebar type="vote" />
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile category tabs */}
          {isMobile && (
            <div className="overflow-x-auto whitespace-nowrap py-2 px-4 bg-card border-b border-muted">
              <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as any)}>
                <TabsList className="bg-transparent">
                  <TabsTrigger value="CODE" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
                    <Code className="h-4 w-4 mr-1 text-accent" /> 
                    Coding
                  </TabsTrigger>
                  <TabsTrigger value="DESIGN" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
                    <Brush className="h-4 w-4 mr-1 text-primary" /> 
                    Design
                  </TabsTrigger>
                  <TabsTrigger value="VIDEO" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
                    <Video className="h-4 w-4 mr-1 text-primary" /> 
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="AUDIO" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
                    <Music className="h-4 w-4 mr-1 text-primary" /> 
                    Audio
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
          
          {/* Vote Card Section (TikTok-like) */}
          <div className="h-[calc(100vh-4rem)] overflow-y-auto scroll-snap-y px-4 py-4 md:py-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : challenges.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-xl font-medium mb-2">No challenges to vote on</h3>
                <p className="text-muted-foreground mb-4">There are currently no completed challenges in this category</p>
                <Button onClick={() => setActiveCategory("DESIGN")} variant="outline">
                  Try another category
                </Button>
              </div>
            ) : (
              challenges.map((challenge) => (
                <VoteCard key={challenge.id} challengeId={challenge.id} />
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Space for mobile footer */}
      {isMobile && <div className="h-16"></div>}
    </div>
  );
}
