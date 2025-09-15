import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");
    const sort = searchParams.get("sort") || "votes"; // 'votes' | 'recent'
    const date = searchParams.get("date"); // YYYY-MM-DD

    let whereClause = {};

    // 如果指定了日期，筛选当天的项目
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);

      nextDay.setDate(nextDay.getDate() + 1);

      whereClause = {
        createdAt: {
          gte: targetDate,
          lt: nextDay,
        },
      };
    }

    // 根据排序类型构建查询
    let orderBy = {};

    if (sort === "recent") {
      orderBy = { createdAt: "desc" };
    } else {
      // 按投票数排序 (votes)，需要通过关系查询
      // 在 SQLite 中，我们需要使用子查询或者分组查询
      // 为简化，先用创建时间排序，后面可以优化为投票数
      orderBy = { createdAt: "desc" };
    }

    // 获取项目列表
    const projects = await prisma.project.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy,
      include: {
        author: {
          select: {
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

    // 获取总数
    const total = await prisma.project.count({
      where: whereClause,
    });

    // 如果是按投票数排序，需要在内存中重新排序
    let sortedProjects = projects;

    if (sort === "votes") {
      sortedProjects = projects.sort((a, b) => b._count.votes - a._count.votes);
    }

    // 格式化响应数据
    const formattedProjects = sortedProjects.map((project) => ({
      id: project.id,
      title: project.title,
      tagline: project.tagline,
      url: project.url,
      imageUrl: project.imageUrl,
      logoUrl: project.logoUrl,
      galleryUrls: project.galleryUrls ? JSON.parse(project.galleryUrls) : [],
      tags: JSON.parse(project.tags),
      failureType: project.failureType,
      createdAt: project.createdAt.toISOString(),
      votesCount: project._count.votes,
      commentsCount: project._count.comments,
      author: project.author,
    }));

    return NextResponse.json({
      projects: formattedProjects,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("获取项目列表失败:", error);

    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
