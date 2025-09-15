"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Link } from "@heroui/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { handleApiError } from "@/lib/toast";

interface Project {
  id: string;
  title: string;
  tagline: string;
  url?: string;
  imageUrl?: string;
  logoUrl?: string;
  galleryUrls: string[];
  tags: string[];
  failureType?: string;
  createdAt: string;
  votesCount: number;
  commentsCount: number;
  author: {
    username: string;
    avatarUrl?: string;
  };
}

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects?limit=10&sort=votes");
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects);
      } else {
        handleApiError(
          { response: { status: response.status, data } },
          "获取项目列表失败",
        );
      }
    } catch (error) {
      handleApiError(error, "获取项目列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "今天";
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString("zh-CN");
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-12">
        {/* Logo */}
        {/* <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4">
            <img
              src="/logo.svg"
              alt="Vibe Shit Logo"
              className="w-full h-full"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-2">Vibe Shit</h1>
          <p className="text-xl text-foreground-600 mb-6">
            A showcase of glorious failures
          </p>
        </div> */}

        {/* Slogan */}
        <section className="text-center py-8 mb-8">
          <h2 className="text-3xl font-bold mb-3 text-balance">
            The Hall of <span className="text-primary">Glorious Failures</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-6 text-pretty max-w-2xl mx-auto">
            A celebration of ambitious projects that didn't quite work out as
            planned. Because sometimes the best stories come from the worst
            code.
          </p>
        </section>
        {/* <div className="mb-8">
          <p className="text-lg md:text-xl text-foreground-700 mb-4 leading-relaxed">
            A platform dedicated to showcasing those
            <span className="text-primary font-semibold">
              {" "}
              glorious failures
            </span>{" "}
            from the programming world
          </p>
          <p className="text-base text-foreground-600">
            Here, every{" "}
            <code className="bg-content2 px-2 py-1 rounded text-primary font-mono text-sm">
              bug
            </code>{" "}
            is a feature, every{" "}
            <code className="bg-content2 px-2 py-1 rounded text-primary font-mono text-sm">
              crash
            </code>{" "}
            is art
          </p>
        </div> */}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12">
          <Button
            className="font-semibold"
            color="primary"
            endContent={
              <Image
                alt="Vote"
                className="w-5 h-5 color-white"
                height={20}
                src="/logo.svg"
                width={20}
              />
            }
            size="lg"
            onPress={() => router.push("/submit")}
          >
            Submit Your Shit
          </Button>
          <Button
            size="lg"
            variant="bordered"
            onPress={() => {
              document
                .getElementById("leaderboard")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Browse Today&apos;s Shit
          </Button>
        </div>
      </div>

      {/* Features */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
        <Card className="p-2">
          <CardBody className="text-center">
            <div className="text-3xl mb-4">🤡</div>
            <h3 className="text-lg font-semibold mb-2">Celebrate Failure</h3>
            <p className="text-foreground-600 text-sm">
              Transform your abandoned projects from \"poor execution\" to
              \"entertaining content\"
            </p>
          </CardBody>
        </Card>

        <Card className="p-2">
          <CardBody className="text-center">
            <div className="text-3xl mb-4">🔥</div>
            <h3 className="text-lg font-semibold mb-2">Daily Rankings</h3>
            <p className="text-foreground-600 text-sm">
              24-hour reset leaderboard, giving the shittiest projects the
              attention they deserve
            </p>
          </CardBody>
        </Card>

        <Card className="p-2">
          <CardBody className="text-center">
            <div className="text-3xl mb-4">🎭</div>
            <h3 className="text-lg font-semibold mb-2">Safe Space</h3>
            <p className="text-foreground-600 text-sm">
              No judgment, only laughter. Share your \"masterpiece\" without
              worry
            </p>
          </CardBody>
        </Card>
      </div> */}

      {/* Today's Top Shit */}
      <div className="w-full max-w-6xl mx-auto" id="leaderboard">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Shit Leaderboard</h2>
          <p className="text-foreground-600">
            Most popular failure masterpieces
          </p>
        </div>

        {isLoading ? (
          <Card className="p-8">
            <CardBody className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-foreground-600">Loading...</p>
            </CardBody>
          </Card>
        ) : projects.length === 0 ? (
          <Card className="p-8">
            <CardBody className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
              <p className="text-foreground-600 mb-6">
                Be the first brave soul to share a shit project!
              </p>
              <Button color="primary" onPress={() => router.push("/submit")}>
                Submit First Project
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    {/* 排名 */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-warning flex items-center justify-center font-bold text-white text-lg">
                        {index + 1}
                      </div>
                    </div>

                    {/* 项目图片 */}
                    {(project.logoUrl ||
                      project.imageUrl ||
                      project.galleryUrls.length > 0) && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <Image
                          alt={project.title}
                          className="w-full h-full object-cover"
                          height={64}
                          src={
                            project.logoUrl ||
                            project.imageUrl ||
                            project.galleryUrls[0]
                          }
                          width={64}
                        />
                      </div>
                    )}

                    {/* 项目信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1 text-foreground-900">
                            <Link
                              className="hover:text-primary transition-colors"
                              href={`/projects/${project.id}`}
                            >
                              {project.title}
                            </Link>
                          </h3>
                          <p className="text-foreground-600 text-sm mb-3">
                            {project.tagline}
                          </p>
                        </div>

                        {/* 统计信息 */}
                        <div className="flex items-center gap-4 ml-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-primary">
                              {project.votesCount}
                            </div>
                            <div className="text-xs text-foreground-500">
                              votes
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-foreground-700">
                              {project.commentsCount}
                            </div>
                            <div className="text-xs text-foreground-500">
                              comments
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 标签 */}
                      {project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag}
                              color="warning"
                              size="sm"
                              variant="light"
                            >
                              {tag}
                            </Chip>
                          ))}
                          {project.tags.length > 3 && (
                            <Chip color="warning" size="sm" variant="light">
                              +{project.tags.length - 3}
                            </Chip>
                          )}
                        </div>
                      )}

                      {/* 作者和时间 */}
                      <div className="flex items-center gap-2 text-sm text-foreground-500">
                        <Avatar
                          className="w-5 h-5"
                          name={project.author.username}
                          size="sm"
                          src={project.author.avatarUrl}
                        />
                        <span>{project.author.username}</span>
                        <span>•</span>
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}

            {/* 查看更多 */}
            <div className="text-center pt-6">
              <Button
                size="lg"
                variant="bordered"
                onPress={() => router.push("/projects")}
              >
                View More Shit Projects
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
