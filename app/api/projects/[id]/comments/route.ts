import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 获取项目评论列表
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;

    // 检查项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, authorId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    // 获取所有评论，包含嵌套回复
    const comments = await prisma.comment.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [
        { isPinned: "desc" }, // 置顶评论优先
        { createdAt: "asc" }, // 然后按时间排序
      ],
    });

    // 只获取顶级评论（parentId为null的评论）
    const topLevelComments = comments.filter(
      (comment) => comment.parentId === null,
    );

    // 格式化响应数据
    const formattedComments = topLevelComments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      isPinned: comment.isPinned,
      isAuthor: comment.userId === project.authorId,
      author: comment.user,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        isAuthor: reply.userId === project.authorId,
        author: reply.user,
      })),
    }));

    return NextResponse.json({
      comments: formattedComments,
      total: topLevelComments.length,
    });
  } catch (error) {
    console.error("获取评论失败:", error);

    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 发布新评论
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { content, parentId } = body;
    const { id: projectId } = await params;
    const userId = session.user.id;

    // 验证内容
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "评论内容不能为空" },
        { status: 400 },
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { success: false, error: "评论内容不超过1000字符" },
        { status: 400 },
      );
    }

    // 检查项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, authorId: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "项目不存在" },
        { status: 404 },
      );
    }

    // 如果是回复，检查父评论是否存在
    if (parentId) {
      const parentComment = await prisma.comment.findFirst({
        where: {
          id: parentId,
          projectId: projectId,
        },
      });

      if (!parentComment) {
        return NextResponse.json(
          { success: false, error: "父评论不存在" },
          { status: 404 },
        );
      }
    }

    // 检查是否是创作者的第一条评论（需要置顶）
    let isPinned = false;

    if (!parentId && userId === project.authorId) {
      const existingAuthorComment = await prisma.comment.findFirst({
        where: {
          projectId,
          userId: project.authorId,
          parentId: null, // 只检查顶级评论
        },
      });

      isPinned = !existingAuthorComment; // 如果创作者还没有顶级评论，则置顶
    }

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId,
        projectId,
        parentId: parentId || null,
        isPinned,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        isPinned: comment.isPinned,
        isAuthor: comment.userId === project.authorId,
        author: comment.user,
        replies: [],
      },
    });
  } catch (error) {
    console.error("发布评论失败:", error);

    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 },
    );
  }
}
