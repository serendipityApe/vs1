"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Avatar } from "@heroui/avatar";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useSupabase } from "@/app/supabase-provider";
import CommentsSection from "@/components/comments/CommentsSection";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { handleApiError, showSuccessToast } from "@/lib/toast";
import { LoadingPage } from "@/components/ui/Loading";
import { CalendarIcon } from "@/components/icons";

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
  const { user, signInWithOAuth } = useSupabase();
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
        const proj = data.project;

        // server now returns signed URLs directly as project.logoUrl and project.galleryUrls

        setProject(proj);
      } else {
        handleApiError(
          { response: { status: response.status, data } },
          data.error || "Failed to load project"
        );
        setProject(null);
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch project");
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (action: "upvote" | "remove") => {
    if (!user) {
      // prompt Supabase OAuth login
      await signInWithOAuth("github");

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
            : null
        );
        showSuccessToast(
          action === "upvote" ? "Upvoted successfully!" : "Upvote removed",
          "Thanks for your participation"
        );
      } else {
        handleApiError(
          { response: { status: 400, data } },
          data.error || "Voting failed"
        );
      }
    } catch (error) {
      handleApiError(error, "Voting failed");
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading || !projectId) {
    return <LoadingPage label="Loading project..." />;
  }

  if (!project && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center p-8">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="text-foreground-600 mb-6">
              This project may have been deleted or does not exist
            </p>
            <Button color="primary" radius="full" onPress={() => router.push("/")}>
              Back to Home
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
      abandoned: "Abandoned Project",
      overengineered: "Over-engineered",
      "ai-disaster": "AI Disaster",
      "ui-nightmare": "UI Nightmare",
      performance: "Performance Hell",
      security: "Security Vulnerability",
    };

    return failureTypes[type] || type;
  };

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 粘性头部 */}
      {/* <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              startContent="←"
              variant="ghost"
              radius="full"
              onPress={() => router.push("/")}
            >
              Back to Leaderboard
            </Button>
            <div className="flex items-center gap-3">
              <Button size="sm" startContent="📤" variant="bordered" radius="full">
                Share
              </Button>
              <Button
                color="primary"
                size="sm"
                radius="full"
                onPress={() => router.push("/submit")}
              >
                Submit Your Project
              </Button>
            </div>
          </div>
        </div>
      </header> */}

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
                  <CalendarIcon className="w-4 h-4" />
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
                radius="full"
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
                radius="full"
              >
                <span className="mr-2">🔗</span>
                View Project
              </Button>
            )}
            <Button
              as={Link}
              href={`https://github.com/${project.author.username}`}
              rel="noopener noreferrer"
              target="_blank"
              variant="bordered"
              radius="full"
            >
              <span className="mr-2">🐛</span>
              View Author
            </Button>
          </div>
        </section>

        {/* 项目图片库 */}
        {project.galleryUrls.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Project Gallery</h2>
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
                  <h2 className="text-xl font-bold">Glorious Confession</h2>
                </div>
                <p className="text-sm text-foreground-500">
                  How this failure masterpiece came to be
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
