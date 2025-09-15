"use client";

import { useState } from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";

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
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "刚刚";
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString("zh-CN");
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) return;

    if (!replyContent.trim()) {
      showErrorToast("回复内容不能为空");

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
        showSuccessToast("回复发布成功！");
      } else {
        handleApiError(
          { response: { status: 400, data } },
          data.error || "发布回复失败",
        );
      }
    } catch (error) {
      handleApiError(error, "发布回复失败");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className={isReply ? "ml-8 border-l-2 border-content3 pl-4" : ""}>
      <div className="flex gap-3">
        <Avatar
          className="w-8 h-8 flex-shrink-0"
          name={comment.author.username}
          size="sm"
          src={comment.author.avatarUrl}
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{comment.author.username}</span>
            {comment.isAuthor && (
              <Chip
                className="text-xs"
                color="primary"
                size="sm"
                variant="flat"
              >
                创作者
              </Chip>
            )}
            {comment.isPinned && !isReply && (
              <span className="text-primary text-xs font-medium">📌</span>
            )}
            <span className="text-foreground-500">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <div
            className={`${comment.isPinned && !isReply ? "bg-primary/10 border border-primary/30 rounded-lg p-3" : ""}`}
          >
            <p className="text-pretty leading-relaxed">{comment.content}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isReply && currentUserId && (
              <Button
                className="h-8 px-2"
                size="sm"
                variant="light"
                onPress={() => setShowReplyForm(!showReplyForm)}
              >
                回复
              </Button>
            )}
          </div>

          {/* 回复表单 */}
          {showReplyForm && currentUserId && (
            <div className="space-y-2 mt-3">
              <form className="space-y-3" onSubmit={handleSubmitReply}>
                <Textarea
                  className="min-h-[80px]"
                  maxLength={1000}
                  minRows={2}
                  placeholder={`回复 @${comment.author.username}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />

                <div className="flex gap-2">
                  <Button
                    color="primary"
                    isDisabled={!replyContent.trim()}
                    isLoading={isSubmittingReply}
                    size="sm"
                    type="submit"
                  >
                    {isSubmittingReply ? "发布中..." : "回复"}
                  </Button>
                  <Button
                    size="sm"
                    variant="bordered"
                    onPress={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                  >
                    取消
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 回复列表 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
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
