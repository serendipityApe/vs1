"use client";

import { useState } from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";

import { handleApiError, showSuccessToast, showErrorToast } from "@/lib/toast";

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

interface CommentItemProps {
  comment: Comment;
  projectId: string;
  projectAuthorId: string;
  onReplyAdded: (parentId: string, reply: Comment) => void;
  currentUserId?: string;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  projectId,
  projectAuthorId,
  onReplyAdded,
  currentUserId,
  isReply = false,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) return;

    if (!replyContent.trim()) {
      showErrorToast("Reply cannot be empty");

      return;
    }

    setIsSubmittingReply(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          parentId: comment.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onReplyAdded(comment.id, data.comment);
        setReplyContent("");
        setShowReplyForm(false);
        showSuccessToast("Reply posted");
      } else {
        handleApiError(
          { response: { status: 400, data } },
          data.error || "Failed to post reply",
        );
      }
    } catch (error) {
      handleApiError(error, "Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div
      className={`font-mono ${isReply ? "ml-4 sm:ml-8 mt-4 border-l-2 border-foreground pl-4" : "border-2 border-foreground p-4 bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"}`}
    >
      <div className="flex gap-3 items-start">
        <Avatar
          className="w-8 h-8 flex-shrink-0 border border-foreground rounded-none"
          name={comment.author.username}
          radius="none"
          size="sm"
          src={comment.author.avatarUrl}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
            <span className="font-bold uppercase bg-content2 px-1">
              {comment.author.username}
            </span>
            {comment.isAuthor && (
              <span className="bg-primary text-black px-1 font-bold uppercase">
                OP
              </span>
            )}
            {comment.isPinned && !isReply && (
              <span className="bg-red-500 text-white px-1 font-bold uppercase">
                PINNED
              </span>
            )}
            <span className="text-foreground/50">
              [{formatDate(comment.createdAt)}]
            </span>
          </div>

          <div className="text-sm text-pretty leading-relaxed break-words mb-3">
            {comment.content}
          </div>

          <div className="flex items-center gap-2">
            {!isReply && currentUserId && (
              <Button
                className="h-6 px-2 min-w-0 font-mono text-xs uppercase border border-foreground bg-transparent hover:bg-foreground hover:text-background rounded-none"
                radius="none"
                size="sm"
                variant="bordered"
                onPress={() => setShowReplyForm(!showReplyForm)}
              >
                {showReplyForm ? "Close_Reply" : "Reply"}
              </Button>
            )}
          </div>

          {/* 回复表单 */}
          {showReplyForm && currentUserId && (
            <div className="space-y-2 mt-3 border-t border-dashed border-foreground pt-3">
              <form className="space-y-3" onSubmit={handleSubmitReply}>
                <Textarea
                  className="min-h-[80px]"
                  classNames={{
                    inputWrapper:
                      "bg-background border border-foreground rounded-none data-[hover=true]:bg-background group-data-[focus=true]:bg-background",
                  }}
                  maxLength={1000}
                  minRows={2}
                  placeholder={`> Reply to user ${comment.author.username}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />

                <div className="flex gap-2">
                  <Button
                    className="bg-foreground text-background font-bold uppercase rounded-none"
                    isDisabled={!replyContent.trim()}
                    isLoading={isSubmittingReply}
                    radius="none"
                    size="sm"
                    type="submit"
                  >
                    {isSubmittingReply ? "SENDING..." : "SEND"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 回复列表 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isReply={true}
              projectAuthorId={projectAuthorId}
              projectId={projectId}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
