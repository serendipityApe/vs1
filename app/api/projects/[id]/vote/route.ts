import { NextRequest, NextResponse } from "next/server";

import {
  getUserFromRequest,
  supabase,
  setSessionCookies,
} from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, session } = await getUserFromRequest(req as Request);

    const makeResponse = (body: any, opts?: any) => {
      const res = NextResponse.json(body, opts);

      if (session?.isRefreshed) {
        try {
          setSessionCookies(res, session);
        } catch {
          // ignore
        }
      }

      return res;
    };

    if (!user?.id) {
      return makeResponse({ success: false, error: "未登录" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;
    const { id: projectId } = await params;
    const userId = user.id;

    if (!["upvote", "remove"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "无效的操作" },
        { status: 400 },
      );
    }

    // 检查项目是否存在并获取作者
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("id,author_id")
      .eq("id", projectId)
      .limit(1);

    if (projectError) {
      // eslint-disable-next-line no-console
      console.error("supabase project fetch error:", projectError);

      return NextResponse.json(
        { success: false, error: "服务器错误" },
        { status: 500 },
      );
    }

    const project = projectData?.[0] ?? null;

    if (!project) {
      return NextResponse.json(
        { success: false, error: "项目不存在" },
        { status: 404 },
      );
    }

    // 检查用户不能给自己的项目投票
    if (project.author_id === userId) {
      return NextResponse.json(
        { success: false, error: "不能给自己的项目投票" },
        { status: 400 },
      );
    }

    // 检查当前投票状态
    const { data: existingVoteData, error: existingVoteError } = await supabase
      .from("votes")
      .select("id")
      .match({ user_id: userId, project_id: projectId });

    if (existingVoteError) {
      void existingVoteError;
    }

    const existingVote =
      Array.isArray(existingVoteData) && existingVoteData.length > 0;

    if (action === "upvote") {
      if (existingVote) {
        return NextResponse.json(
          { success: false, error: "已经投过票了" },
          { status: 400 },
        );
      }

      // 创建投票
      const { error: createError } = await supabase
        .from("votes")
        .insert({ user_id: userId, project_id: projectId });

      if (createError) {
        // eslint-disable-next-line no-console
        console.error("supabase create vote error:", createError);

        return NextResponse.json(
          { success: false, error: "服务器错误" },
          { status: 500 },
        );
      }
    } else if (action === "remove") {
      if (!existingVote) {
        return NextResponse.json(
          { success: false, error: "尚未投票" },
          { status: 400 },
        );
      }

      // 删除投票
      const { error: deleteError } = await supabase
        .from("votes")
        .delete()
        .match({ user_id: userId, project_id: projectId });

      if (deleteError) {
        // eslint-disable-next-line no-console
        console.error("supabase delete vote error:", deleteError);

        return NextResponse.json(
          { success: false, error: "服务器错误" },
          { status: 500 },
        );
      }
    }

    // 获取更新后的投票数
    const { count, error: countError } = await supabase
      .from("votes")
      .select("id", { count: "exact" })
      .eq("project_id", projectId);

    if (countError) {
      void countError;
    }

    const votesCount = typeof count === "number" ? count : 0;

    const hasVoted = action === "upvote";

    return NextResponse.json({
      success: true,
      votesCount,
      hasVoted,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("投票失败:", error);

    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 },
    );
  }
}
