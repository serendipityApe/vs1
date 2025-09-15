"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Link } from "@heroui/link";

import CommentItem from "./CommentItem";

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

interface CommentsSectionProps {
  projectId: string;
  projectAuthorId: string;
}

export default function CommentsSection({
  projectId,
  projectAuthorId,
}: CommentsSectionProps) {
  const { data: session } = useSession();
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
          data.error || "加载评论失败",
        );
      }
    } catch (error) {
      handleApiError(error, "获取评论失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      return;
    }

    if (!newComment.trim()) {
      showErrorToast("评论内容不能为空");

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
        showSuccessToast("评论发布成功！", "感谢你的参与讨论");
      } else {
        handleApiError(
          { response: { status: 400, data } },
          data.error || "发布评论失败",
        );
      }
    } catch (error) {
      handleApiError(error, "发布评论失败");
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
        <CardBody className="text-center py-8">
          <div className="text-lg">加载评论中...</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-xl font-bold">讨论 ({totalComments})</h3>
        <p className="text-sm text-foreground-500">参与这个辉煌失败的讨论</p>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* 发布评论表单 */}
        {session ? (
          <form className="space-y-4" onSubmit={handleSubmitComment}>
            <Textarea
              description={`${newComment.length}/1000 字符`}
              maxLength={1000}
              minRows={4}
              placeholder="分享你的想法、类似经历，或者单纯地欣赏这个混乱..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <div className="flex justify-end">
              <Button
                color="primary"
                isDisabled={!newComment.trim()}
                isLoading={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "发布中..." : "发布评论"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center p-6 bg-content2 rounded-lg">
            <p className="text-foreground-600 mb-4">请登录后参与讨论</p>
            <Button
              as={Link}
              color="primary"
              href="/api/auth/signin"
              variant="bordered"
            >
              GitHub 登录
            </Button>
          </div>
        )}

        {/* 评论列表 */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-foreground-500">
            <div className="text-4xl mb-4">💬</div>
            <p>还没有评论，成为第一个发表看法的人吧！</p>
          </div>
        ) : (
          <div className="space-y-6 border-t pt-6">
            {/* 置顶评论 */}
            {comments.filter((comment) => comment.isPinned).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground-500">
                  <span>📌</span>
                  创作者置顶
                </div>
                {comments
                  .filter((comment) => comment.isPinned)
                  .map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      currentUserId={session?.user?.id}
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
                      所有评论
                    </div>
                  </div>
                )}
                {comments
                  .filter((comment) => !comment.isPinned)
                  .map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      currentUserId={session?.user?.id}
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
