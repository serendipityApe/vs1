"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
import { Avatar } from "@heroui/avatar";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useSupabase } from "@/app/supabase-provider";
import CommentsSection from "@/components/comments/CommentsSection";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { handleApiError, showSuccessToast } from "@/lib/toast";
import { LoadingPage } from "@/components/ui/Loading";

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

        setProject(proj);
      } else {
        handleApiError(
          { response: { status: response.status, data } },
          data.error || "Failed to load project",
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
            : null,
        );
        showSuccessToast(
          action === "upvote" ? "CONFIRMED_FAILURE" : "REVOKED_CONFIRMATION",
          "Your vote has been recorded in the ledger.",
        );
      } else {
        handleApiError(
          { response: { status: 400, data } },
          data.error || "Voting failed",
        );
      }
    } catch (error) {
      handleApiError(error, "Voting failed");
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading || !projectId) {
    return <LoadingPage label="LOADING_DATA_STRUCTURE..." />;
  }

  if (!project && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card
          className="max-w-md w-full border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          radius="none"
        >
          <CardBody className="text-center p-8">
            <div className="text-6xl mb-4 font-mono">404</div>
            <h1 className="text-2xl font-bold mb-4 font-mono uppercase">
              NULL POINTER EXCEPTION
            </h1>
            <p className="text-foreground-600 mb-6 font-mono">
              Project object is null or undefined.
            </p>
            <Button
              className="font-bold font-mono uppercase border-2 border-foreground"
              color="primary"
              radius="none"
              onPress={() => router.push("/")}
            >
              cd ..
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

    const getFailureTypeLabel = (type: string) => {

      const failureTypes: Record<string, string> = {

        abandoned: "ABANDONED",

        overengineered: "OVER-ENGINEERED",

        "ai-disaster": "AI_DISASTER",

        "ui-nightmare": "UI_NIGHTMARE",

        performance: "PERFORMANCE_ISSUE",

        security: "SECURITY_BREACH",

      };

      return failureTypes[type] || type.toUpperCase();

    };

  

    if (!project) return null;

  

    return (

      <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Project Header - Ticket Style */}
        <section className="mb-12 border-2 border-foreground bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-0">
          {/* Ticket Top Bar */}
          <div className="bg-foreground text-background p-2 flex justify-between items-center font-mono text-sm">
            <span>TICKET-ID: {project.id.slice(-8).toUpperCase()}</span>
            <span>
              STATUS: <span className="bg-red-500 text-white px-1">FAILED</span>
            </span>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo Area */}
              <div className="shrink-0">
                <div className="w-32 h-32 border-2 border-foreground relative overflow-hidden bg-content2">
                  {project.logoUrl || project.imageUrl ? (
                    <Image
                      fill
                      alt={project.title}
                      className="object-cover"
                      sizes="128px"
                      src={(project.logoUrl || project.imageUrl) as string}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-4xl font-bold text-foreground/20">
                      NULL
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Info */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  {project.failureType && (
                    <span className="bg-primary text-black border border-foreground px-2 py-0.5 font-mono text-xs font-bold uppercase">
                      {getFailureTypeLabel(project.failureType)}
                    </span>
                  )}
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-content2 border border-foreground px-2 py-0.5 font-mono text-xs uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-4xl md:text-5xl font-black font-mono uppercase mb-2 leading-none tracking-tight text-balance">
                  {project.title}
                </h1>

                <p className="text-xl font-mono text-foreground/70 mb-6 border-l-4 border-primary pl-4 py-1">
                  {project.tagline}
                </p>

                <div className="flex flex-wrap gap-y-2 gap-x-6 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/50">AUTHOR:</span>
                    <div className="flex items-center gap-2">
                      <Avatar
                        className="w-5 h-5 rounded-none border border-foreground"
                        name={project.author.username}
                        radius="none"
                        size="sm"
                        src={project.author.avatarUrl}
                      />
                      <span className="font-bold">
                        {project.author.username}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/50">DATE:</span>
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                  {project.url && (
                    <div className="flex items-center gap-2">
                      <span className="text-foreground/50">URL:</span>
                      <Link
                        isExternal
                        className="text-primary underline decoration-2 underline-offset-2 font-bold"
                        href={project.url}
                      >
                        VISIT_SITE
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-8 border-t-2 border-dashed border-foreground flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="font-mono text-sm text-foreground/50 uppercase">
                Is this failure spectacular?
              </div>
              <div className="flex gap-4">
                <Button
                  isExternal
                  as={Link}
                  className="font-mono uppercase border-2 border-foreground"
                  href={`https://github.com/${project.author.username}`}
                  radius="none"
                  variant="bordered"
                >
                  Blame Author
                </Button>
                <Button
                  className={`font-mono font-bold uppercase border-2 border-foreground px-8 ${
                    project.hasVoted
                      ? "bg-green-500 text-black"
                      : "bg-primary text-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  }`}
                  isLoading={isVoting}
                  radius="none"
                  onPress={() =>
                    handleVote(project.hasVoted ? "remove" : "upvote")
                  }
                >
                  {project.hasVoted
                    ? "FAILURE_ACKNOWLEDGED"
                    : "CONFIRM_FAILURE"}
                  <span className="bg-black text-white px-2 py-0.5 ml-2 text-xs">
                    {project.votesCount}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        {project.galleryUrls.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4 font-mono">
              <span className="bg-foreground text-background px-2 font-bold text-sm">
                EVIDENCE
              </span>
              <h2 className="text-xl font-bold uppercase">Screenshots</h2>
            </div>
            <div className="border-2 border-foreground p-2 bg-content2">
              <ImageCarousel
                images={project.galleryUrls}
                title={project.title}
              />
            </div>
          </section>
        )}

        {/* Confession */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4 font-mono">
            <span className="bg-foreground text-background px-2 font-bold text-sm">
              LOGS
            </span>
            <h2 className="text-xl font-bold uppercase">Confession</h2>
          </div>

          <Card
            className="bg-black text-green-400 border-2 border-foreground font-mono shadow-[8px_8px_0px_0px_rgba(100,100,100,0.5)]"
            radius="none"
          >
            <CardBody className="p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-6 bg-zinc-800 flex items-center px-2 gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="ml-4 text-xs text-zinc-400">
                  vim confession.md
                </div>
              </div>
              <div className="mt-6 prose prose-invert max-w-none prose-p:font-mono prose-p:text-green-400/90 prose-p:my-2">
                {project.confession.split("\n\n").map((paragraph, index) => (
                  <p key={index}>
                    <span className="text-zinc-600 mr-2 select-none">
                      {index + 1}
                    </span>
                    {paragraph}
                  </p>
                ))}
                <p className="animate-pulse">
                  <span className="text-zinc-600 mr-2 select-none">
                    {project.confession.split("\n\n").length + 1}
                  </span>
                  _
                </p>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Comments */}
        <section>
          <div className="flex items-center gap-2 mb-4 font-mono">
            <span className="bg-foreground text-background px-2 font-bold text-sm">
              STDERR
            </span>
            <h2 className="text-xl font-bold uppercase">Community_Feedback</h2>
          </div>
          <div className="border-2 border-foreground bg-background p-6">
            <CommentsSection
              projectAuthorId={project.author.id}
              projectId={projectId}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
