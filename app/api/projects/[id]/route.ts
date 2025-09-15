import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: projectId } = await params;

    // 获取项目详情
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    // 检查当前用户是否已投票
    let hasVoted = false;

    if (session?.user?.id) {
      const vote = await prisma.vote.findUnique({
        where: {
          userId_projectId: {
            userId: session.user.id,
            projectId: projectId,
          },
        },
      });

      hasVoted = !!vote;
    }

    // 格式化响应数据
    const formattedProject = {
      id: project.id,
      title: project.title,
      tagline: project.tagline,
      url: project.url,
      confession: project.confession,
      imageUrl: project.imageUrl,
      logoUrl: project.logoUrl,
      galleryUrls: project.galleryUrls ? JSON.parse(project.galleryUrls) : [],
      tags: JSON.parse(project.tags),
      failureType: project.failureType,
      createdAt: project.createdAt.toISOString(),
      votesCount: project._count.votes,
      hasVoted,
      author: project.author,
    };

    return NextResponse.json({
      project: formattedProject,
    });
  } catch (error) {
    console.error("获取项目详情失败:", error);

    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
