import { NextRequest, NextResponse } from "next/server";

import {
  getUserFromRequest,
  supabase,
  setSessionCookies,
  createSignedUrls,
} from "@/lib/supabase";

export async function GET(
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
    const { id: projectId } = await params;

    // 获取项目详情（从 Supabase） - 使用 DB 列名
    const { data: projectsData, error: projectError } = await supabase
      .from("projects")
      .select(
        `id,title,tagline,url,confession,image_url,logo_url,gallery_urls,tags,failure_type,created_at,author:users(id,username,avatar_url),votes(id),comments(id)`,
      )
      .eq("id", projectId)
      .limit(1);

    if (projectError) {
      // eslint-disable-next-line no-console
      console.error("supabase project fetch error:", projectError);

      return makeResponse({ error: "服务器错误" }, { status: 500 });
    }

    const project = projectsData?.[0] ?? null;

    if (!project) {
      return makeResponse({ error: "项目不存在" }, { status: 404 });
    }

    // 检查当前用户是否已投票
    let hasVoted = false;

    if (user?.id) {
      const { data: voteData, error: voteError } = await supabase
        .from("votes")
        .select("id")
        .match({ user_id: user.id, project_id: projectId });

      if (voteError) {
        void voteError;
      }

      hasVoted = Array.isArray(voteData) && voteData.length > 0;
    }

    // 格式化响应数据并将 DB 字段映射回 camelCase
    const authorObj = Array.isArray(project.author)
      ? (project.author?.[0] ?? null)
      : (project.author ?? null);
    // prepare signed URLs for logo/gallery if any
    const logoId = project.logo_url ?? null;
    const galleryIds = project.gallery_urls
      ? JSON.parse(project.gallery_urls)
      : [];

    const allPaths = [] as string[];

    if (logoId) allPaths.push(logoId);
    if (Array.isArray(galleryIds) && galleryIds.length)
      allPaths.push(...galleryIds);

    const signedMap =
      allPaths.length > 0 ? await createSignedUrls(allPaths) : {};

    const formattedProject = {
      id: project.id,
      title: project.title,
      tagline: project.tagline,
      url: project.url,
      confession: project.confession,
      imageUrl: project.image_url ?? null,
      // return signed URLs where possible
      logoUrl:
        logoId && signedMap[logoId] ? signedMap[logoId] : (logoId ?? null),
      galleryUrls: Array.isArray(galleryIds)
        ? galleryIds.map((g: string) => signedMap[g] || g)
        : [],
      tags: project.tags ? JSON.parse(project.tags) : [],
      failureType: project.failure_type ?? null,
      createdAt: project.created_at
        ? new Date(project.created_at).toISOString()
        : null,
      votesCount: Array.isArray(project.votes) ? project.votes.length : 0,
      hasVoted,
      author: authorObj
        ? {
            id: authorObj.id,
            username: authorObj.username,
            avatarUrl: authorObj.avatar_url ?? null,
          }
        : null,
    };

    return makeResponse({ project: formattedProject });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("获取项目详情失败:", error);

    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
