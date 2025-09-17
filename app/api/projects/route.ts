import { NextRequest, NextResponse } from "next/server";

import { supabase, createSignedUrls } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");
    const sort = searchParams.get("sort") || "votes"; // 'votes' | 'recent'
    const date = searchParams.get("date"); // YYYY-MM-DD

    // 构建基础查询：选取项目字段和关联作者、投票、评论的 id 用于计数
    // 依赖 Supabase 表名为: projects, users, votes, comments（与 prisma schema 匹配）
    let query = supabase
      .from("projects")
      .select(
        `id,title,tagline,url,image_url,logo_url,gallery_urls,tags,failure_type,created_at,author:users(id,username,avatar_url),votes(id),comments(id)`,
        { count: "exact" },
      );

    // 日期过滤（当天范围）
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);

      nextDay.setDate(nextDay.getDate() + 1);

      // Supabase uses ISO strings for timestamp comparisons
      query = query
        .gte("created_at", targetDate.toISOString())
        .lt("created_at", nextDay.toISOString());
    }

    // 排序：若按最近则直接按 created_at 排序；按票数则先用 created_at 排序，后面在内存中根据 votes 长度排序
    if (sort === "recent") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // 分页使用 range
    const from = offset;
    const to = Math.max(offset + limit - 1, offset);

    const { data: rows, error, count } = await query.range(from, to);

    if (error) {
      // keep minimal server-side logging
      // eslint-disable-next-line no-console
      console.error("Supabase projects query error", error?.message || error);

      return NextResponse.json({ error: "服务器错误" }, { status: 500 });
    }

    const projects = (rows || []) as any[];

    // 计算票数与评论数并按需排序
    let sortedProjects = projects.map((p) => {
      const authorObj = Array.isArray(p.author) ? p.author[0] : p.author;

      return {
        ...p,
        // map DB fields to camelCase expected by frontend
        imageUrl: p.image_url ?? null,
        logoUrl: p.logo_url ?? null,
        galleryUrls: p.gallery_urls ? tryParseJson(p.gallery_urls) : [],
        tags: p.tags ? tryParseJson(p.tags) : [],
        failureType: p.failure_type ?? null,
        createdAt: p.created_at ? new Date(p.created_at).toISOString() : null,
        votesCount: Array.isArray(p.votes) ? p.votes.length : 0,
        commentsCount: Array.isArray(p.comments) ? p.comments.length : 0,
        author: authorObj
          ? {
              id: authorObj.id,
              username: authorObj.username,
              avatarUrl: authorObj.avatar_url ?? null,
            }
          : null,
      };
    });

    if (sort === "votes") {
      sortedProjects = sortedProjects.sort((a, b) => {
        return b.votesCount - a.votesCount;
      });
    }

    // collect possible storage paths to sign (logo and gallery ids)
    const allPathsToSign: string[] = [];

    sortedProjects.forEach((project) => {
      if (project.logoUrl) allPathsToSign.push(project.logoUrl);
      if (Array.isArray(project.galleryUrls) && project.galleryUrls.length)
        allPathsToSign.push(...project.galleryUrls);
    });

    const signedMap = await createSignedUrls(allPathsToSign);

    const formattedProjects = sortedProjects.map((project) => ({
      id: project.id,
      title: project.title,
      tagline: project.tagline,
      url: project.url,
      imageUrl: project.imageUrl ?? null,
      logoUrl:
        project.logoUrl && signedMap[project.logoUrl]
          ? signedMap[project.logoUrl]
          : (project.logoUrl ?? null),
      galleryUrls: Array.isArray(project.galleryUrls)
        ? project.galleryUrls.map((g: string) => signedMap[g] || g)
        : [],
      tags: project.tags ?? [],
      failureType: project.failureType ?? null,
      createdAt: project.createdAt ?? new Date().toISOString(),
      votesCount: project.votesCount ?? 0,
      commentsCount: project.commentsCount ?? 0,
      author: project.author ?? null,
    }));

    const total = typeof count === "number" ? count : formattedProjects.length;

    return NextResponse.json({
      projects: formattedProjects,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("获取项目列表失败:", (error as any)?.message || error);

    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

function tryParseJson(input: any) {
  if (!input) return [];

  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch (e) {
      // not JSON, return as single-item array if it's non-empty string
      void e;

      return input ? [input] : [];
    }
  }

  if (Array.isArray(input)) return input;

  return [];
}
