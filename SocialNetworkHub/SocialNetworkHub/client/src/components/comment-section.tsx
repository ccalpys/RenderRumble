import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Comment, User } from "@shared/schema";
import { ThumbsUp, Send } from "lucide-react";

type CommentSectionProps = {
  submissionId: number;
};

const CommentSection = ({ submissionId }: CommentSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");

  const { data: comments = [], isLoading } = useQuery<Array<Comment & { user: User }>>({
    queryKey: ["/api/comments", submissionId],
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/comments", { submissionId, content });
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/comments", submissionId] });
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to post comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest("POST", `/api/comments/${commentId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments", submissionId] });
    },
    onError: (error) => {
      toast({
        title: "Failed to like comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    commentMutation.mutate(comment);
  };

  const handleLikeComment = (commentId: number) => {
    likeMutation.mutate(commentId);
  };

  const displayedComments = comments.slice(0, 5);
  const hasMoreComments = comments.length > 5;

  return (
    <div className="border-t border-muted pt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="font-medium">Comments</div>
        {hasMoreComments && (
          <Button variant="link" className="text-primary text-sm p-0">
            View all ({comments.length})
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-2">Loading comments...</div>
        ) : displayedComments.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-2">No comments yet. Be the first to comment!</div>
        ) : (
          displayedComments.map((comment) => (
            <div key={comment.id} className="flex">
              <Avatar className="h-8 w-8 mr-3 flex-shrink-0">
                <AvatarImage src={comment.user.avatarUrl || ""} />
                <AvatarFallback>{getInitials(comment.user.username)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted p-2 rounded-lg">
                  <div className="flex items-center mb-1">
                    <span className="font-medium text-sm">{comment.user.username}</span>
                    <span className="ml-2 text-muted-foreground text-xs">
                      {formatDistanceToNow(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <div className="flex space-x-3 mt-1 text-xs text-muted-foreground">
                  <button 
                    className="hover:text-primary flex items-center"
                    onClick={() => handleLikeComment(comment.id)}
                    disabled={likeMutation.isPending}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" /> {comment.likes || 0}
                  </button>
                  <button className="hover:text-primary">Reply</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mt-4 flex">
          <Avatar className="h-8 w-8 mr-3 flex-shrink-0">
            <AvatarImage src={user.avatarUrl || ""} />
            <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="pr-10"
              disabled={commentMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-primary"
              disabled={commentMutation.isPending || !comment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentSection;
