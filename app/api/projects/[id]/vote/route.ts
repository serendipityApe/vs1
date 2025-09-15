import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { action } = body;
    const { id: projectId } = await params;
    const userId = session.user.id;

    if (!["upvote", "remove"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "无效的操作" },
        { status: 400 },
      );
    }

    // 检查项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "项目不存在" },
        { status: 404 },
      );
    }

    // 检查用户不能给自己的项目投票
    if (project.authorId === userId) {
      return NextResponse.json(
        { success: false, error: "不能给自己的项目投票" },
        { status: 400 },
      );
    }

    // 检查当前投票状态
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (action === "upvote") {
      if (existingVote) {
        return NextResponse.json(
          { success: false, error: "已经投过票了" },
          { status: 400 },
        );
      }

      // 创建投票
      await prisma.vote.create({
        data: {
          userId,
          projectId,
        },
      });
    } else if (action === "remove") {
      if (!existingVote) {
        return NextResponse.json(
          { success: false, error: "尚未投票" },
          { status: 400 },
        );
      }

      // 删除投票
      await prisma.vote.delete({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });
    }

    // 获取更新后的投票数
    const votesCount = await prisma.vote.count({
      where: { projectId },
    });

    const hasVoted = action === "upvote";

    return NextResponse.json({
      success: true,
      votesCount,
      hasVoted,
    });
  } catch (error) {
    console.error("投票失败:", error);

    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 },
    );
  }
}
