import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Team } from "@shared/schema";
import { getInitials } from "@/lib/utils";
import { Maximize2, Star } from "lucide-react";

type CompetitorCardProps = {
  competitor: {
    type: 'user' | 'team';
    data: User | Team;
    rating?: number;
    wins?: number;
    members?: User[];
  };
  submission: {
    contentUrl: string;
    previewUrl: string;
  };
  onFullscreen: () => void;
  gradient?: string;
}

const CompetitorCard = ({ competitor, submission, onFullscreen, gradient = "primary" }: CompetitorCardProps) => {
  const isTeam = competitor.type === 'team';
  const data = competitor.data;
  
  const getGradientClass = () => {
    switch(gradient) {
      case 'primary': return 'border-primary';
      case 'secondary': return 'border-secondary';
      case 'accent': return 'border-accent';
      default: return 'border-primary';
    }
  };
  
  return (
    <div className="bg-card rounded-lg overflow-hidden gradient-border">
      <div className="p-3 bg-muted flex justify-between items-center">
        {isTeam ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-primary">{(data as Team).name}</div>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-muted/70 flex items-center">
                  <Star className="h-3.5 w-3.5 mr-1 text-warning" />
                  {competitor.rating ?? '4.8'}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="flex -space-x-2">
                {competitor.members && competitor.members.slice(0, 2).map((member, index) => (
                  <Avatar key={index} className={`h-6 w-6 border ${getGradientClass()} z-${20 - index * 10}`}>
                    <AvatarImage src={member.avatarUrl || ""} />
                    <AvatarFallback>{getInitials(member.username)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                <div>
                  {competitor.members
                    ? competitor.members.slice(0, 2).map(m => m.username).join(' & ')
                    : 'Team Members'}
                </div>
                <div>Avg. ELO <span className="text-primary">{competitor.rating ?? '1890'}</span></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <Avatar className={`h-8 w-8 mr-2 border ${getGradientClass()}`}>
              <AvatarImage src={(data as User).avatarUrl || ""} />
              <AvatarFallback>{getInitials((data as User).username)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{(data as User).username}</div>
              <div className="text-xs text-muted-foreground">
                <span className="text-primary">ELO {(data as User).eloRating ?? 1000}</span> · {competitor.wins ?? 0} wins
              </div>
            </div>
          </div>
        )}
        
        {!isTeam && (
          <div className="flex items-center">
            <Badge variant="outline" className="bg-muted/70 flex items-center">
              <Star className="h-3.5 w-3.5 mr-1 text-warning" />
              {competitor.rating ?? '4.8'}
            </Badge>
          </div>
        )}
      </div>
      
      <div className="relative">
        <div className="h-60 md:h-72 bg-background overflow-auto">
          <img 
            src={submission.previewUrl} 
            alt={`${isTeam ? (data as Team).name : (data as User).username}'s submission`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-3 right-3">
          <Button 
            variant="secondary" 
            size="icon" 
            className="bg-card/80 hover:bg-muted/80" 
            onClick={onFullscreen}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompetitorCard;
