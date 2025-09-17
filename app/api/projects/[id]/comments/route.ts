import { NextRequest, NextResponse } from "next/server";

import {
  getUserFromRequest,
  supabase,
  setSessionCookies,
} from "@/lib/supabase";

// 获取项目评论列表
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;

    // 检查项目是否存在
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("id,author_id")
      .eq("id", projectId)
      .limit(1);

    if (projectError) {
      // eslint-disable-next-line no-console
      console.error("supabase project fetch error:", projectError);

      return NextResponse.json({ error: "服务器错误" }, { status: 500 });
    }

    const project = projectData?.[0] ?? null;

    if (!project) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    // 获取所有评论（包含回复）
    const { data: commentsData, error: commentsError } = await supabase
      .from("comments")
      .select(
        `*, user:users(id,username,avatar_url), replies:comments(id,content,created_at,user_id,parent_id,is_pinned,user:users(id,username,avatar_url))`,
      )
      .eq("project_id", projectId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: true });

    if (commentsError) {
      // eslint-disable-next-line no-console
      console.error("supabase comments fetch error:", commentsError);

      return NextResponse.json({ error: "服务器错误" }, { status: 500 });
    }

    const comments = commentsData ?? [];

    // 只获取顶级评论（parent_id为null的评论）
    const topLevelComments = comments.filter((c: any) => c.parent_id === null);

    // 格式化响应数据，规范 user 字段（supabase 有时会返回数组）
    const formattedComments = topLevelComments.map((comment: any) => {
      const userObj = Array.isArray(comment.user)
        ? comment.user[0]
        : comment.user;

      return {
        id: comment.id,
        content: comment.content,
        createdAt: new Date(comment.created_at).toISOString(),
        isPinned: comment.is_pinned,
        isAuthor: comment.user_id === project.author_id,
        author: userObj
          ? {
              id: userObj.id,
              username: userObj.username,
              avatarUrl: userObj.avatar_url ?? null,
            }
          : null,
        replies: Array.isArray(comment.replies)
          ? comment.replies.map((reply: any) => {
              const replyUser = Array.isArray(reply.user)
                ? reply.user[0]
                : reply.user;

              return {
                id: reply.id,
                content: reply.content,
                createdAt: new Date(reply.created_at).toISOString(),
                isAuthor: reply.user_id === project.author_id,
                author: replyUser
                  ? {
                      id: replyUser.id,
                      username: replyUser.username,
                      avatarUrl: replyUser.avatar_url ?? null,
                    }
                  : null,
              };
            })
          : [],
      };
    });

    return NextResponse.json({
      comments: formattedComments,
      total: topLevelComments.length,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
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
    const { content, parentId } = body;
    const { id: projectId } = await params;
    const userId = user.id;

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

    // 如果是回复，检查父评论是否存在
    if (parentId) {
      const { data: parentCommentData } = await supabase
        .from("comments")
        .select("id")
        .match({ id: parentId, project_id: projectId });

      const parentComment = parentCommentData?.[0];

      if (!parentComment) {
        return NextResponse.json(
          { success: false, error: "父评论不存在" },
          { status: 404 },
        );
      }
    }

    // 检查是否是创作者的第一条评论（需要置顶）
    let isPinned = false;

    if (!parentId && userId === project.author_id) {
      const { data: existingAuthorCommentData } = await supabase
        .from("comments")
        .select("id")
        .match({
          project_id: projectId,
          user_id: project.author_id,
          parent_id: null,
        })
        .limit(1);

      const existingAuthorComment = existingAuthorCommentData?.[0];

      isPinned = !existingAuthorComment; // 如果创作者还没有顶级评论，则置顶
    }

    // 创建评论
    const { data: insertedData, error: insertError } = await supabase
      .from("comments")
      .insert({
        content: content.trim(),
        user_id: userId,
        project_id: projectId,
        parent_id: parentId || null,
        is_pinned: isPinned,
      })
      .select(
        "id,content,created_at,is_pinned,user_id,user:users(id,username,avatar_url)",
      );

    if (insertError) {
      // eslint-disable-next-line no-console
      console.error("supabase insert comment error:", insertError);

      return NextResponse.json(
        { success: false, error: "服务器错误" },
        { status: 500 },
      );
    }

    const comment = insertedData?.[0];

    const commentUser = comment
      ? Array.isArray(comment.user)
        ? comment.user[0]
        : comment.user
      : null;

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: new Date(comment.created_at).toISOString(),
        isPinned: comment.is_pinned,
        isAuthor: comment.user_id === project.author_id,
        author: commentUser
          ? {
              id: commentUser.id,
              username: commentUser.username,
              avatarUrl: commentUser.avatar_url ?? null,
            }
          : null,
        replies: [],
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("发布评论失败:", error);

    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 },
    );
  }
}
