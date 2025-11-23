"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

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
          "Failed to fetch project list",
        );
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section - Brutalist Terminal Style */}
      <section className="relative border-b-4 border-foreground mb-12 pt-20 pb-16 px-4 bg-primary/5">
        <div className="max-w-5xl mx-auto">
          <div className="font-mono text-xs sm:text-sm mb-4 text-primary uppercase tracking-widest">
            {"/// SYSTEM_ALERT: CRITICAL_FAILURE_DETECTED"}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black font-mono tracking-tighter mb-6 break-words leading-[0.8]">
            GLORIOUS
            <br />
            <span className="text-primary bg-foreground px-2">FAILURE</span>
          </h1>

          <div className="grid md:grid-cols-2 gap-8 items-end">
            <div className="text-xl md:text-2xl font-mono leading-tight border-l-4 border-primary pl-6">
              <p className="mb-2">{">"} showcasing abandoned dreams.</p>
              <p className="mb-2">{">"} celebrating spaghetti code.</p>
              <p className="text-foreground/50">
                {">"} where bugs are features.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="font-mono font-bold uppercase text-lg border-2 border-foreground h-14 px-8 bg-primary text-foreground hover:bg-foreground hover:text-background transition-colors"
                radius="none"
                onPress={() => router.push("/submit")}
              >
                ./SUBMIT_SHIT.sh
              </Button>
              <Button
                className="font-mono font-bold uppercase text-lg border-2 border-foreground h-14 px-8 bg-transparent hover:bg-foreground hover:text-background transition-colors"
                radius="none"
                onPress={() => {
                  document
                    .getElementById("leaderboard")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                cat leaderboard.txt
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 font-mono text-xs text-foreground/30 hidden md:block">
          PID: {Math.floor(Math.random() * 9999)}
          <br />
          MEM: LEAKING
          <br />
          CPU: MELTING
        </div>
      </section>

      {/* Leaderboard Section */}
      <div className="w-full max-w-6xl mx-auto px-4" id="leaderboard">
        <div className="flex items-center justify-between mb-8 border-b-2 border-foreground pb-2">
          <h2 className="text-3xl font-mono font-bold uppercase">
            <span className="text-primary mr-2">#</span>
            ACTIVE_FAILURES
          </h2>
          <div className="font-mono text-sm text-foreground/60">
            TOTAL_RECORDS: {projects.length}
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-content2 animate-pulse border-2 border-foreground/10"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="border-2 border-dashed border-foreground/30 p-12 text-center font-mono">
            <h3 className="text-2xl font-bold mb-2">404 PROJECTS NOT FOUND</h3>
            <p className="mb-6">
              Database is empty. Be the first to crash the system.
            </p>
            <Button
              className="font-bold uppercase"
              color="primary"
              radius="none"
              onPress={() => router.push("/submit")}
            >
              Initialize First Failure
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card
                  isPressable
                  className="h-full border-2 border-foreground bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer rounded-none group"
                  radius="none"
                  onPress={() => router.push(`/projects/${project.id}`)}
                >
                  <CardHeader className="border-b-2 border-foreground px-4 py-2 bg-content2 flex justify-between items-center">
                    <div className="font-mono text-xs uppercase flex gap-2 items-center">
                      <div className="w-3 h-3 bg-red-500 border border-black" />
                      <div className="w-3 h-3 bg-yellow-500 border border-black" />
                      <div className="w-3 h-3 bg-green-500 border border-black" />
                      <span className="ml-2 text-foreground/70">
                        user@{project.author.username}:~/projects/
                        {project.title.toLowerCase().replace(/\s+/g, "-")}
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold bg-primary text-black px-2 py-0.5">
                      ERR_CODE_{index + 1}
                    </div>
                  </CardHeader>
                  <CardBody className="p-0">
                    <div className="flex flex-col sm:flex-row h-full">
                      {/* Image Section */}
                      {(project.logoUrl ||
                        project.imageUrl ||
                        project.galleryUrls[0]) && (
                        <div className="w-full sm:w-32 h-32 sm:h-auto border-b-2 sm:border-b-0 sm:border-r-2 border-foreground relative shrink-0 overflow-hidden">
                          <Image
                            fill
                            alt={project.title}
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                            src={
                              project.logoUrl ||
                              project.imageUrl ||
                              project.galleryUrls[0]
                            }
                          />
                          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply group-hover:bg-transparent transition-all" />
                        </div>
                      )}

                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-xl font-mono font-bold mb-2 uppercase truncate">
                          {project.title}
                        </h3>
                        <p className="text-sm font-mono text-foreground/80 line-clamp-2 mb-4 flex-1">
                          {">"} {project.tagline}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-auto">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs font-mono border border-foreground bg-content2 uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                  <CardFooter className="border-t-2 border-foreground bg-background px-4 py-3 flex justify-between items-center font-mono text-sm">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1">
                        <span className="text-primary font-bold">↑</span>{" "}
                        {project.votesCount} VOTES
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-foreground/50">💬</span>{" "}
                        {project.commentsCount}
                      </span>
                    </div>
                    <div className="text-xs text-foreground/50 uppercase">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div className="mt-12 text-center">
            <Button
              className="font-mono uppercase border-2 border-dashed border-foreground w-full py-8 hover:bg-primary hover:border-solid transition-all"
              radius="none"
              variant="ghost"
              onPress={() => router.push("/projects")}
            >
              [ LOAD_MORE_FAILURES ]
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
