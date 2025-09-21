"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";

import CommentItem from "./CommentItem";

import { handleApiError, showSuccessToast, showErrorToast } from "@/lib/toast";
import { useSupabase } from "@/app/supabase-provider";
import { LoadingCard } from "@/components/ui/Loading";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  isPinned: boolean;
  isAuthor: boolean;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  replies: Comment[];
}

interface CommentsSectionProps {
  projectId: string;
  projectAuthorId: string;
}

export default function CommentsSection({
  projectId,
  projectAuthorId,
}: CommentsSectionProps) {
  const { user, signInWithOAuth } = useSupabase();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`);
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments);
      } else {
        handleApiError(
          { response: { status: response.status, data } },
          data.error || "Failed to load comments",
        );
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showErrorToast("Please log in first");

      return;
    }

    if (!newComment.trim()) {
      showErrorToast("Comment cannot be empty");

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 添加新评论到列表
        const newCommentData = data.comment;

        setComments((prev) => {
          // 如果是置顶评论，插入到最前面
          if (newCommentData.isPinned) {
            return [newCommentData, ...prev];
          }

          // 否则按时间顺序插入
          return [...prev, newCommentData];
        });
        setNewComment("");
        showSuccessToast("Comment posted successfully!", "Thanks for joining the discussion");
      } else {
        handleApiError(
          { response: { status: 400, data } },
          data.error || "Failed to post comment",
        );
      }
    } catch (error) {
      handleApiError(error, "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyAdded = (parentId: string, reply: Comment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === parentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment,
      ),
    );
  };

  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0);
  }, 0);

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <LoadingCard label="Loading comments..." />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-xl font-bold">Discussion ({totalComments})</h3>
        <p className="text-sm text-foreground-500">Join the discussion about this glorious failure</p>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* 发布评论表单 */}
        {user ? (
          <form className="space-y-4" onSubmit={handleSubmitComment}>
            <Textarea
              description={`${newComment.length}/1000 characters`}
              maxLength={1000}
              minRows={4}
              placeholder="Share your thoughts, similar experiences, or simply appreciate this beautiful chaos..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <div className="flex justify-end">
              <Button
                color="primary"
                isDisabled={!newComment.trim()}
                isLoading={isSubmitting}
                type="submit"
                radius="full"
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center p-6 bg-content2 rounded-lg">
            <p className="text-foreground-600 mb-4">Please log in to join the discussion</p>
            <Button
              color="primary"
              variant="bordered"
              radius="full"
              onPress={async () => {
                await signInWithOAuth("github");
              }}
            >
              Sign in with GitHub
            </Button>
          </div>
        )}

        {/* 评论列表 */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-foreground-500">
            <div className="text-4xl mb-4">💬</div>
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-6 border-t pt-6">
            {/* 置顶评论 */}
            {comments.filter((comment) => comment.isPinned).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground-500">
                  <span>📌</span>
                  Pinned by author
                </div>
                {comments
                  .filter((comment) => comment.isPinned)
                  .map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      currentUserId={user?.id}
                      projectAuthorId={projectAuthorId}
                      projectId={projectId}
                      onReplyAdded={handleReplyAdded}
                    />
                  ))}
              </div>
            )}

            {/* 普通评论 */}
            {comments.filter((comment) => !comment.isPinned).length > 0 && (
              <div className="space-y-4">
                {comments.filter((comment) => comment.isPinned).length > 0 && (
                  <div className="border-t pt-6">
                    <div className="text-sm font-medium text-foreground-500 mb-4">
                      All comments
                    </div>
                  </div>
                )}
                {comments
                  .filter((comment) => !comment.isPinned)
                  .map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      currentUserId={user?.id}
                      projectAuthorId={projectAuthorId}
                      projectId={projectId}
                      onReplyAdded={handleReplyAdded}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
