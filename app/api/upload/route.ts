import { NextRequest, NextResponse } from "next/server";

import {
  supabase,
  getUserFromRequest,
  setSessionCookies,
} from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { user, session } = await getUserFromRequest(request as Request);

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

    if (!user) {
      return makeResponse({ error: "未授权" }, { status: 401 });
    }

    const data = await request.formData();
    const files: File[] = [];

    // 收集所有文件
    for (const [key, value] of data.entries()) {
      if (key.startsWith("file") && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "没有文件上传" }, { status: 400 });
    }

    const uploadedFiles = [];

    // bucket and signed url expiry (7 days)
    const BUCKET = "project_show";
    const SIGNED_EXPIRES = 7 * 24 * 60 * 60; // 7 days in seconds

    for (const file of files) {
      // 验证文件类型
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `文件 ${file.name} 大小超过5MB限制` },
          { status: 400 },
        );
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const extension = file.name.split(".").pop();
      const filename = `${timestamp}-${random}.${extension}`;

      // 准备上传到 supabase storage，放到 projects/ 目录下
      const storagePath = `projects/${filename}`;

      try {
        const bytes = await file.arrayBuffer();
        const buffer = new Uint8Array(bytes);

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, buffer, {
            contentType: file.type,
          });

        if (uploadError) {
          return NextResponse.json(
            { error: "上传到存储失败" },
            { status: 500 },
          );
        }

        // 生成 7 天的签名 URL
        const { data: urlData, error: urlError } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(storagePath, SIGNED_EXPIRES);

        if (urlError || !urlData?.signedUrl) {
          return NextResponse.json(
            { error: "生成签名 URL 失败" },
            { status: 500 },
          );
        }

        uploadedFiles.push({
          filename,
          url: urlData.signedUrl,
          originalName: file.name,
          size: file.size,
          storagePath,
        });
      } catch {
        return NextResponse.json({ error: "处理文件时出错" }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch {
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
