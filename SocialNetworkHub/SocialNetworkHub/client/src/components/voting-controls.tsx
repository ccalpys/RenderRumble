import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { calculateRemainingVotes } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heart, Diamond, Sparkles, Users } from "lucide-react";

type VotingControlsProps = {
  submissionId1: number;
  submissionId2: number;
  competitor1: string;
  competitor2: string;
  voteCounts: {
    competitor1: number;
    competitor2: number;
    total: number;
  };
};

const VotingControls = ({
  submissionId1,
  submissionId2,
  competitor1,
  competitor2,
  voteCounts,
}: VotingControlsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  const [selectedVoteType, setSelectedVoteType] = useState<'STANDARD' | 'DOUBLE' | 'SPECIAL' | null>(null);
  
  const competitor1Percentage = voteCounts.total === 0 
    ? 50 
    : Math.round((voteCounts.competitor1 / voteCounts.total) * 100);
  
  const competitor2Percentage = voteCounts.total === 0 
    ? 50 
    : Math.round((voteCounts.competitor2 / voteCounts.total) * 100);
  
  const remainingVotes = calculateRemainingVotes(user);
  
  const voteMutation = useMutation({
    mutationFn: async ({ submissionId, voteType }: { submissionId: number, voteType: string }) => {
      await apiRequest("POST", "/api/votes", { submissionId, voteType });
    },
    onSuccess: () => {
      toast({
        title: "Vote submitted!",
        description: `Your ${selectedVoteType?.toLowerCase()} vote has been recorded.`,
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/votes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      setSelectedSubmission(null);
      setSelectedVoteType(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit vote",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleVote = (submissionId: number, voteType: 'STANDARD' | 'DOUBLE' | 'SPECIAL') => {
    if (!user) return;
    
    // Check if user has votes remaining
    if (
      (voteType === 'STANDARD' && remainingVotes.standard <= 0) ||
      (voteType === 'DOUBLE' && remainingVotes.double <= 0) ||
      (voteType === 'SPECIAL' && remainingVotes.special <= 0)
    ) {
      toast({
        title: "No votes remaining",
        description: `You've used all your ${voteType.toLowerCase()} votes for today.`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedSubmission(submissionId);
    setSelectedVoteType(voteType);
    voteMutation.mutate({ submissionId, voteType });
  };
  
  const getVoteButtonState = (submissionId: number, voteType: 'STANDARD' | 'DOUBLE' | 'SPECIAL') => {
    const isLoading = voteMutation.isPending && selectedSubmission === submissionId && selectedVoteType === voteType;
    const isDisabled = voteMutation.isPending;
    
    let className = "flex flex-col items-center p-2 rounded-lg transition-colors";
    
    if (isLoading) {
      className += " opacity-70 cursor-not-allowed";
    } else {
      className += " hover:bg-muted/80";
    }
    
    if (selectedSubmission === submissionId && selectedVoteType === voteType && !isLoading) {
      className += " bg-muted";
    } else {
      className += " bg-muted/50";
    }
    
    return { className, isDisabled, isLoading };
  };
  
  return (
    <div className="bg-card rounded-lg p-4">
      <div className="flex justify-between mb-4 items-center">
        <div className="font-medium text-lg">Cast Your Vote</div>
        <div className="text-muted-foreground text-sm flex items-center">
          <Users className="h-4 w-4 mr-1" />
          <span>{voteCounts.total} people voted</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-4 bg-muted rounded-full mb-2 overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-primary" 
          style={{ width: `${competitor1Percentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between mb-6 text-sm">
        <div className="text-muted-foreground">
          <span className="font-medium">{competitor1}</span>{" "}
          <span className="text-primary font-bold">{competitor1Percentage}%</span>
        </div>
        <div className="text-muted-foreground">
          <span className="text-secondary font-bold">{competitor2Percentage}%</span>{" "}
          <span className="font-medium">{competitor2}</span>
        </div>
      </div>
      
      {/* Vote Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col items-center">
          <div className="text-sm mb-2 text-muted-foreground">{competitor1}</div>
          <div className="flex space-x-2">
            {/* Standard Like */}
            <button
              className={getVoteButtonState(submissionId1, 'STANDARD').className}
              disabled={getVoteButtonState(submissionId1, 'STANDARD').isDisabled}
              onClick={() => handleVote(submissionId1, 'STANDARD')}
            >
              <Heart className={`h-6 w-6 ${selectedSubmission === submissionId1 && selectedVoteType === 'STANDARD' ? 'fill-current' : ''}`} />
              <span className="text-xs mt-1">Like</span>
            </button>
            
            {/* Double Like */}
            <button
              className={getVoteButtonState(submissionId1, 'DOUBLE').className}
              disabled={getVoteButtonState(submissionId1, 'DOUBLE').isDisabled}
              onClick={() => handleVote(submissionId1, 'DOUBLE')}
            >
              <Diamond className="h-6 w-6 text-secondary" />
              <span className="text-xs mt-1 text-secondary">
                Double <span className="text-xs">{remainingVotes.double}/3</span>
              </span>
            </button>
            
            {/* Special Vote */}
            <button
              className={getVoteButtonState(submissionId1, 'SPECIAL').className}
              disabled={getVoteButtonState(submissionId1, 'SPECIAL').isDisabled}
              onClick={() => handleVote(submissionId1, 'SPECIAL')}
            >
              <Sparkles className="h-6 w-6 text-accent" />
              <span className="text-xs mt-1 text-accent">
                Coup de Coeur <span className="text-xs">{remainingVotes.special}/1</span>
              </span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-sm mb-2 text-muted-foreground">{competitor2}</div>
          <div className="flex space-x-2">
            {/* Standard Like */}
            <button
              className={getVoteButtonState(submissionId2, 'STANDARD').className}
              disabled={getVoteButtonState(submissionId2, 'STANDARD').isDisabled}
              onClick={() => handleVote(submissionId2, 'STANDARD')}
            >
              <Heart className={`h-6 w-6 ${selectedSubmission === submissionId2 && selectedVoteType === 'STANDARD' ? 'fill-current' : ''}`} />
              <span className="text-xs mt-1">Like</span>
            </button>
            
            {/* Double Like */}
            <button
              className={getVoteButtonState(submissionId2, 'DOUBLE').className}
              disabled={getVoteButtonState(submissionId2, 'DOUBLE').isDisabled}
              onClick={() => handleVote(submissionId2, 'DOUBLE')}
            >
              <Diamond className="h-6 w-6 text-secondary" />
              <span className="text-xs mt-1 text-secondary">
                Double <span className="text-xs">{remainingVotes.double}/3</span>
              </span>
            </button>
            
            {/* Special Vote */}
            <button
              className={getVoteButtonState(submissionId2, 'SPECIAL').className}
              disabled={getVoteButtonState(submissionId2, 'SPECIAL').isDisabled}
              onClick={() => handleVote(submissionId2, 'SPECIAL')}
            >
              <Sparkles className="h-6 w-6 text-accent" />
              <span className="text-xs mt-1 text-accent">
                Coup de Coeur <span className="text-xs">{remainingVotes.special}/1</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingControls;
