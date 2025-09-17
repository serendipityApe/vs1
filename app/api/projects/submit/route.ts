import { NextRequest, NextResponse } from "next/server";

import {
  getUserFromRequest,
  supabase,
  setSessionCookies,
} from "@/lib/supabase";

export async function POST(req: NextRequest) {
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
      return makeResponse(
        { success: false, errors: ["未登录"] },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      title,
      tagline,
      url,
      confession,
      imageUrl,
      logoUrl,
      galleryUrls,
      tags,
      failureType,
    } = body;

    // 基础验证
    if (!title || title.length > 100) {
      return NextResponse.json(
        { success: false, errors: ["标题必填且不超过100字符"] },
        { status: 400 },
      );
    }

    if (!tagline || tagline.length > 60) {
      return NextResponse.json(
        { success: false, errors: ["一句话简介必填且不超过60字符"] },
        { status: 400 },
      );
    }

    if (!confession || confession.length > 2000) {
      return NextResponse.json(
        { success: false, errors: ["忏悔录必填且不超过2000字符"] },
        { status: 400 },
      );
    }

    if (url && !isValidUrl(url)) {
      return NextResponse.json(
        { success: false, errors: ["URL格式不正确"] },
        { status: 400 },
      );
    }

    // 处理标签 - 将数组转换为JSON字符串
    let tagsString = "[]";

    if (tags && Array.isArray(tags)) {
      const validTags = tags
        .filter((tag) => typeof tag === "string" && tag.trim())
        .slice(0, 5) // 最多5个标签
        .map((tag) => tag.trim());

      tagsString = JSON.stringify(validTags);
    }

    // 处理图片 id 数组（前端现在应传 storagePath 或 id），将数组转换为 JSON 字符串
    let galleryIdsString = null;

    if (galleryUrls && Array.isArray(galleryUrls)) {
      const validIds = galleryUrls
        .filter((id) => typeof id === "string" && id.trim())
        .slice(0, 5); // 最多5张图片

      if (validIds.length > 0) {
        galleryIdsString = JSON.stringify(validIds);
      }
    }

    // 创建项目（Supabase）
    // 为了兼容现有 DB schema，我们把 storage id (例如 projects/xxx.png) 存入
    // 现有的 `logo_url` 与 `gallery_urls` 字段中。前端和读取逻辑会把这些值视为 ids。

    const { data: inserted, error: insertError } = await supabase
      .from("projects")
      .insert({
        title,
        tagline,
        url: url || null,
        confession,
        image_url: imageUrl || null,
        logo_url: logoUrl || null,
        gallery_urls: galleryIdsString,
        tags: tagsString,
        failure_type: failureType || null,
        author_id: user.id,
      })
      .select(
        "id, title, tagline, url, confession, image_url, logo_url, gallery_urls, tags, failure_type, created_at, author:users(username,avatar_url)",
      );

    if (insertError) {
      // eslint-disable-next-line no-console
      console.error("supabase insert project error:", insertError);

      return NextResponse.json(
        { success: false, errors: ["服务器错误"] },
        { status: 500 },
      );
    }

    const project = inserted?.[0];
    const authorObj = Array.isArray(project?.author)
      ? (project.author?.[0] ?? null)
      : (project.author ?? null);

    // 计算 counts
    const { count: votesCount } = await supabase
      .from("votes")
      .select("id", { count: "exact" })
      .eq("project_id", project.id);
    const { count: commentsCount } = await supabase
      .from("comments")
      .select("id", { count: "exact" })
      .eq("project_id", project.id);

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        title: project.title,
        tagline: project.tagline,
        url: project.url,
        confession: project.confession,
        imageUrl: project.image_url ?? null,
        logoId: project.logo_url ?? null,
        galleryIds: project.gallery_urls
          ? JSON.parse(project.gallery_urls)
          : [],
        tags: project.tags ? JSON.parse(project.tags) : [],
        failureType: project.failure_type ?? null,
        createdAt: project.created_at
          ? new Date(project.created_at).toISOString()
          : null,
        votesCount: typeof votesCount === "number" ? votesCount : 0,
        commentsCount: typeof commentsCount === "number" ? commentsCount : 0,
        author: authorObj
          ? {
              username: authorObj.username,
              avatarUrl: authorObj.avatar_url ?? null,
            }
          : null,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("项目提交失败:", error);

    return NextResponse.json(
      { success: false, errors: ["服务器错误"] },
      { status: 500 },
    );
  }
}

function isValidUrl(string: string) {
  try {
    new URL(string);

    return true;
  } catch {
    return false;
  }
}
