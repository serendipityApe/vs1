import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
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

    // 处理图片URL数组 - 将数组转换为JSON字符串
    let galleryUrlsString = null;

    if (galleryUrls && Array.isArray(galleryUrls)) {
      const validUrls = galleryUrls
        .filter((url) => typeof url === "string" && url.trim())
        .slice(0, 5); // 最多5张图片

      if (validUrls.length > 0) {
        galleryUrlsString = JSON.stringify(validUrls);
      }
    }

    // 创建项目
    const project = await prisma.project.create({
      data: {
        title,
        tagline,
        url: url || null,
        confession,
        imageUrl: imageUrl || null,
        logoUrl: logoUrl || null,
        galleryUrls: galleryUrlsString,
        tags: tagsString,
        failureType: failureType || null,
        authorId: session.user.id,
      },
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

    return NextResponse.json({
      success: true,
      project: {
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
        commentsCount: project._count.comments,
        author: project.author,
      },
    });
  } catch (error) {
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
