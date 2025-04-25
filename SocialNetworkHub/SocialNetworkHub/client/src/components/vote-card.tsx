import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ChallengeCard from "@/components/challenge-card";
import CompetitorCard from "@/components/competitor-card";
import VotingControls from "@/components/voting-controls";
import CommentSection from "@/components/comment-section";
import { Challenge, Submission, User, Team } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type VoteCardProps = {
  challengeId: number;
};

type VoteSubmissionPair = {
  challenge: Challenge;
  submissions: {
    [key: string]: Submission & {
      user?: User;
      team?: Team & { members?: User[] };
      votesCount: number;
    };
  };
  totalVotes: number;
};

const VoteCard = ({ challengeId }: VoteCardProps) => {
  const [fullscreenSubmission, setFullscreenSubmission] = useState<{url: string, title: string} | null>(null);
  
  const { data, isLoading, isError } = useQuery<VoteSubmissionPair>({
    queryKey: ["/api/vote-submission-pairs", challengeId],
  });
  
  if (isLoading) {
    return <div className="text-center py-12">Loading challenge...</div>;
  }
  
  if (isError || !data) {
    return <div className="text-center py-12 text-destructive">Failed to load challenge data</div>;
  }
  
  const { challenge, submissions, totalVotes } = data;
  const submissionKeys = Object.keys(submissions);
  
  if (submissionKeys.length < 2) {
    return <div className="text-center py-12">This challenge doesn't have enough submissions for voting</div>;
  }
  
  const submission1 = submissions[submissionKeys[0]];
  const submission2 = submissions[submissionKeys[1]];
  
  const competitor1 = submission1.user?.username || submission1.team?.name || "Competitor 1";
  const competitor2 = submission2.user?.username || submission2.team?.name || "Competitor 2";
  
  const voteCounts = {
    competitor1: submission1.votesCount,
    competitor2: submission2.votesCount,
    total: totalVotes
  };
  
  return (
    <div className="scroll-snap-item min-h-[calc(100vh-8rem)] mb-8 md:mb-16">
      <div className="max-w-3xl mx-auto">
        <ChallengeCard 
          challenge={challenge}
          isActive={false}
          participantCount={submissionKeys.length}
        />
        
        {/* Competitors section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Competitor 1 */}
          <CompetitorCard
            competitor={{
              type: submission1.user ? 'user' : 'team',
              data: submission1.user || submission1.team!,
              rating: 4.8,
              wins: 42,
              members: submission1.team?.members,
            }}
            submission={{
              contentUrl: submission1.content,
              previewUrl: submission1.content,
            }}
            onFullscreen={() => setFullscreenSubmission({
              url: submission1.content,
              title: `${competitor1}'s Submission`
            })}
            gradient="primary"
          />
          
          {/* Competitor 2 */}
          <CompetitorCard
            competitor={{
              type: submission2.user ? 'user' : 'team',
              data: submission2.user || submission2.team!,
              rating: 4.7,
              wins: 37,
              members: submission2.team?.members,
            }}
            submission={{
              contentUrl: submission2.content,
              previewUrl: submission2.content,
            }}
            onFullscreen={() => setFullscreenSubmission({
              url: submission2.content,
              title: `${competitor2}'s Submission`
            })}
            gradient="secondary"
          />
        </div>
        
        {/* Voting section */}
        <VotingControls
          submissionId1={submission1.id}
          submissionId2={submission2.id}
          competitor1={competitor1}
          competitor2={competitor2}
          voteCounts={voteCounts}
        />
        
        {/* Comments section */}
        <div className="bg-card rounded-lg p-4 mt-6">
          <CommentSection submissionId={challenge.id} />
        </div>
      </div>
      
      {/* Fullscreen Dialog */}
      <Dialog open={!!fullscreenSubmission} onOpenChange={(open) => !open && setFullscreenSubmission(null)}>
        <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] p-2">
          <DialogHeader>
            <DialogTitle>{fullscreenSubmission?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 h-[calc(90vh-10rem)] overflow-auto">
            <img 
              src={fullscreenSubmission?.url} 
              alt={fullscreenSubmission?.title}
              className="w-full h-full object-contain" 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoteCard;
