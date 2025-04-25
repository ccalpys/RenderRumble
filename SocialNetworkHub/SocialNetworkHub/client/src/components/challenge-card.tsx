import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "@/lib/utils";
import { Clock, Users, MoreHorizontal, Code, Brush, Video, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Challenge, challengeTypeEnum } from "@shared/schema";

type ChallengeCardProps = {
  challenge: Challenge;
  isActive?: boolean;
  isLive?: boolean;
  timeLeft?: string;
  participantCount?: number;
  onMoreClick?: () => void;
}

const ChallengeCard = ({ 
  challenge, 
  isActive = true,
  isLive = false,
  timeLeft,
  participantCount = 0,
  onMoreClick 
}: ChallengeCardProps) => {
  const getCategoryIcon = (type: string) => {
    switch(type) {
      case 'CODE':
        return <Code className="h-3.5 w-3.5 mr-1 text-accent" />;
      case 'DESIGN':
        return <Brush className="h-3.5 w-3.5 mr-1 text-accent" />;
      case 'VIDEO':
        return <Video className="h-3.5 w-3.5 mr-1 text-accent" />;
      case 'AUDIO':
        return <Music className="h-3.5 w-3.5 mr-1 text-accent" />;
      default:
        return <Code className="h-3.5 w-3.5 mr-1 text-accent" />;
    }
  };

  const getFormatLabel = (format: string) => {
    switch(format) {
      case 'ONE_VS_ONE':
        return '#1v1';
      case 'TEAM_VS_TEAM':
        return '#2v2';
      case 'BATTLE_ROYALE':
        return '#Battle';
      default:
        return '#1v1';
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-3">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <div className="text-lg font-bold">
              <span className="text-primary">{getFormatLabel(challenge.format)}</span>{" "}
              <span className="text-foreground">Challenge</span>
            </div>
            <Badge variant="outline" className="ml-2 bg-muted flex items-center text-xs">
              {getCategoryIcon(challenge.type)}
              <span>{challenge.type.charAt(0) + challenge.type.slice(1).toLowerCase()}</span>
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onMoreClick}>
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        
        <div className="mb-3">
          <h3 className="text-xl font-semibold mb-1">{challenge.title}</h3>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        </div>
        
        {challenge.tags && challenge.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {challenge.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-muted text-muted-foreground">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {isActive 
              ? `${timeLeft ? `${timeLeft} left` : `${challenge.duration} minutes`}`
              : `Completed ${challenge.endsAt ? formatDistanceToNow(challenge.endsAt) : 'recently'}`
            }
          </div>
          <div className="text-muted-foreground flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {participantCount} participants
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;
