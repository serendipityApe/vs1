import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

const BUCKET = "project_show";
const SIGNED_EXPIRES = 7 * 24 * 60 * 60; // 7 days

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const paths: string[] = Array.isArray(body.paths) ? body.paths : [];

    if (paths.length === 0) {
      return NextResponse.json({ urls: {} });
    }

    const result: Record<string, string | null> = {};

    for (const path of paths) {
      try {
        const { data, error } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(path, SIGNED_EXPIRES);

        if (error || !data?.signedUrl) {
          result[path] = null;
        } else {
          result[path] = data.signedUrl;
        }
      } catch {
        result[path] = null;
      }
    }

    return NextResponse.json({ urls: result });
  } catch {
    return NextResponse.json({ urls: {} }, { status: 500 });
  }
}
