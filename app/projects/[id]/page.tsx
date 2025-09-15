"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Avatar } from "@heroui/avatar";
import { useRouter } from "next/navigation";
import Image from "next/image";

import CommentsSection from "@/components/comments/CommentsSection";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { handleApiError, showSuccessToast } from "@/lib/toast";

interface Project {
  id: string;
  title: string;
  tagline: string;
  url?: string;
  confession: string;
  imageUrl?: string;
  logoUrl?: string;
  galleryUrls: string[];
  tags: string[];
  failureType?: string;
  createdAt: string;
  votesCount: number;
  hasVoted: boolean;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setProjectId(id);
      fetchProject(id);
    });
  }, [params]);

  const fetchProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();

      if (response.ok) {
        setProject(data.project);
      } else {
        handleApiError(
          { response: { status: response.status, data } },
          data.error || "加载项目失败",
        );
        setProject(null);
      }
    } catch (error) {
      handleApiError(error, "获取项目失败");
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (action: "upvote" | "remove") => {
    if (!session) {
      router.push("/api/auth/signin");

      return;
    }

    if (!project) return;

    setIsVoting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                votesCount: data.votesCount,
                hasVoted: data.hasVoted,
              }
            : null,
        );
        showSuccessToast(
          action === "upvote" ? "点赞成功！" : "取消点赞",
          "感谢你的参与",
        );
      } else {
        handleApiError(
          { response: { status: 400, data } },
          data.error || "投票失败",
        );
      }
    } catch (error) {
      handleApiError(error, "投票失败");
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading || !projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!project && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center p-8">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold mb-4">项目不存在</h1>
            <p className="text-foreground-600 mb-6">
              该项目可能已被删除或不存在
            </p>
            <Button color="primary" onPress={() => router.push("/")}>
              回到首页
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFailureTypeLabel = (type: string) => {
    const failureTypes: Record<string, string> = {
      abandoned: "烂尾项目",
      overengineered: "过度工程",
      "ai-disaster": "AI灾难",
      "ui-nightmare": "UI噩梦",
      performance: "性能地狱",
      security: "安全漏洞",
    };

    return failureTypes[type] || type;
  };

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 粘性头部 */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              startContent="←"
              variant="ghost"
              onPress={() => router.push("/")}
            >
              返回排行榜
            </Button>
            <div className="flex items-center gap-3">
              <Button size="sm" startContent="📤" variant="bordered">
                分享
              </Button>
              <Button
                color="primary"
                size="sm"
                onPress={() => router.push("/submit")}
              >
                提交你的垃圾
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 项目头部 */}
        <section className="mb-8">
          <div className="flex items-start gap-6 mb-6">
            {/* 项目Logo */}
            <div className="w-32 h-24 bg-content2 rounded-lg overflow-hidden flex-shrink-0 relative">
              {project.logoUrl || project.imageUrl ? (
                <Image
                  fill
                  alt={project.title}
                  className="w-full h-full object-cover"
                  sizes="128px"
                  src={(project.logoUrl || project.imageUrl) as string}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4 relative">
                  <Image
                    fill
                    alt="Default Project Logo"
                    className="w-full h-full opacity-60"
                    sizes="96px"
                    src="/logo.svg"
                  />
                </div>
              )}
            </div>

            {/* 项目信息 */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-balance">
                {project.title}
              </h1>
              <p className="text-xl text-foreground-600 mb-4 text-pretty">
                {project.tagline}
              </p>

              {/* 失败类型 */}
              {project.failureType && (
                <div className="mb-4">
                  <Chip color="warning" size="sm" variant="flat">
                    {getFailureTypeLabel(project.failureType)}
                  </Chip>
                </div>
              )}

              {/* 标签 */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <Chip key={tag} color="primary" size="sm" variant="flat">
                      {tag}
                    </Chip>
                  ))}
                </div>
              )}

              {/* 作者信息 */}
              <div className="flex items-center gap-4 text-sm text-foreground-500">
                <div className="flex items-center gap-2">
                  <Avatar
                    className="w-6 h-6"
                    name={project.author.username}
                    size="sm"
                    src={project.author.avatarUrl}
                  />
                  <span>by {project.author.username}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{formatDate(project.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* 投票按钮 */}
            <div className="flex flex-col items-center gap-2">
              <Button
                className="flex items-center gap-1 h-auto py-3 px-4 min-w-16"
                color={project.hasVoted ? "primary" : "default"}
                isLoading={isVoting}
                size="lg"
                startContent={
                  <Image
                    alt="Vote"
                    className="w-5 h-5"
                    height={20}
                    src="/logo.svg"
                    width={20}
                  />
                }
                variant={project.hasVoted ? "solid" : "bordered"}
                onPress={() =>
                  handleVote(project.hasVoted ? "remove" : "upvote")
                }
              >
                <span className="font-bold">Upvote</span>
                <span className="text-lg font-bold">{project.votesCount}</span>
              </Button>
            </div>
          </div>

          {/* 项目链接 */}
          <div className="flex gap-3">
            {project.url && (
              <Button
                as={Link}
                href={project.url}
                rel="noopener noreferrer"
                target="_blank"
                variant="bordered"
              >
                <span className="mr-2">🔗</span>
                查看项目
              </Button>
            )}
            <Button
              as={Link}
              href={`https://github.com/${project.author.username}`}
              rel="noopener noreferrer"
              target="_blank"
              variant="bordered"
            >
              <span className="mr-2">🐛</span>
              查看作者
            </Button>
          </div>
        </section>

        {/* 项目图片库 */}
        {project.galleryUrls.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">项目展示</h2>
            <ImageCarousel images={project.galleryUrls} title={project.title} />
          </section>
        )}

        {/* 忏悔录 */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2">
                <div className="flex items-center align-center gap-1">
                  <Image
                    alt=""
                    className="w-5 h-5"
                    height={20}
                    src="/prize.svg"
                    width={20}
                  />
                  <h2 className="text-xl font-bold">辉煌忏悔录</h2>
                </div>
                <p className="text-sm text-foreground-500">
                  这个失败杰作是如何诞生的
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {project.confession.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-pretty leading-relaxed mb-4 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardBody>
          </Card>
        </section>

        {/* 评论区 */}
        <section>
          <CommentsSection
            projectAuthorId={project.author.id}
            projectId={projectId}
          />
        </section>
      </main>
    </div>
  );
}
