import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
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

    const uploadDir = join(process.cwd(), "public", "uploads", "projects");

    // 创建上传目录
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // 目录可能已存在，忽略错误
    }

    const uploadedFiles = [];

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

      // 写入文件
      const bytes = await file.arrayBuffer();
      const buffer = new Uint8Array(bytes);

      const filepath = join(uploadDir, filename);

      await writeFile(filepath, buffer);

      uploadedFiles.push({
        filename,
        url: `/uploads/projects/${filename}`,
        originalName: file.name,
        size: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("上传错误:", error);

    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
